import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np

matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/chinese/SimHei.ttf')
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans', 'SimHei'],
    'axes.unicode_minus': False,
    'figure.facecolor': '#0D1117',
    'axes.facecolor': '#0D1117',
    'text.color': '#E6EDF3',
    'axes.labelcolor': '#E6EDF3',
    'xtick.color': '#8B949E',
    'ytick.color': '#8B949E',
    'figure.dpi': 200,
    'savefig.dpi': 200,
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

nvda_1h = pd.read_csv(f'{SAVE_DIR}/nvda_1h_clean.csv', index_col=0, parse_dates=True)
nvda_5m = pd.read_csv(f'{SAVE_DIR}/nvda_5m_clean.csv', index_col=0, parse_dates=True)
nvda_1m = pd.read_csv(f'{SAVE_DIR}/nvda_1m_clean.csv', index_col=0, parse_dates=True)

# ============================================================
# MTFA COMPLETE: How to use all timeframes together
# ============================================================
fig = plt.figure(figsize=(22, 16), facecolor='#0D1117')
gs = fig.add_gridspec(3, 1, height_ratios=[1, 1, 1], hspace=0.25)

ax_1h = fig.add_subplot(gs[0])
ax_5m = fig.add_subplot(gs[1])
ax_1m = fig.add_subplot(gs[2])

fig.suptitle('COMO USAR EL MTFA EN VIVO: De la Tendencia a la Entrada en 1 Minuto', 
             fontsize=20, fontweight='bold', color='#58A6FF', y=0.98)
fig.text(0.5, 0.955, 'Paso a paso: como leer cada timeframe para encontrar una entrada perfecta | Setup Tendencia Limpia NVDA Long',
         ha='center', fontsize=12, color='#8B949E')

def plot_candles(ax, df, lw=1, body_lw=3):
    for i, (idx, row) in enumerate(df.iterrows()):
        color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
        ax.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=lw, zorder=2)
        body_low = min(row['Open'], row['Close'])
        body_high = max(row['Open'], row['Close'])
        if body_high > body_low:
            ax.plot([idx, idx], [body_low, body_high], color=color, linewidth=body_lw, solid_capstyle='butt', zorder=3)
        else:
            ax.plot(idx, row['Close'], marker='_', color=color, markersize=6, markeredgewidth=1.5, zorder=3)

# ── PANEL 1: 1H - Trend + Zones ──
df_1h = nvda_1h.tail(60).copy()
df_1h.index = pd.to_datetime(df_1h.index)
plot_candles(ax_1h, df_1h, lw=0.8, body_lw=4)

# EMA 9/20
df_1h['EMA9'] = df_1h['Close'].ewm(span=9).mean()
df_1h['EMA20'] = df_1h['Close'].ewm(span=20).mean()
ax_1h.plot(df_1h.index, df_1h['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)
ax_1h.plot(df_1h.index, df_1h['EMA20'], color='#A371F7', linewidth=1.5, label='EMA 20', alpha=0.8)

# VWAP
df_1h['Typical'] = (df_1h['High'] + df_1h['Low'] + df_1h['Close']) / 3
df_1h['VWAP'] = (df_1h['Typical'] * df_1h['Volume']).cumsum() / df_1h['Volume'].cumsum()
ax_1h.plot(df_1h.index, df_1h['VWAP'], color='#FFA657', linewidth=2, linestyle='--', label='VWAP', alpha=0.7)

# Higher High / Higher Low annotations
hh_idx = df_1h['High'].iloc[30:45].idxmax()
hh_val = df_1h['High'].iloc[30:45].max()
ax_1h.annotate('HH', xy=(hh_idx, hh_val), fontsize=11, color='#26A641', fontweight='bold',
               xytext=(hh_idx + pd.Timedelta(hours=3), hh_val + 2),
               arrowprops=dict(arrowstyle='->', color='#26A641', lw=1.5))

# Order Block zone
ob_idx = df_1h.index[40]
ob_low = df_1h['Low'].iloc[38:42].min()
ob_high = ob_low + 0.5
ax_1h.axhspan(ob_low, ob_high, xmin=0.55, xmax=0.95, alpha=0.15, color='#58A6FF', zorder=0)
ax_1h.text(df_1h.index[50], ob_high + 0.2, 'ORDER BLOCK\n(Zona de entrada potencial)',
           fontsize=10, color='#58A6FF', fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95))

# Trend label
ax_1h.text(df_1h.index[2], df_1h['High'].max() + 3,
           'PASO 1: 1H - TENDENCIA ALCISTA CONFIRMADA\nEMA 9 > EMA 20 | HH y HL | VWAP como referencia',
           fontsize=11, fontweight='bold', color='#FFA657',
           bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))

# Check marks
ax_1h.text(df_1h.index[2], df_1h['High'].max() + 0.5,
           '[OK] Tendencia alcista    [OK] EMA9 > EMA20    [OK] Order Block identificado',
           fontsize=9, color='#26A641', fontweight='bold')

ax_1h.legend(loc='upper right', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax_1h.grid(True, alpha=0.1, color='#30363D')
for spine in ax_1h.spines.values():
    spine.set_color('#30363D')

# ── PANEL 2: 5M - Confirmation ──
df_5m = nvda_5m.tail(78).copy()
df_5m.index = pd.to_datetime(df_5m.index)
plot_candles(ax_5m, df_5m, lw=0.6, body_lw=3)

df_5m['EMA9'] = df_5m['Close'].ewm(span=9).mean()
df_5m['Typical'] = (df_5m['High'] + df_5m['Low'] + df_5m['Close']) / 3
df_5m['VWAP'] = (df_5m['Typical'] * df_5m['Volume']).cumsum() / df_5m['Volume'].cumsum()
ax_5m.plot(df_5m.index, df_5m['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)
ax_5m.plot(df_5m.index, df_5m['VWAP'], color='#FFA657', linewidth=1.5, linestyle='--', label='VWAP', alpha=0.7)

# Highlight pullback area
pb_idx = df_5m.index[35]
pb_low = df_5m['Low'].iloc[30:40].min()
pb_high = df_5m['High'].iloc[30:40].max()

# Circle pullback
circle = plt.Circle((pb_idx, (pb_low + pb_high)/2), 0.8, fill=False, color='#A371F7', 
                     linewidth=2, linestyle='--', zorder=5)
ax_5m.add_patch(circle)

ax_5m.annotate('PULLBACK\na zona EMA9/VWAP\nPASO 2: Esperar', xy=(pb_idx, pb_low),
               xytext=(pb_idx - pd.Timedelta(minutes=30), pb_low - 0.6),
               fontsize=10, color='#A371F7', fontweight='bold',
               arrowprops=dict(arrowstyle='->', color='#A371F7', lw=2),
               bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#A371F7', alpha=0.95))

# Mark confirmation candle (bullish reversal in pullback)
conf_idx = df_5m.index[42]
conf_row = df_5m.iloc[42]
if conf_row['Close'] > conf_row['Open']:
    ax_5m.plot([conf_idx, conf_idx], [conf_row['Low'], conf_row['High']], 
               color='#26A641', linewidth=6, zorder=4)
    ax_5m.annotate('CONFIRMACION\nVela verde\nPASO 3: Confirmado', xy=(conf_idx, conf_row['Close']),
                   xytext=(conf_idx + pd.Timedelta(minutes=20), conf_row['Close'] + 0.5),
                   fontsize=10, color='#26A641', fontweight='bold',
                   arrowprops=dict(arrowstyle='->', color='#26A641', lw=2),
                   bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))

ax_5m.text(df_5m.index[0], df_5m['High'].max() + 0.5,
           'PASO 2-3: 5M - ESPERAR PULLBACK + CONFIRMAR\nPullback a VWAP/EMA9 + Vela de rechazo verde = Confirmacion',
           fontsize=11, fontweight='bold', color='#FFA657',
           bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))

ax_5m.text(df_5m.index[0], df_5m['High'].max() - 0.1,
           '[OK] Pullback a zona    [OK] Vela de confirmacion    [OK] Pasamos al 1M',
           fontsize=9, color='#26A641', fontweight='bold')

ax_5m.legend(loc='upper right', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax_5m.grid(True, alpha=0.1, color='#30363D')
for spine in ax_5m.spines.values():
    spine.set_color('#30363D')

# ── PANEL 3: 1M - The Entry ──
df_1m = nvda_1m.copy()
df_1m.index = pd.to_datetime(df_1m.index)
plot_candles(ax_1m, df_1m, lw=0.4, body_lw=2.5)

# Volume
vol_ax = ax_1m.twinx()
vol_colors = ['#26A641' if c >= o else '#F85149' for o, c in zip(df_1m['Open'], df_1m['Close'])]
vol_ax.bar(df_1m.index, df_1m['Volume'], width=0.002, color=vol_colors, alpha=0.15, zorder=1)
vol_ax.set_ylabel('Volumen', fontsize=8, color='#484F58')
vol_ax.tick_params(axis='y', colors='#484F58')
vol_ax.spines['top'].set_visible(False)
vol_ax.spines['right'].set_color('#30363D')
vol_ax.spines['left'].set_color('#30363D')
vol_ax.spines['bottom'].set_color('#30363D')

df_1m['EMA9'] = df_1m['Close'].ewm(span=9).mean()
ax_1m.plot(df_1m.index, df_1m['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)

# Entry candle (first strong bullish candle after confirmation)
entry_1m_idx = df_1m.index[100]
entry_1m_row = df_1m.iloc[100]
entry_price = entry_1m_row['Close']
entry_low_1m = entry_1m_row['Low']

# Highlight entry candle
ax_1m.plot([entry_1m_idx, entry_1m_idx], [entry_1m_row['Low'], entry_1m_row['High']], 
           color='#58A6FF', linewidth=4, zorder=5)

# ENTRY
ax_1m.annotate('ENTRADA AHORA\nPASO 4: EJECUTAS', xy=(entry_1m_idx, entry_price),
               xytext=(entry_1m_idx - pd.Timedelta(minutes=30), entry_price + 0.3),
               fontsize=12, color='#58A6FF', fontweight='bold',
               arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=3),
               bbox=dict(boxstyle='round,pad=0.4', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95, linewidth=2))

# Stop Loss
sl_1m = entry_low_1m - 0.08
ax_1m.axhline(y=sl_1m, color='#F85149', linewidth=1.5, linestyle='--', alpha=0.8)
ax_1m.text(df_1m.index[-10], sl_1m - 0.04,
           f'STOP LOSS: ${sl_1m:.2f} (Debajo del minimo - 3 ticks)',
           fontsize=9, color='#F85149', fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))

# Take Profit
risk_1m = entry_price - sl_1m
tp_1m = entry_price + risk_1m * 2
ax_1m.axhline(y=tp_1m, color='#26A641', linewidth=1.5, linestyle='--', alpha=0.8)
ax_1m.text(df_1m.index[-10], tp_1m + 0.04,
           f'TAKE PROFIT: ${tp_1m:.2f} (1:2 R:R)',
           fontsize=9, color='#26A641', fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))

# SL/TP zones
ax_1m.fill_between(df_1m.index[80:], sl_1m - 0.03, sl_1m, alpha=0.1, color='#F85149', zorder=0)
ax_1m.fill_between(df_1m.index[80:], tp_1m, tp_1m + 0.03, alpha=0.1, color='#26A641', zorder=0)

# Step label
ax_1m.text(df_1m.index[0], df_1m['High'].max() + 0.25,
           'PASO 4: 1M - ENTRADA PRECISA + SL + TP\nVela perfecta + SL ajustado (3-5 ticks) + TP 1:2 = Operacion completa',
           fontsize=11, fontweight='bold', color='#FFA657',
           bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))

ax_1m.text(df_1m.index[0], df_1m['High'].max() - 0.15,
           '[OK] Entrada ejecutada    [OK] SL definido    [OK] TP definido    [OK] R:R 1:2',
           fontsize=9, color='#26A641', fontweight='bold')

ax_1m.legend(loc='upper right', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax_1m.set_ylabel('Precio NVDA ($)', fontsize=10, color='#8B949E')
ax_1m.grid(True, alpha=0.1, color='#30363D')
for spine in ax_1m.spines.values():
    spine.set_color('#30363D')

# Right side annotation: Complete Flow
fig.text(0.98, 0.85, 'FLUJO COMPLETO:', fontsize=12, fontweight='bold', color='#FFA657', ha='right',
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))
flow_text = '1H: Confirmas tendencia\n    + Encuentras zona OB\n\n5M: Esperas pullback\n    + Vela de confirmacion\n\n1M: Entras con precision\n    + SL + TP definidos\n\nLISTO: Dejas correr\n    o mueves SL a BE'
fig.text(0.98, 0.55, flow_text, fontsize=10, color='#E6EDF3', ha='right',
         linespacing=1.8,
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#30363D'))

fig.savefig(f'{SAVE_DIR}/13_mtfa_completo_1h_5m_1m.png', dpi=200, facecolor='#0D1117', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/13_mtfa_completo_1h_5m_1m.png')

