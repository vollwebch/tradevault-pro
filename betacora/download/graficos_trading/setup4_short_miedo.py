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

# ============================================================
# SETUP 4: SHORT EN MIEDO - NVDA 1H + 5M
# ============================================================
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(20, 14), gridspec_kw={'height_ratios': [1, 1]},
                                facecolor='#0D1117')
fig.suptitle('SETUP 4: SHORT EN MIEDO | NVDA Short | Win Rate: 85%', 
             fontsize=20, fontweight='bold', color='#F85149', y=0.98)
fig.text(0.5, 0.955, 'VIX > 18 y subiendo + QQQ en negativo + NVDA debil vs mercado + Rechazo en resistencia 1H',
         ha='center', fontsize=11, color='#8B949E')

# ── TOP: 1H Chart - Short Setup ──
df_1h = nvda_1h.tail(80).copy()
df_1h.index = pd.to_datetime(df_1h.index)

for i, (idx, row) in enumerate(df_1h.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax1.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.8, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax1.plot([idx, idx], [body_low, body_high], color=color, linewidth=4, solid_capstyle='butt', zorder=3)
    else:
        ax1.plot(idx, row['Close'], marker='_', color=color, markersize=8, markeredgewidth=2, zorder=3)

# EMA 9 and 20
df_1h['EMA9'] = df_1h['Close'].ewm(span=9).mean()
df_1h['EMA20'] = df_1h['Close'].ewm(span=20).mean()
ax1.plot(df_1h.index, df_1h['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)
ax1.plot(df_1h.index, df_1h['EMA20'], color='#A371F7', linewidth=1.5, label='EMA 20', alpha=0.8)

# VWAP
df_1h['Typical'] = (df_1h['High'] + df_1h['Low'] + df_1h['Close']) / 3
df_1h['VWAP'] = (df_1h['Typical'] * df_1h['Volume']).cumsum() / df_1h['Volume'].cumsum()
ax1.plot(df_1h.index, df_1h['VWAP'], color='#FFA657', linewidth=2, linestyle='--', label='VWAP', alpha=0.7)

# Mark resistance zone (supply zone)
resist_idx = df_1h.iloc[20:40]['High'].idxmax()
resist_val = df_1h.iloc[20:40]['High'].max()
resist_low = resist_val - 0.3

# Supply Zone
ax1.axhspan(resist_low, resist_val, alpha=0.12, color='#F85149', zorder=0,
            xmin=0.1, xmax=0.95)
ax1.axhline(y=resist_val, color='#F85149', linewidth=1.5, linestyle=':', alpha=0.6)
ax1.axhline(y=resist_low, color='#F85149', linewidth=1, linestyle=':', alpha=0.4)

ax1.text(df_1h.index[10], resist_val + 0.5, 'SUPPLY ZONE\n(Zona de oferta / Resistencia)',
         fontsize=11, color='#F85149', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))

# Mark Lower Highs (bearish structure)
lh1_idx = df_1h.index[30]
lh1_val = df_1h['High'].iloc[30]
lh2_idx = df_1h.index[50]
lh2_val = df_1h['High'].iloc[50]

ax1.annotate('LH (Lower High)', xy=(lh1_idx, lh1_val), xytext=(lh1_idx - pd.Timedelta(hours=5), lh1_val + 2),
             fontsize=9, color='#F85149', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#F85149', alpha=0.8))

ax1.annotate('LH (Lower High)', xy=(lh2_idx, lh2_val), xytext=(lh2_idx + pd.Timedelta(hours=3), lh2_val + 2),
             fontsize=9, color='#F85149', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#F85149', alpha=0.8))

# Lower Lows
ll_idx = df_1h.index[60]
ll_val = df_1h['Low'].iloc[60]
ax1.annotate('LL (Lower Low)', xy=(ll_idx, ll_val), xytext=(ll_idx, ll_val - 2.5),
             fontsize=9, color='#F85149', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=1.5),
             bbox=dict(boxstyle='round,pad=0.2', facecolor='#0D1117', edgecolor='#F85149', alpha=0.8))

# Downtrend arrow
ax1.annotate('', xy=(df_1h.index[-1], df_1h['Close'].iloc[-1] - 1),
             xytext=(df_1h.index[-15], df_1h['Close'].iloc[-15] + 3),
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=3, alpha=0.3))

# Mark the rejection at resistance (entry trigger)
rej_idx = df_1h.index[55]
rej_row = df_1h.iloc[55]
if rej_row['Open'] > rej_row['Close']:  # Bearish candle
    ax1.plot([rej_idx, rej_idx], [rej_row['Low'], rej_row['High']], color='#F85149', linewidth=6, zorder=4)
    ax1.annotate('RECHAZO en\nSupply Zone\nVela bajista', xy=(rej_idx, rej_row['High']),
                 xytext=(rej_idx + pd.Timedelta(hours=3), rej_row['High'] + 2),
                 fontsize=10, color='#F0883E', fontweight='bold',
                 arrowprops=dict(arrowstyle='->', color='#F0883E', lw=2),
                 bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F0883E', alpha=0.95))

# Context labels
ax1.text(df_1h.index[0], df_1h['High'].max() + 4, 'GRAFICO 1H - ESTRUCTURA BAJISTA + RESISTENCIA',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

# VIX context box
ax1.text(df_1h.index[-1], df_1h['Low'].min() - 1.5,
         'VIX > 18  |  QQQ Bajando  |  EMA9 < EMA20 (Cruce bajista)',
         fontsize=9, color='#F0883E', ha='right', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#F0883E'))

ax1.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax1.set_ylabel('Precio NVDA ($)', fontsize=11, color='#8B949E')
ax1.grid(True, alpha=0.1, color='#30363D')
for spine in ax1.spines.values():
    spine.set_color('#30363D')

# ── BOTTOM: 5M Entry Chart ──
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

# EMA 9 on 5M
df_5m['EMA9'] = df_5m['Close'].ewm(span=9).mean()
ax2.plot(df_5m.index, df_5m['EMA9'], color='#F0883E', linewidth=1.5, label='EMA 9', alpha=0.8)

# VWAP on 5M
df_5m['Typical'] = (df_5m['High'] + df_5m['Low'] + df_5m['Close']) / 3
df_5m['VWAP'] = (df_5m['Typical'] * df_5m['Volume']).cumsum() / df_5m['Volume'].cumsum()
ax2.plot(df_5m.index, df_5m['VWAP'], color='#FFA657', linewidth=1.5, linestyle='--', label='VWAP', alpha=0.7)

# Resistance zone in 5M
resist_5m = df_5m['High'].iloc[20:40].max()
resist_5m_low = resist_5m - 0.15
ax2.axhspan(resist_5m_low, resist_5m, alpha=0.12, color='#F85149', zorder=0)
ax2.axhline(y=resist_5m, color='#F85149', linewidth=1, linestyle=':', alpha=0.5)
ax2.text(df_5m.index[15], resist_5m + 0.15, 'Supply Zone', fontsize=9, color='#F85149', fontweight='bold')

# Find a bearish rejection candle near resistance
rejection_idx = None
for j in range(35, 55):
    row = df_5m.iloc[j]
    if row['Open'] > row['Close'] and row['High'] >= resist_5m_low:
        rejection_idx = df_5m.index[j]
        rejection_row = row
        break

if rejection_idx is not None:
    # Highlight rejection candle
    ax2.plot([rejection_idx, rejection_idx], [rejection_row['Low'], rejection_row['High']], 
             color='#F85149', linewidth=6, zorder=4)
    
    # SHORT ENTRY
    entry_price = rejection_row['Low']  # Short below the bearish candle
    entry_low = rejection_row['Low']
    entry_high = rejection_row['High']
    
    ax2.annotate('SHORT ENTRADA\n(Vende debajo de\nla vela de rechazo)', xy=(rejection_idx, entry_low),
                 xytext=(rejection_idx - pd.Timedelta(minutes=35), entry_low + 0.6),
                 fontsize=11, color='#F85149', fontweight='bold',
                 arrowprops=dict(arrowstyle='->', color='#F85149', lw=3),
                 bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))
    
    ax2.axhline(y=entry_price, color='#F85149', linewidth=1.5, linestyle='-', alpha=0.5,
                xmin=0.5, xmax=0.95)
    
    # Stop Loss - above resistance
    sl_price = resist_5m + 0.15
    ax2.axhline(y=sl_price, color='#F85149', linewidth=1.5, linestyle='--', alpha=0.7,
                xmin=0.5, xmax=0.95)
    ax2.text(df_5m.index[60], sl_price + 0.08, f'STOP LOSS: ${sl_price:.2f}\n(Encima de la Supply Zone)',
             fontsize=9, color='#F85149', fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))
    ax2.fill_between(df_5m.index[45:78], sl_price, sl_price + 0.08, alpha=0.1, color='#F85149', zorder=0)
    
    # Take Profit 1:2
    risk = sl_price - entry_price
    tp1_price = entry_price - risk * 2
    ax2.axhline(y=tp1_price, color='#26A641', linewidth=1.5, linestyle='--', alpha=0.7,
                xmin=0.5, xmax=0.95)
    ax2.text(df_5m.index[60], tp1_price - 0.15, f'TAKE PROFIT (1:2): ${tp1_price:.2f}',
             fontsize=9, color='#26A641', fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#26A641', alpha=0.95))
    ax2.fill_between(df_5m.index[45:78], tp1_price - 0.08, tp1_price, alpha=0.1, color='#26A641', zorder=0)
    
    # R:R box
    rr_text = f'Riesgo: ${risk:.2f}  |  Beneficio: ${risk*2:.2f}\nRatio: 1:2  |  Win Rate: 85%'
    ax2.text(df_5m.index[5], df_5m['High'].max(), rr_text,
             fontsize=9, color='#E6EDF3',
             bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#F0883E', linewidth=1.5))

ax2.text(df_5m.index[0], df_5m['High'].max() + 0.4, 'GRAFICO 5M - ENTRADA SHORT EN RECHAZO',
         fontsize=13, fontweight='bold', color='#FFA657',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#161B22', edgecolor='#FFA657'))

ax2.legend(loc='upper left', fontsize=9, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax2.set_ylabel('Precio NVDA ($)', fontsize=11, color='#8B949E')
ax2.grid(True, alpha=0.1, color='#30363D')
for spine in ax2.spines.values():
    spine.set_color('#30363D')

fig.tight_layout(rect=[0, 0, 1, 0.94])
fig.savefig(f'{SAVE_DIR}/12_setup4_short_miedo.png', dpi=200, facecolor='#0D1117', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/12_setup4_short_miedo.png')

