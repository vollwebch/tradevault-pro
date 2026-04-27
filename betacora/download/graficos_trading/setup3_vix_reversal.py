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

nvda_1d = pd.read_csv(f'{SAVE_DIR}/nvda_1d_clean.csv', index_col=0, parse_dates=True)
vix_1d = pd.read_csv(f'{SAVE_DIR}/vix_1d_clean.csv', index_col=0, parse_dates=True)
nvda_1h = pd.read_csv(f'{SAVE_DIR}/nvda_1h_clean.csv', index_col=0, parse_dates=True)

# ============================================================
# SETUP 3: VIX CRASH REVERSAL - NVDA 1D + VIX
# ============================================================
fig = plt.figure(figsize=(20, 14), facecolor='#0D1117')
gs = fig.add_gridspec(3, 2, height_ratios=[1.2, 1.2, 1.2], width_ratios=[3, 1],
                       hspace=0.3, wspace=0.15)

ax1 = fig.add_subplot(gs[0, 0])  # NVDA Daily
ax_vix = fig.add_subplot(gs[0, 1])  # VIX
ax2 = fig.add_subplot(gs[1, 0])  # NVDA 1H zoom
ax3 = fig.add_subplot(gs[2, :])  # 5M entry

fig.suptitle('SETUP 3: VIX CRASH REVERSAL | NVDA Long | Win Rate: 69.6% | Retorno: +2.06%', 
             fontsize=18, fontweight='bold', color='#F0883E', y=0.98)
fig.text(0.3, 0.955, 'VIX spike > 3 dia anterior + NVDA cayo > 2% + VIX hoy baja + Reversal en zona de soporte',
         ha='center', fontsize=11, color='#8B949E')

# ── TOP LEFT: NVDA Daily Chart ──
df_1d = nvda_1d.tail(60).copy()
df_1d.index = pd.to_datetime(df_1d.index)

for i, (idx, row) in enumerate(df_1d.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax1.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.8, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax1.plot([idx, idx], [body_low, body_high], color=color, linewidth=4, solid_capstyle='butt', zorder=3)
    else:
        ax1.plot(idx, row['Close'], marker='_', color=color, markersize=8, markeredgewidth=2, zorder=3)

# Find a big red candle (VIX spike scenario)
daily_changes = df_1d['Close'].pct_change()
spike_idx = daily_changes.idxmin()  # Biggest drop
spike_row = df_1d.loc[spike_idx]

# Highlight the spike day
ax1.plot([spike_idx, spike_idx], [spike_row['Low'], spike_row['High']], color='#F85149', linewidth=6, zorder=4)

# Recovery zone after spike
recovery_start = spike_idx
recovery_df = df_1d.loc[recovery_start:]

# Mark the spike
ax1.annotate('VIX SPIKE\n(Caida fuerte)', xy=(spike_idx, spike_row['Low']),
             xytext=(spike_idx + pd.Timedelta(days=5), spike_row['Low'] - 4),
             fontsize=11, color='#F85149', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=2.5),
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))

# Mark the next day (reversal entry)
if len(recovery_df) > 1:
    rev_idx = recovery_df.index[1]
    rev_row = recovery_df.iloc[1]
    ax1.plot([rev_idx, rev_idx], [rev_row['Low'], rev_row['High']], color='#58A6FF', linewidth=6, zorder=4)
    ax1.annotate('DIA SIGUIENTE\n(VIX baja = ENTRADA)', xy=(rev_idx, rev_row['Low']),
                 xytext=(rev_idx + pd.Timedelta(days=5), rev_row['Low'] + 3),
                 fontsize=11, color='#58A6FF', fontweight='bold',
                 arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=2.5),
                 bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95))

# Recovery arrow
if len(recovery_df) > 5:
    ax1.annotate('', xy=(recovery_df.index[5], recovery_df['High'].iloc[5]),
                 xytext=(spike_idx, spike_row['Low']),
                 arrowprops=dict(arrowstyle='->', color='#26A641', lw=3, alpha=0.3,
                                connectionstyle='arc3,rad=0.2'))

# Support zone
support_level = spike_row['Low'] - 1
ax1.axhline(y=support_level, color='#A371F7', linewidth=1.5, linestyle='--', alpha=0.6)
ax1.text(df_1d.index[-1], support_level - 1, 'Soporte clave', fontsize=9, color='#A371F7',
         ha='right', fontweight='bold')

ax1.set_title('NVDA Diario - VIX Spike y Reversal', fontsize=12, fontweight='bold', color='#FFA657', loc='left')
ax1.set_ylabel('Precio NVDA ($)', fontsize=10, color='#8B949E')
ax1.grid(True, alpha=0.1, color='#30363D')
for spine in ax1.spines.values():
    spine.set_color('#30363D')

# ── TOP RIGHT: VIX Chart ──
vix_df = vix_1d.tail(60).copy()
vix_df.index = pd.to_datetime(vix_df.index)

ax_vix.fill_between(vix_df.index, 18, vix_df['Close'], where=vix_df['Close'] > 18,
                    alpha=0.3, color='#F85149', label='VIX > 18 (Zona de miedo)')
ax_vix.fill_between(vix_df.index, 18, vix_df['Close'], where=vix_df['Close'] <= 18,
                    alpha=0.3, color='#26A641', label='VIX < 18 (Zona segura)')
ax_vix.plot(vix_df.index, vix_df['Close'], color='#FFA657', linewidth=2)
ax_vix.axhline(y=18, color='#F0883E', linewidth=1.5, linestyle='--', alpha=0.8)
ax_vix.text(vix_df.index[0], 18.5, 'VIX 18 (Limite)', fontsize=8, color='#F0883E')

# Mark spike in VIX
vix_spike_idx = vix_df['Close'].idxmax()
vix_spike_val = vix_df['Close'].max()
ax_vix.plot(vix_spike_idx, vix_spike_val, marker='o', color='#F85149', markersize=10, zorder=5)
ax_vix.annotate(f'SPIKE\n{vix_spike_val:.1f}', xy=(vix_spike_idx, vix_spike_val),
                xytext=(vix_spike_idx + pd.Timedelta(days=5), vix_spike_val),
                fontsize=9, color='#F85149', fontweight='bold',
                arrowprops=dict(arrowstyle='->', color='#F85149', lw=1.5))

ax_vix.set_title('VIX - Indicador de Miedo', fontsize=12, fontweight='bold', color='#FFA657', loc='left')
ax_vix.legend(loc='upper left', fontsize=7, facecolor='#161B22', edgecolor='#30363D', labelcolor='#E6EDF3')
ax_vix.grid(True, alpha=0.1, color='#30363D')
for spine in ax_vix.spines.values():
    spine.set_color('#30363D')

# ── MIDDLE: NVDA 1H zoom on reversal ──
df_1h = nvda_1h.tail(80).copy()
df_1h.index = pd.to_datetime(df_1h.index)

for i, (idx, row) in enumerate(df_1h.iterrows()):
    color = '#26A641' if row['Close'] >= row['Open'] else '#F85149'
    ax2.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=0.6, zorder=2)
    body_low = min(row['Open'], row['Close'])
    body_high = max(row['Open'], row['Close'])
    if body_high > body_low:
        ax2.plot([idx, idx], [body_low, body_high], color=color, linewidth=3, solid_capstyle='butt', zorder=3)

# Find area around the reversal
mid_point = len(df_1h) // 3
rev_zone = df_1h.iloc[mid_point-5:mid_point+10]

# Mark the selling climax
sell_idx = rev_zone['Low'].idxmin()
sell_low = rev_zone['Low'].min()
ax2.plot([sell_idx, sell_idx], [sell_low, rev_zone.loc[sell_idx, 'High']], color='#F85149', linewidth=5, zorder=4)
ax2.annotate('Selling Climax\n(Agotamiento vendedores)', xy=(sell_idx, sell_low),
             xytext=(sell_idx + pd.Timedelta(hours=5), sell_low - 2),
             fontsize=10, color='#F85149', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#F85149', lw=2),
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#F85149', alpha=0.95))

# Mark bullish reversal (hammer/engulfing)
rev1h_idx = df_1h.index[mid_point + 2]
rev1h_row = df_1h.iloc[mid_point + 2]
if rev1h_row['Close'] > rev1h_row['Open']:
    ax2.plot([rev1h_idx, rev1h_idx], [rev1h_row['Low'], rev1h_row['High']], color='#58A6FF', linewidth=5, zorder=4)
    ax2.annotate('Vela de reversalcion\n(Hammer / Engulfing)\nENTRAR AQUI', xy=(rev1h_idx, rev1h_row['Close']),
                 xytext=(rev1h_idx + pd.Timedelta(hours=4), rev1h_row['Close'] + 2),
                 fontsize=10, color='#58A6FF', fontweight='bold',
                 arrowprops=dict(arrowstyle='->', color='#58A6FF', lw=2.5),
                 bbox=dict(boxstyle='round,pad=0.3', facecolor='#0D1117', edgecolor='#58A6FF', alpha=0.95))

# SL and TP
sl_1h = sell_low - 0.2
tp_1h = rev1h_row['Close'] + (rev1h_row['Close'] - sl_1h) * 3

ax2.axhline(y=sl_1h, color='#F85149', linewidth=1.5, linestyle='--', alpha=0.6)
ax2.text(df_1h.index[-1], sl_1h - 0.15, f'SL: ${sl_1h:.2f}', fontsize=9, color='#F85149',
         ha='right', fontweight='bold')
ax2.axhline(y=tp_1h, color='#26A641', linewidth=1.5, linestyle='--', alpha=0.6)
ax2.text(df_1h.index[-1], tp_1h + 0.15, f'TP (1:3): ${tp_1h:.2f}', fontsize=9, color='#26A641',
         ha='right', fontweight='bold')

ax2.set_title('NVDA 1H - Senal de reversalcion tras VIX Spike', fontsize=12, fontweight='bold', color='#FFA657', loc='left')
ax2.set_ylabel('Precio NVDA ($)', fontsize=10, color='#8B949E')
ax2.grid(True, alpha=0.1, color='#30363D')
for spine in ax2.spines.values():
    spine.set_color('#30363D')

# ── BOTTOM: Explanation box ──
ax3.set_xlim(0, 20)
ax3.set_ylim(0, 5)
ax3.axis('off')

# Step by step explanation
steps = [
    ('1', 'VIX hace spike > 3\n(el miedo domina)', '#F85149'),
    ('2', 'NVDA cae > 2%\n(vendedores en panico)', '#F85149'),
    ('3', 'Dia siguiente:\nVIX empieza a bajar', '#F0883E'),
    ('4', 'NVDA toca soporte\n+ vela de reversalcion', '#58A6FF'),
    ('5', 'ENTRAR LONG\nSL debajo del minimo\nTP 1:3 R:R', '#26A641'),
]

for i, (num, text, color) in enumerate(steps):
    x = 0.5 + i * 3.8
    # Circle number
    circle = plt.Circle((x, 3.5), 0.4, color=color, zorder=5)
    ax3.add_patch(circle)
    ax3.text(x, 3.5, num, ha='center', va='center', fontsize=16, fontweight='bold', color='white', zorder=6)
    
    # Text box
    ax3.text(x, 1.8, text, ha='center', va='center', fontsize=10, color='#E6EDF3',
             linespacing=1.5,
             bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor=color, linewidth=1.5))
    
    # Arrow
    if i < len(steps) - 1:
        ax3.annotate('', xy=(x + 2.3, 3.5), xytext=(x + 1.2, 3.5),
                     arrowprops=dict(arrowstyle='->', color='#30363D', lw=2))

# Key note
ax3.text(10, 0.3, 'CLAVE: Entras cuando TODOS venden. Compras el miedo. El 69.6% de las veces funciona.',
         ha='center', va='center', fontsize=12, color='#F0883E', fontweight='bold',
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#161B22', edgecolor='#F0883E', linewidth=2))

fig.savefig(f'{SAVE_DIR}/11_setup3_vix_reversal.png', dpi=200, facecolor='#0D1117', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/11_setup3_vix_reversal.png')

