#!/usr/bin/env python3
"""
Prop Trader Backtest Simulation
Scalps NVDA and TSLA using VIX and QQQ as filters.
4 Strategies over last 2 years of daily data.
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# CONFIGURATION
# =============================================================================
STARTING_CAPITAL = 50_000
RISK_PER_TRADE_PCT = 0.005  # 0.5% of capital
TICKERS = ['NVDA', 'TSLA']
FILTER_TICKERS = ['QQQ', '^VIX']
END_DATE = datetime.now()
START_DATE = END_DATE - timedelta(days=730)  # ~2 years

OUTPUT_PATH = '/home/z/my-project/download/backtest_results.xlsx'

print("=" * 70)
print("  PROP TRADER BACKTEST — NVDA/TSLA Scalping System")
print("=" * 70)
print(f"  Period: {START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}")
print(f"  Starting Capital: ${STARTING_CAPITAL:,.0f}")
print(f"  Risk per Trade: {RISK_PER_TRADE_PCT*100:.1f}% of capital")
print()

# =============================================================================
# DATA DOWNLOAD
# =============================================================================
print("[1/5] Downloading market data...")

data = {}
for ticker in TICKERS + FILTER_TICKERS:
    print(f"  -> {ticker}...", end=" ", flush=True)
    df = yf.download(ticker, start=START_DATE, end=END_DATE, progress=False)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    data[ticker] = df
    print(f"{len(df)} rows")

# =============================================================================
# DATA PREPARATION
# =============================================================================
print("[2/5] Preparing aligned dataset...")

nvda = data['NVDA'][['Open', 'High', 'Low', 'Close']].copy()
tsla = data['TSLA'][['Open', 'High', 'Low', 'Close']].copy()
qqq = data['QQQ'][['Open', 'Close']].copy()
vix = data['^VIX']['Close'].copy()

# Build unified DataFrame on NVDA dates (most liquid)
df = pd.DataFrame(index=nvda.index)
df['NVDA_Open'] = nvda['Open']
df['NVDA_High'] = nvda['High']
df['NVDA_Low'] = nvda['Low']
df['NVDA_Close'] = nvda['Close']
df['TSLA_Open'] = tsla['Open']
df['TSLA_High'] = tsla['High']
df['TSLA_Low'] = tsla['Low']
df['TSLA_Close'] = tsla['Close']
df['QQQ_Open'] = qqq['Open']
df['QQQ_Close'] = qqq['Close']
df['VIX_Close'] = vix

# Forward-fill any NaN
df = df.ffill().bfill()

# Derived columns
df['QQQ_Daily_Return'] = df['QQQ_Close'].pct_change()
df['QQQ_Gap'] = (df['QQQ_Open'] / df['QQQ_Close'].shift(1)) - 1
df['VIX_Change'] = df['VIX_Close'].diff()
df.dropna(inplace=True)

print(f"  -> {len(df)} trading days aligned")
print(f"  -> Date range: {df.index[0].strftime('%Y-%m-%d')} to {df.index[-1].strftime('%Y-%m-%d')}")

# =============================================================================
# BACKTEST ENGINE
# =============================================================================
print("[3/5] Running backtests...")

def run_strategy(df, strategy_name, generate_signals_fn, sl_pct, tp_pct, risk_pct=RISK_PER_TRADE_PCT):
    """
    Generic strategy backtester.
    
    generate_signals_fn(df) -> list of dicts with keys:
        'date', 'ticker', 'side' ('LONG'/'SHORT'), 'entry_price', 'reason'
    """
    signals = generate_signals_fn(df)
    
    trades = []
    capital = STARTING_CAPITAL
    peak_capital = capital
    max_drawdown = 0.0
    equity_curve = []  # (date, equity)
    
    for sig in signals:
        risk_amount = capital * risk_pct
        if sig['side'] == 'LONG':
            entry = sig['entry_price']
            sl_price = entry * (1 - sl_pct)
            tp_price = entry * (1 + tp_pct)
        else:  # SHORT
            entry = sig['entry_price']
            sl_price = entry * (1 + sl_pct)
            tp_price = entry * (1 - tp_pct)
        
        # Calculate position size based on risk
        price_risk_per_share = abs(entry - sl_price)
        if price_risk_per_share <= 0:
            continue
        shares = int(risk_amount / price_risk_per_share)
        if shares <= 0:
            continue
        
        # Simulate intraday: check SL and TP against High/Low
        row = df.loc[sig['date']]
        if sig['ticker'] == 'NVDA':
            high = row['NVDA_High']
            low = row['NVDA_Low']
            close = row['NVDA_Close']
        else:
            high = row['TSLA_High']
            low = row['TSLA_Low']
            close = row['TSLA_Close']
        
        # Determine trade outcome
        exit_price = entry  # default: no exit (flat)
        if sig['side'] == 'LONG':
            # Check SL first (worst case), then TP
            if low <= sl_price:
                exit_price = sl_price
                outcome = 'SL'
            elif high >= tp_price:
                exit_price = tp_price
                outcome = 'TP'
            else:
                exit_price = close
                outcome = 'EOD'
        else:  # SHORT
            if high >= sl_price:
                exit_price = sl_price
                outcome = 'SL'
            elif low <= tp_price:
                exit_price = tp_price
                outcome = 'TP'
            else:
                exit_price = close
                outcome = 'EOD'
        
        # Calculate P&L
        if sig['side'] == 'LONG':
            pnl = (exit_price - entry) * shares
            return_pct = (exit_price - entry) / entry
        else:
            pnl = (entry - exit_price) * shares
            return_pct = (entry - exit_price) / entry
        
        capital += pnl
        
        # Track drawdown
        if capital > peak_capital:
            peak_capital = capital
        dd = (peak_capital - capital) / peak_capital
        if dd > max_drawdown:
            max_drawdown = dd
        
        trades.append({
            'Date': sig['date'],
            'Ticker': sig['ticker'],
            'Side': sig['side'],
            'Entry': round(entry, 4),
            'Exit': round(exit_price, 4),
            'Shares': shares,
            'PnL': round(pnl, 2),
            'Return_Pct': round(return_pct * 100, 4),
            'Outcome': outcome,
            'Reason': sig.get('reason', ''),
            'Capital_After': round(capital, 2),
            'Risk_Amount': round(risk_amount, 2),
        })
        
        equity_curve.append((sig['date'], capital))
    
    trades_df = pd.DataFrame(trades)
    
    # Calculate metrics
    if len(trades_df) == 0:
        return {
            'name': strategy_name,
            'trades_df': trades_df,
            'total_trades': 0,
            'win_rate': 0,
            'profit_factor': 0,
            'total_return_pct': 0,
            'max_drawdown_pct': 0,
            'sharpe_ratio': 0,
            'avg_win': 0,
            'avg_loss': 0,
            'best_trade': 0,
            'worst_trade': 0,
            'max_consec_wins': 0,
            'max_consec_losses': 0,
            'gross_profit': 0,
            'gross_loss': 0,
            'final_capital': STARTING_CAPITAL,
            'equity_curve': [],
            'monthly_returns': pd.DataFrame(),
        }
    
    wins = trades_df[trades_df['PnL'] > 0]
    losses = trades_df[trades_df['PnL'] <= 0]
    
    gross_profit = wins['PnL'].sum() if len(wins) > 0 else 0
    gross_loss = abs(losses['PnL'].sum()) if len(losses) > 0 else 1  # avoid div/0
    
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    total_return_pct = ((capital - STARTING_CAPITAL) / STARTING_CAPITAL) * 100
    win_rate = (len(wins) / len(trades_df)) * 100 if len(trades_df) > 0 else 0
    
    avg_win = wins['Return_Pct'].mean() if len(wins) > 0 else 0
    avg_loss = losses['Return_Pct'].mean() if len(losses) > 0 else 0
    
    best_trade = trades_df['Return_Pct'].max()
    worst_trade = trades_df['Return_Pct'].min()
    
    # Consecutive wins/losses
    is_win = (trades_df['PnL'] > 0).values
    consec_wins = 0
    consec_losses = 0
    cur_w = 0
    cur_l = 0
    for w in is_win:
        if w:
            cur_w += 1
            cur_l = 0
        else:
            cur_l += 1
            cur_w = 0
        consec_wins = max(consec_wins, cur_w)
        consec_losses = max(consec_losses, cur_l)
    
    # Sharpe ratio (daily returns of the strategy)
    trades_df['Daily_Return_Strategy'] = trades_df['PnL'] / trades_df['Capital_After'].shift(1).fillna(STARTING_CAPITAL)
    mean_ret = trades_df['Daily_Return_Strategy'].mean()
    std_ret = trades_df['Daily_Return_Strategy'].std()
    sharpe = (mean_ret / std_ret) * np.sqrt(252) if std_ret > 0 else 0
    
    # Monthly breakdown
    trades_df['Month'] = pd.to_datetime(trades_df['Date']).dt.to_period('M')
    monthly = trades_df.groupby('Month')['PnL'].sum().reset_index()
    monthly['Month'] = monthly['Month'].astype(str)
    monthly.columns = ['Month', 'PnL']
    monthly['Return_Pct'] = (monthly['PnL'] / STARTING_CAPITAL) * 100
    monthly['Return_Pct'] = monthly['Return_Pct'].round(4)
    monthly['PnL'] = monthly['PnL'].round(2)
    
    metrics = {
        'name': strategy_name,
        'trades_df': trades_df,
        'total_trades': len(trades_df),
        'win_rate': round(win_rate, 2),
        'profit_factor': round(profit_factor, 4),
        'total_return_pct': round(total_return_pct, 2),
        'max_drawdown_pct': round(max_drawdown * 100, 2),
        'sharpe_ratio': round(sharpe, 4),
        'avg_win': round(avg_win, 4),
        'avg_loss': round(avg_loss, 4),
        'best_trade': round(best_trade, 4),
        'worst_trade': round(worst_trade, 4),
        'max_consec_wins': consec_wins,
        'max_consec_losses': consec_losses,
        'gross_profit': round(gross_profit, 2),
        'gross_loss': round(gross_loss, 2),
        'final_capital': round(capital, 2),
        'equity_curve': equity_curve,
        'monthly_returns': monthly,
    }
    
    print(f"  -> {strategy_name}: {metrics['total_trades']} trades | "
          f"WR: {metrics['win_rate']}% | "
          f"Return: {metrics['total_return_pct']}% | "
          f"PF: {metrics['profit_factor']} | "
          f"DD: {metrics['max_drawdown_pct']}%")
    
    return metrics


# =============================================================================
# STRATEGY DEFINITIONS
# =============================================================================

def strategy1_signals(df):
    """Tendencia Limpia: LONG when QQQ ret > 0 AND VIX < 18, SHORT when QQQ ret < 0 AND VIX > 18"""
    signals = []
    for idx, row in df.iterrows():
        qqq_ret = row['QQQ_Daily_Return']
        vix = row['VIX_Close']
        
        if qqq_ret > 0 and vix < 18:
            for ticker in TICKERS:
                entry = row[f'{ticker}_Open']
                signals.append({
                    'date': idx, 'ticker': ticker, 'side': 'LONG',
                    'entry_price': entry, 'reason': f'QQQ+{qqq_ret*100:.2f}% VIX={vix:.1f}'
                })
        elif qqq_ret < 0 and vix > 18:
            for ticker in TICKERS:
                entry = row[f'{ticker}_Open']
                signals.append({
                    'date': idx, 'ticker': ticker, 'side': 'SHORT',
                    'entry_price': entry, 'reason': f'QQQ{qqq_ret*100:.2f}% VIX={vix:.1f}'
                })
    return signals


def strategy2_signals(df):
    """Gap and Go: LONG when QQQ gaps up > 0.5% AND VIX < 18, SHORT when QQQ gaps down > 0.5% AND VIX > 18"""
    signals = []
    for idx, row in df.iterrows():
        qqq_gap = row['QQQ_Gap']
        vix = row['VIX_Close']
        
        if pd.notna(qqq_gap):
            if qqq_gap > 0.005 and vix < 18:
                for ticker in TICKERS:
                    entry = row[f'{ticker}_Open']
                    signals.append({
                        'date': idx, 'ticker': ticker, 'side': 'LONG',
                        'entry_price': entry, 'reason': f'Gap+{qqq_gap*100:.2f}% VIX={vix:.1f}'
                    })
            elif qqq_gap < -0.005 and vix > 18:
                for ticker in TICKERS:
                    entry = row[f'{ticker}_Open']
                    signals.append({
                        'date': idx, 'ticker': ticker, 'side': 'SHORT',
                        'entry_price': entry, 'reason': f'Gap{qqq_gap*100:.2f}% VIX={vix:.1f}'
                    })
    return signals


def strategy3_signals(df):
    """VIX Crash Reversal: LONG on day after VIX spikes > 3 points"""
    signals = []
    for idx, row in df.iterrows():
        vix_change = row['VIX_Change']
        if pd.notna(vix_change) and vix_change > 3.0:
            # Signal fires on NEXT day (the reversal day)
            next_idx_list = df.index[df.index > idx]
            if len(next_idx_list) > 0:
                next_idx = next_idx_list[0]
                next_row = df.loc[next_idx]
                for ticker in TICKERS:
                    entry = next_row[f'{ticker}_Open']
                    signals.append({
                        'date': next_idx, 'ticker': ticker, 'side': 'LONG',
                        'entry_price': entry,
                        'reason': f'VIX spike +{vix_change:.1f} prev day'
                    })
    return signals


def strategy4_signals(df):
    """Short en Miedo: SHORT when QQQ red AND VIX > 18"""
    signals = []
    for idx, row in df.iterrows():
        qqq_ret = row['QQQ_Daily_Return']
        vix = row['VIX_Close']
        
        if qqq_ret < 0 and vix > 18:
            for ticker in TICKERS:
                entry = row[f'{ticker}_Open']
                signals.append({
                    'date': idx, 'ticker': ticker, 'side': 'SHORT',
                    'entry_price': entry, 'reason': f'QQQ{qqq_ret*100:.2f}% VIX={vix:.1f}'
                })
    return signals


# Run all strategies
print()
results = []

s1 = run_strategy(df, "1. Tendencia Limpia", strategy1_signals, sl_pct=0.003, tp_pct=0.005)
results.append(s1)

s2 = run_strategy(df, "2. Gap and Go", strategy2_signals, sl_pct=0.003, tp_pct=0.005)
results.append(s2)

s3 = run_strategy(df, "3. VIX Crash Reversal", strategy3_signals, sl_pct=0.005, tp_pct=0.010)
results.append(s3)

s4 = run_strategy(df, "4. Short en Miedo", strategy4_signals, sl_pct=0.003, tp_pct=0.005)
results.append(s4)

# =============================================================================
# BUILD EXCEL FILE
# =============================================================================
print("[4/5] Building Excel file...")

wb = openpyxl.Workbook()

# Style definitions
header_font = Font(bold=True, color="FFFFFF", size=11)
header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
subheader_fill = PatternFill(start_color="D6E4F0", end_color="D6E4F0", fill_type="solid")
subheader_font = Font(bold=True, size=10)
data_font = Font(size=10)
positive_font = Font(size=10, color="006100")
negative_font = Font(size=10, color="9C0006")
positive_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
negative_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
thin_border = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)
center_align = Alignment(horizontal='center', vertical='center')
left_align = Alignment(horizontal='left', vertical='center')

def style_header_row(ws, row, max_col):
    for col in range(1, max_col + 1):
        cell = ws.cell(row=row, column=col)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

def auto_width(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = min(max_len + 4, 30)

# =========================================================================
# SHEET 1: RESUMEN
# =========================================================================
ws_resumen = wb.active
ws_resumen.title = "Resumen"

# Title
ws_resumen.merge_cells('A1:L1')
title_cell = ws_resumen['A1']
title_cell.value = "BACKTEST RESUMEN — NVDA/TSLA Scalping System"
title_cell.font = Font(bold=True, size=14, color="1F4E79")
title_cell.alignment = center_align

ws_resumen.merge_cells('A2:L2')
sub_cell = ws_resumen['A2']
sub_cell.value = f"Periodo: {df.index[0].strftime('%Y-%m-%d')} a {df.index[-1].strftime('%Y-%m-%d')} | Capital Inicial: ${STARTING_CAPITAL:,.0f} | Riesgo por trade: {RISK_PER_TRADE_PCT*100:.1f}%"
sub_cell.font = Font(size=10, italic=True)
sub_cell.alignment = center_align

# Headers row 4
summary_headers = [
    'Estrategia', 'Total Trades', 'Win Rate (%)', 'Profit Factor',
    'Return Total (%)', 'Max Drawdown (%)', 'Sharpe Ratio',
    'Avg Win (%)', 'Avg Loss (%)', 'Best Trade (%)', 'Worst Trade (%)',
    'Max Wins Seguidos', 'Max Loss Seguidos',
    'Gross Profit ($)', 'Gross Loss ($)', 'Capital Final ($)'
]

for col_idx, header in enumerate(summary_headers, 1):
    ws_resumen.cell(row=4, column=col_idx, value=header)
style_header_row(ws_resumen, 4, len(summary_headers))

# Data rows
for row_idx, r in enumerate(results, 5):
    ws_resumen.cell(row=row_idx, column=1, value=r['name']).font = Font(bold=True, size=10)
    ws_resumen.cell(row=row_idx, column=2, value=r['total_trades'])
    ws_resumen.cell(row=row_idx, column=3, value=r['win_rate'])
    ws_resumen.cell(row=row_idx, column=4, value=r['profit_factor'])
    
    ret_cell = ws_resumen.cell(row=row_idx, column=5, value=r['total_return_pct'])
    if r['total_return_pct'] >= 0:
        ret_cell.font = positive_font
    else:
        ret_cell.font = negative_font
    
    dd_cell = ws_resumen.cell(row=row_idx, column=6, value=r['max_drawdown_pct'])
    dd_cell.font = negative_font
    
    ws_resumen.cell(row=row_idx, column=7, value=r['sharpe_ratio'])
    ws_resumen.cell(row=row_idx, column=8, value=r['avg_win'])
    ws_resumen.cell(row=row_idx, column=9, value=r['avg_loss'])
    ws_resumen.cell(row=row_idx, column=10, value=r['best_trade'])
    ws_resumen.cell(row=row_idx, column=11, value=r['worst_trade'])
    ws_resumen.cell(row=row_idx, column=12, value=r['max_consec_wins'])
    ws_resumen.cell(row=row_idx, column=13, value=r['max_consec_losses'])
    ws_resumen.cell(row=row_idx, column=14, value=r['gross_profit'])
    ws_resumen.cell(row=row_idx, column=15, value=r['gross_loss'])
    
    cap_cell = ws_resumen.cell(row=row_idx, column=16, value=r['final_capital'])
    cap_cell.number_format = '$#,##0.00'
    
    for col_idx in range(1, len(summary_headers) + 1):
        cell = ws_resumen.cell(row=row_idx, column=col_idx)
        cell.border = thin_border
        cell.alignment = center_align
        # font already set for special cells above

auto_width(ws_resumen)

# =========================================================================
# SHEETS 2-5: TRADE DETAIL
# =========================================================================
detail_sheets = [
    ("Setup1_Detalle", s1),
    ("Setup2_Detalle", s2),
    ("Setup3_Detalle", s3),
    ("Setup4_Detalle", s4),
]

trade_columns = [
    'Date', 'Ticker', 'Side', 'Entry', 'Exit', 'Shares',
    'PnL', 'Return_Pct', 'Outcome', 'Reason', 'Capital_After'
]

trade_headers_display = [
    'Fecha', 'Ticker', 'Lado', 'Entrada', 'Salida', 'Acciones',
    'PnL ($)', 'Retorno (%)', 'Resultado', 'Razon', 'Capital Post'
]

for sheet_name, result in detail_sheets:
    ws = wb.create_sheet(title=sheet_name)
    
    # Title
    ws.merge_cells('A1:K1')
    ws['A1'].value = f"{result['name']} — Detalle de Trades"
    ws['A1'].font = Font(bold=True, size=12, color="1F4E79")
    ws['A1'].alignment = center_align
    
    # Headers
    for col_idx, header in enumerate(trade_headers_display, 1):
        ws.cell(row=3, column=col_idx, value=header)
    style_header_row(ws, 3, len(trade_headers_display))
    
    # Data
    trades = result['trades_df']
    if len(trades) > 0:
        for row_idx, (_, trade) in enumerate(trades.iterrows(), 4):
            for col_idx, col_name in enumerate(trade_columns, 1):
                val = trade[col_name]
                if isinstance(val, pd.Timestamp):
                    val = val.strftime('%Y-%m-%d')
                cell = ws.cell(row=row_idx, column=col_idx, value=val)
                cell.border = thin_border
                cell.font = data_font
                cell.alignment = center_align
                
                # Color code PnL
                if col_name == 'PnL':
                    if val > 0:
                        cell.font = positive_font
                        cell.fill = positive_fill
                    elif val < 0:
                        cell.font = negative_font
                        cell.fill = negative_fill
                    cell.number_format = '$#,##0.00'
                elif col_name == 'Return_Pct':
                    if val > 0:
                        cell.font = positive_font
                    elif val < 0:
                        cell.font = negative_font
                elif col_name == 'Capital_After':
                    cell.number_format = '$#,##0.00'
    else:
        ws.cell(row=4, column=1, value="Sin trades en este periodo").font = Font(italic=True)
    
    auto_width(ws)

# =========================================================================
# SHEET 6: MENSUAL
# =========================================================================
ws_mensual = wb.create_sheet(title="Mensual")

ws_mensual.merge_cells('A1:F1')
ws_mensual['A1'].value = "Retornos Mensuales por Estrategia ($)"
ws_mensual['A1'].font = Font(bold=True, size=12, color="1F4E79")
ws_mensual['A1'].alignment = center_align

# Get all unique months across all strategies
all_months = set()
for r in results:
    if len(r['monthly_returns']) > 0:
        for m in r['monthly_returns']['Month'].tolist():
            all_months.add(m)

all_months = sorted(list(all_months))

# Headers
mensual_headers = ['Mes'] + [r['name'] for r in results]
for col_idx, header in enumerate(mensual_headers, 1):
    ws_mensual.cell(row=3, column=col_idx, value=header)
style_header_row(ws_mensual, 3, len(mensual_headers))

# Data
for row_idx, month in enumerate(all_months, 4):
    ws_mensual.cell(row=row_idx, column=1, value=month).border = thin_border
    ws_mensual.cell(row=row_idx, column=1).font = Font(bold=True, size=10)
    ws_mensual.cell(row=row_idx, column=1).alignment = center_align
    
    for col_idx, r in enumerate(results, 2):
        if len(r['monthly_returns']) > 0:
            match = r['monthly_returns'][r['monthly_returns']['Month'] == month]
            if len(match) > 0:
                val = match['PnL'].values[0]
                cell = ws_mensual.cell(row=row_idx, column=col_idx, value=round(val, 2))
                cell.number_format = '$#,##0.00'
                if val > 0:
                    cell.font = positive_font
                    cell.fill = positive_fill
                elif val < 0:
                    cell.font = negative_font
                    cell.fill = negative_fill
                else:
                    cell.font = data_font
            else:
                cell = ws_mensual.cell(row=row_idx, column=col_idx, value="—")
                cell.font = Font(color="999999")
        else:
            cell = ws_mensual.cell(row=row_idx, column=col_idx, value="—")
            cell.font = Font(color="999999")
        cell.border = thin_border
        cell.alignment = center_align

# Totals row
total_row = 4 + len(all_months)
ws_mensual.cell(row=total_row, column=1, value="TOTAL").font = Font(bold=True, size=10)
ws_mensual.cell(row=total_row, column=1).fill = subheader_fill
ws_mensual.cell(row=total_row, column=1).border = thin_border
ws_mensual.cell(row=total_row, column=1).alignment = center_align

for col_idx, r in enumerate(results, 2):
    total_pnl = r['trades_df']['PnL'].sum() if len(r['trades_df']) > 0 else 0
    cell = ws_mensual.cell(row=total_row, column=col_idx, value=round(total_pnl, 2))
    cell.number_format = '$#,##0.00'
    cell.font = Font(bold=True)
    cell.fill = subheader_fill
    cell.border = thin_border
    cell.alignment = center_align

auto_width(ws_mensual)

# =========================================================================
# SAVE
# =========================================================================
print("[5/5] Saving Excel file...")
wb.save(OUTPUT_PATH)
print(f"  -> Saved to {OUTPUT_PATH}")
print()

# =============================================================================
# PRINT SUMMARY
# =============================================================================
print("=" * 70)
print("  RESULTADOS DEL BACKTEST")
print("=" * 70)
for r in results:
    print()
    print(f"  {r['name']}")
    print(f"  {'─' * 50}")
    print(f"  Total Trades:      {r['total_trades']}")
    print(f"  Win Rate:          {r['win_rate']}%")
    print(f"  Profit Factor:     {r['profit_factor']}")
    print(f"  Total Return:      {r['total_return_pct']}%")
    print(f"  Max Drawdown:      {r['max_drawdown_pct']}%")
    print(f"  Sharpe Ratio:      {r['sharpe_ratio']}")
    print(f"  Avg Win:           {r['avg_win']}%")
    print(f"  Avg Loss:          {r['avg_loss']}%")
    print(f"  Best Trade:        {r['best_trade']}%")
    print(f"  Worst Trade:       {r['worst_trade']}%")
    print(f"  Consec Wins Max:   {r['max_consec_wins']}")
    print(f"  Consec Loss Max:   {r['max_consec_losses']}")
    print(f"  Gross Profit:      ${r['gross_profit']:,.2f}")
    print(f"  Gross Loss:        ${r['gross_loss']:,.2f}")
    print(f"  Capital Final:     ${r['final_capital']:,.2f}")

print()
print("=" * 70)
print("  BACKTEST COMPLETADO")
print("=" * 70)
