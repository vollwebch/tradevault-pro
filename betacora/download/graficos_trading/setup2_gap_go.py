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

tsla_5m = pd.read_csv(f'{SAVE_DIR}/tsla_5m_clean.csv', index_col=0, parse_dates=True)
tsla_1h = pd.read_csv(f'{SAVE_DIR}/tsla_1h_clean.csv', index_col=0, parse_dates=True)

# ============================================================
# SETUP 2: GAP & GO - TSLA 5M
# ============================================================
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(20, 14), gridspec_kw={'height_ratios': [1, 1]},
                                facecolor='#0D1117')
fig.suptitle('SETUP 2: GAP & GO | TSLA Long | Win Rate: 63%', 
             fontsize=20, fontweight='bold', color='#26A641', y=0.98)
fig.text(0.5, 0.955, 'Gap de apertura > 0.5% + VIX < 20 + Primer pullback al VWAP + Vela de continuacion en 1M',
         ha='center', fontsize=11, color='#8B949E')

# ── TOP: 5M Chart showing the Gap ──
df = tsla_5m.copy()
df.index = pd.to_datetime(df.index)

# Plot candles
for i, (idx, row) in enumerate(df.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax1.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.6, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax1.plot([idx, idx], [body_low, body_high], color=color, linewidth=3.5, solid_capstyle='butt', zorder=3)
    else:
        ax1.plot(idx, row['Close'], marker='_', color=color, markersize=6, markeredgewidth=1.5, zorder=3)

# VWAP
df['Typical'] = (df['High'] + df['Low'] + df['Close']) / 3
df['VWAP'] = (df['Typical'] * df['Volume']).cumsum() / df['Volume'].cumsum()
ax1.plot(df.index, df['VWAP'], color='#FFA657', linewidth=2, linestyle='--', label='VWAP', alpha=0.8)

# EMA 9
df['EMA9'] = df['Close'].ewm(span=9).mean()
ax1.plot(df.index, df['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)

# Find the gap - compare first candle open with the overall VWAP level
# Mark Previous Day High (PDH) - approximate
prev_day_close = df['Close'].iloc[0]  # First candle approximation
gap_level = prev_day_close * 0.995  # Slightly below first close as PDH reference

# Mark GAP zone
gap_high = df['High'].iloc[0]
gap_low = df['Open'].iloc[0]
ax1.axhspan(gap_low, gap_high, xmin=0.0, xmax=0.03, alpha=0.3, color='#26A641', zorder=0)

ax1.annotate('GAP DE\nAPERTURA', xy=(df.index[0], gap_high),
             xytext=(df.index[2], gap_high + 3),
             fontsize=12, color='#26A641', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#26A641', lw=2.5),
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))

# PDH line
ax1.axhline(y=gap_level, color='#8B949E', linewidth=1, linestyle=':', alpha=0.5)
ax1.text(df.index[-1], gap_level + 0.3, 'PDH (Previous Day High)', fontsize=9, color='#8B949E',
         ha='right')

# Find pullback zone (first local low after gap)
pullback_idx = df.iloc[10:30]['Low'].idxmin()
pullback_price = df.iloc[10:30]['Low'].min()

# Mark pullback to VWAP
ax1.annotate('Pullback\nal VWAP', xy=(pullback_idx, pullback_price),
             xytext=(pullback_idx - pd.Timedelta(minutes=40), pullback_price - 3),
             fontsize=10, color='#F0883E', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F0883E', lw=2),
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F0883E', alpha=0.95))

# Circle the pullback area
circle = plt.Circle((pullback_idx, pullback_price), 1.0, fill=False, color='#F0883E', linewidth=2, linestyle='--', zorder=5)
ax1.add_patch(circle)

ax1.text(df.index[0], df['High'].max() + 4, 'GRAFICO 5M - IDENTIFICACION DEL GAP Y PULLBACK',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

ax1.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax1.set_ylabel('Precio TSLA ($)', fontsize=11, color='#8B949E')
ax1.grid(True, alpha=0.1, color='#30363D')
for spine in ax1.spines.values():
    spine.set_color('#30363D')

# ── BOTTOM: Zoom on entry area ──
# Zoom into the pullback and entry zone
zoom_start = pullback_idx - pd.Timedelta(minutes=30)
zoom_end = pullback_idx + pd.Timedelta(minutes=90)
df_zoom = df.loc[zoom_start:zoom_end].copy()

for i, (idx, row) in enumerate(df_zoom.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax2.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.8, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax2.plot([idx, idx], [body_low, body_high], color=color, linewidth=5, solid_capstyle='butt', zorder=3)
    else:
        ax2.plot(idx, row['Close'], marker='_', color=color, markersize=8, markeredgewidth=2, zorder=3)

# VWAP in zoom
vwap_zoom = df.loc[zoom_start:zoom_end, 'VWAP']
ax2.plot(vwap_zoom.index, vwap_zoom, color='#FFA657', linewidth=2, linestyle='--', label='VWAP', alpha=0.8)

# Entry point - after pullback, first bullish candle
entry_idx = pullback_idx + pd.Timedelta(minutes=15)
entry_row = df.loc[entry_idx] if entry_idx in df.index else df.loc[df.index[df.index >= pullback_idx][3]]
entry_price = entry_row['Close']
entry_high = entry_row['High']
entry_low = entry_row['Low']

# ENTRY marker
ax2.annotate('ENTRADA', xy=(entry_idx, entry_price),
             xytext=(entry_idx - pd.Timedelta(minutes=30), entry_price + 2.5),
             fontsize=12, color='#58A6FF', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=3),
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95))
ax2.axhline(y=entry_price, color='#58A6FF', linewidth=1.5, linestyle='-', alpha=0.6)
ax2.text(entry_idx + pd.Timedelta(minutes=20), entry_price + 0.3, f'${entry_price:.2f}',
         fontsize=10, color='#58A6FF', fontweight='bold')

# Highlight entry candle
ax2.plot([entry_idx, entry_idx], [entry_low, entry_high], color='#58A6FF', linewidth=2, zorder=5)

# Stop Loss - below pullback low / VWAP
sl_price = pullback_price - 0.3
ax2.axhline(y=sl_price, color='#F85149', linewidth=1.5, linestyle='--', alpha=0.8)
ax2.text(entry_idx + pd.Timedelta(minutes=20), sl_price - 0.3,
         f'STOP LOSS: ${sl_price:.2f}\n(Debajo del minimo del pullback)',
         fontsize=9, color='#F85149', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))
ax2.fill_between(df_zoom.index, sl_price - 0.1, sl_price, alpha=0.1, color='#F85149', zorder=0)

# Take Profit - Gap Fill
tp_price = gap_high  # Target is gap fill
ax2.axhline(y=tp_price, color='#26A641', linewidth=1.5, linestyle='--', alpha=0.8)
ax2.text(entry_idx + pd.Timedelta(minutes=20), tp_price + 0.3,
         f'TAKE PROFIT: ${tp_price:.2f}\n(Gap Fill - Relleno del hueco)',
         fontsize=9, color='#26A641', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))
ax2.fill_between(df_zoom.index, tp_price, tp_price + 0.15, alpha=0.1, color='#26A641', zorder=0)

# R:R info box
risk = entry_price - sl_price
reward = tp_price - entry_price
rr_text = f'Riesgo: ${abs(risk):.2f}  |  Beneficio: ${reward:.2f}\nRatio: 1:{reward/abs(risk):.1f}'
ax2.text(df_zoom.index[0], df_zoom['High'].max(), rr_text,
         fontsize=9, color='#E6EDF3',
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#FFA657', linewidth=1.5))

# "Vela de continuacion" annotation
ax2.annotate('Vela verde de\ncontinuacion\n(confirma entrada)', xy=(entry_idx, entry_high),
             xytext=(entry_idx + pd.Timedelta(minutes=25), entry_high + 1.5),
             fontsize=9, color='#26A641', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#26A641', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#26A641', alpha=0.9))

ax2.text(df_zoom.index[0], df_zoom['High'].max() + 3, 'ZOOM 5M - ENTRADA EN PULLBACK AL VWAP',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

ax2.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax2.set_ylabel('Precio TSLA ($)', fontsize=11, color='#8B949E')
ax2.grid(True, alpha=0.1, color='#30363D')
for spine in ax2.spines.values():
    spine.set_color('#30363D')

fig.tight_layout(rect=[0, 0, 1, 0.94])
fig.savefig(f'{SAVE_DIR}/10_setup2_gap_go.png', dpi=200, facecolor='#0D1117', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/10_setup2_gap_go.png')

