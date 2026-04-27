import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
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

# Load data
nvda_1h = pd.read_csv(f'{SAVE_DIR}/nvda_1h_clean.csv', index_col=0, parse_dates=True)
nvda_5m = pd.read_csv(f'{SAVE_DIR}/nvda_5m_clean.csv', index_col=0, parse_dates=True)

# ============================================================
# SETUP 1: TENDENCIA LIMPIA - NVDA 1H + 5M
# ============================================================
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(20, 14), gridspec_kw={'height_ratios': [1, 1]},
                                facecolor='#0D1117')
fig.suptitle('SETUP 1: TENDENCIA LIMPIA | NVDA Long | Win Rate: 67%', 
             fontsize=20, fontweight='bold', color='#58A6FF', y=0.98)
fig.text(0.5, 0.955, 'VIX < 18 + QQQ positivo + Tendencia alcista 1D/4H + Pullback a zona 1H + Confirmacion 5M',
         ha='center', fontsize=11, color='#8B949E')

# ── TOP: 1H Chart ──
# Use last ~80 hours
df_1h = nvda_1h.tail(80).copy()
df_1h.index = pd.to_datetime(df_1h.index)

colors_1h = ['#26A641' if c >= o else '#F85149' for o, c in zip(df_1h['Open'], df_1h['Close'])]

for i, (idx, row) in enumerate(df_1h.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax1.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.8, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax1.plot([idx, idx], [body_low, body_high], color=color, linewidth=4, solid_capstyle='butt', zorder=3)
    else:
        ax1.plot(idx, row['Close'], marker='_', color=color, markersize=8, markeredgewidth=2, zorder=3)

# EMA 9 and EMA 20
df_1h['EMA9'] = df_1h['Close'].ewm(span=9).mean()
df_1h['EMA20'] = df_1h['Close'].ewm(span=20).mean()
ax1.plot(df_1h.index, df_1h['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)
ax1.plot(df_1h.index, df_1h['EMA20'], color='#A371F7', linewidth=1.5, label='EMA 20', alpha=0.8)

# VWAP approximation (using cumulative typical price * vol / cumulative vol)
df_1h['Typical'] = (df_1h['High'] + df_1h['Low'] + df_1h['Close']) / 3
df_1h['VWAP'] = (df_1h['Typical'] * df_1h['Volume']).cumsum() / df_1h['Volume'].cumsum()
ax1.plot(df_1h.index, df_1h['VWAP'], color='#FFA657', linewidth=2, linestyle='--', label='VWAP', alpha=0.7)

# Order Block zone (annotate a zone)
# Find a recent low area to mark as Order Block
recent_low_idx = df_1h['Low'].idxmin()
recent_low = df_1h['Low'].min()
ob_high = recent_low + (df_1h['High'].max() - df_1h['Low'].min()) * 0.02

# Mark Order Block zone
ob_start = df_1h.index[len(df_1h)//2]
ob_end = df_1h.index[len(df_1h)//2 + 5]
ax1.axhspan(recent_low, ob_high, xmin=0.1, xmax=0.4, alpha=0.15, color='#58A6FF', zorder=0)
ax1.axhline(y=recent_low, color='#58A6FF', linewidth=1, linestyle=':', alpha=0.6, xmin=0.05, xmax=0.95)
ax1.axhline(y=ob_high, color='#58A6FF', linewidth=1, linestyle=':', alpha=0.6, xmin=0.05, xmax=0.95)

# Find a swing low for the Order Block annotation
swing_low = df_1h['Low'].iloc[len(df_1h)//3]
swing_low_idx = df_1h.index[len(df_1h)//3]
ob_zone_high = swing_low + 0.3

ax1.annotate('', xy=(swing_low_idx, swing_low), xytext=(swing_low_idx, swing_low + 3),
             arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=2))

# Labels
ax1.text(swing_low_idx, swing_low - 0.8, 'ORDER BLOCK\n(Zona de demanda)', ha='center', fontsize=10,
         color='#58A6FF', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.9))

# Mark Higher Highs and Higher Lows
hh_idx = df_1h['High'].idxmax()
hh_val = df_1h['High'].max()
hl_idx = df_1h.index[-5]
hl_val = df_1h['Low'].iloc[-5]

ax1.annotate('HH (Higher High)', xy=(hh_idx, hh_val), xytext=(hh_idx, hh_val + 3),
             fontsize=9, color='#26A641', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#26A641', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#26A641', alpha=0.8))

ax1.annotate('HL (Higher Low)', xy=(hl_idx, hl_val), xytext=(hl_idx, hl_val - 3),
             fontsize=9, color='#26A641', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#26A641', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#26A641', alpha=0.8))

# Trend arrow
ax1.annotate('', xy=(df_1h.index[-1], df_1h['Close'].iloc[-1]),
             xytext=(df_1h.index[-15], df_1h['Close'].iloc[-15] - 4),
             arrowprops=dict(arrowstyle='->', color='#26A641', lw=3, alpha=0.4))

# Pullback zone
pb_start = df_1h.index[-20]
pb_end = df_1h.index[-10]
pb_low = df_1h['Low'].iloc[-20:-10].min()
pb_high = df_1h['High'].iloc[-20:-10].max()

ax1.annotate('', xy=(pb_start, pb_high), xytext=(pb_start - pd.Timedelta(hours=3), pb_high + 2),
             arrowprops=dict(arrowstyle='->', color='#F0883E', lw=2))
ax1.text(pb_start - pd.Timedelta(hours=2), pb_high + 2.5, 'PULLBACK\na zona OB', ha='center', fontsize=9,
         color='#F0883E', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#F0883E', alpha=0.9))

# Timeframe label
ax1.text(df_1h.index[0], df_1h['High'].max() + 5, 'GRAFICO 1H - CONTEXTO Y ZONAS',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

ax1.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax1.set_ylabel('Precio NVDA ($)', fontsize=11, color='#8B949E')
ax1.grid(True, alpha=0.1, color='#30363D')
ax1.tick_params(axis='both', colors='#8B949E')
for spine in ax1.spines.values():
    spine.set_color('#30363D')

# ── BOTTOM: 5M Chart with Entry ──
df_5m = nvda_5m.tail(78).copy()
df_5m.index = pd.to_datetime(df_5m.index)

for i, (idx, row) in enumerate(df_5m.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax2.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.6, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax2.plot([idx, idx], [body_low, body_high], color=color, linewidth=3.5, solid_capstyle='butt', zorder=3)
    else:
        ax2.plot(idx, row['Close'], marker='_', color=color, markersize=6, markeredgewidth=1.5, zorder=3)

# Volume bars
vol_ax = ax2.twinx()
vol_colors = ['#26A641' if c >= o else '#F85149' for o, c in zip(df_5m['Open'], df_5m['Close'])]
vol_ax.bar(df_5m.index, df_5m['Volume'], width=0.003, color=vol_colors, alpha=0.2, zorder=1)
vol_ax.set_ylabel('Volumen', fontsize=9, color='#484F58')
vol_ax.tick_params(axis='y', colors='#484F58')
vol_ax.spines['top'].set_visible(False)
vol_ax.spines['right'].set_color('#30363D')
vol_ax.spines['left'].set_color('#30363D')
vol_ax.spines['bottom'].set_color('#30363D')

# EMA 9 on 5M
df_5m['EMA9'] = df_5m['Close'].ewm(span=9).mean()
ax2.plot(df_5m.index, df_5m['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)

# VWAP on 5M
df_5m['Typical'] = (df_5m['High'] + df_5m['Low'] + df_5m['Close']) / 3
df_5m['VWAP'] = (df_5m['Typical'] * df_5m['Volume']).cumsum() / df_5m['Volume'].cumsum()
ax2.plot(df_5m.index, df_5m['VWAP'], color='#FFA657', linewidth=1.5, linestyle='--', label='VWAP', alpha=0.7)

# Mark Entry Point
entry_idx = df_5m.index[50]
entry_price = df_5m['High'].iloc[50]
entry_low = df_5m['Low'].iloc[50]

# Entry arrow and zone
ax2.annotate('', xy=(entry_idx, entry_price + 0.15),
             xytext=(entry_idx - pd.Timedelta(minutes=25), entry_price - 0.8),
             arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=3))

# Entry marker
ax2.axhline(y=entry_price, color='#58A6FF', linewidth=1.5, linestyle='-', alpha=0.6,
            xmin=0.55, xmax=0.95)
ax2.text(df_5m.index[60], entry_price + 0.08, f'ENTRADA: ${entry_price:.2f}',
         fontsize=11, color='#58A6FF', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95))

# Stop Loss
sl_price = entry_low - 0.15
ax2.axhline(y=sl_price, color='#F85149', linewidth=1.5, linestyle='--', alpha=0.7,
            xmin=0.55, xmax=0.95)
ax2.text(df_5m.index[60], sl_price - 0.12, f'STOP LOSS: ${sl_price:.2f}',
         fontsize=10, color='#F85149', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))

# SL zone
ax2.fill_between(df_5m.index[50:78], sl_price - 0.05, sl_price,
                 alpha=0.08, color='#F85149', zorder=0)

# Take Profit 1:2 R:R
risk = entry_price - sl_price
tp1_price = entry_price + risk * 2
ax2.axhline(y=tp1_price, color='#26A641', linewidth=1.5, linestyle='--', alpha=0.7,
            xmin=0.55, xmax=0.95)
ax2.text(df_5m.index[60], tp1_price + 0.08, f'TAKE PROFIT (1:2): ${tp1_price:.2f}',
         fontsize=10, color='#26A641', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))

# TP zone
ax2.fill_between(df_5m.index[50:78], tp1_price, tp1_price + 0.05,
                 alpha=0.08, color='#26A641', zorder=0)

# R:R box
rr_box_text = f'Riesgo: ${abs(risk):.2f}  |  Beneficio: ${risk*2:.2f}\nRatio: 1:2'
ax2.text(df_5m.index[10], df_5m['High'].max(), rr_box_text,
         fontsize=9, color='#E6EDF3',
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))

# "Vela de confirmacion" annotation on the entry candle
ax2.annotate('Vela de\nconfirmacion\nbreakout', xy=(entry_idx, entry_price),
             xytext=(entry_idx - pd.Timedelta(minutes=50), entry_price + 0.6),
             fontsize=9, color='#F0883E', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F0883E', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#F0883E', alpha=0.9))

# Pullback annotation
pb5_idx = df_5m.index[35]
pb5_low = df_5m['Low'].iloc[35]
ax2.annotate('Pullback a\nzona VWAP/EMA9', xy=(pb5_idx, pb5_low),
             xytext=(pb5_idx - pd.Timedelta(minutes=30), pb5_low - 0.5),
             fontsize=9, color='#A371F7', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#A371F7', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#A371F7', alpha=0.9))

# Timeframe label
ax2.text(df_5m.index[0], df_5m['High'].max() + 0.4, 'GRAFICO 5M - ENTRADA, SL Y TP',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

ax2.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax2.set_ylabel('Precio NVDA ($)', fontsize=11, color='#8B949E')
ax2.grid(True, alpha=0.1, color='#30363D')
ax2.tick_params(axis='both', colors='#8B949E')
for spine in ax2.spines.values():
    spine.set_color('#30363D')

fig.tight_layout(rect=[0, 0, 1, 0.94])
fig.savefig(f'{SAVE_DIR}/09_setup1_tendencia_limpia.png', dpi=200, facecolor='#0D1117', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/09_setup1_tendencia_limpia.png')

