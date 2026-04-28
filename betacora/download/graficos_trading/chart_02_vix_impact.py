import matplotlib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.patches as mpatches
import numpy as np
import os

matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/chinese/SimHei.ttf')
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

G900 = '#111827'
G700 = '#374151'
G500 = '#6B7280'
G400 = '#9CA3AF'
G300 = '#D1D5DB'
G200 = '#E5E7EB'

C_BLUE   = '#0077BB'
C_CYAN   = '#33BBEE'
C_GREEN  = '#009988'
C_AMBER  = '#F59E0B'
C_RED    = '#CC3311'

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans', 'SimHei'],
    'axes.unicode_minus': False,
    'figure.facecolor': '#FFFFFF',
    'axes.facecolor': '#FFFFFF',
    'axes.edgecolor': '#E5E7EB',
    'axes.linewidth': 0.8,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.grid': False,
    'xtick.major.size': 0,
    'ytick.major.size': 0,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
    'axes.titlesize': 18,
    'axes.titleweight': 'bold',
    'axes.titlepad': 20,
    'legend.frameon': False,
    'figure.dpi': 200,
    'savefig.dpi': 200,
    'savefig.bbox': 'tight',
    'savefig.facecolor': '#FFFFFF',
    'savefig.pad_inches': 0.3,
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

# ═══════════════════════════════════════════════════════
# CHART 2: VIX Impact - Two-panel visualization
# ═══════════════════════════════════════════════════════
fig = plt.figure(figsize=(16, 9))
fig.suptitle('Impacto del VIX en tus Operaciones de Scalping', fontsize=18, fontweight='bold', 
             color=G900, y=0.97)
fig.text(0.08, 0.925, 'El VIX es tu filtro principal | Define el sesgo direccional del dia',
         fontsize=10, color=G500)

# ── Panel 1: VIX Levels vs Win Rate ──
ax1 = fig.add_axes([0.06, 0.08, 0.42, 0.78])

vix_levels = ['VIX < 15\n(Muy Bajo)', 'VIX 15-18\n(Bajo)', 'VIX 18-22\n(Elevado)', 'VIX 22-28\n(Alto)', 'VIX > 28\n(Miedo)']
nvda_long_wr = [61, 57, 44, 38, 31]
nvda_short_wr = [42, 46, 56, 61, 67]
avg_range = [1.8, 2.4, 3.8, 5.2, 7.1]

x = np.arange(len(vix_levels))
width = 0.30

bars_long = ax1.bar(x - width/2, nvda_long_wr, width=width*0.85, color=C_GREEN,
                    label='Longs (Compra)', zorder=3, edgecolor='white', linewidth=0.5)
bars_short = ax1.bar(x + width/2, nvda_short_wr, width=width*0.85, color=C_RED,
                     label='Shorts (Venta)', zorder=3, edgecolor='white', linewidth=0.5)

for bars in [bars_long, bars_short]:
    for bar in bars:
        val = bar.get_height()
        color = C_GREEN if val >= 50 else C_RED
        ax1.text(bar.get_x() + bar.get_width()/2, val + 1.5,
                f'{int(val)}%', ha='center', va='bottom', fontsize=9,
                color=color, fontweight='bold')

ax1.axhline(y=50, color=G300, linewidth=1.5, linestyle='--', zorder=1)
ax1.text(4.4, 51, '50%', color=G400, fontsize=9)

# Color zones background
ax1.axvspan(-0.5, 1.5, alpha=0.04, color=C_GREEN, zorder=0)
ax1.axvspan(1.5, 2.5, alpha=0.04, color=C_AMBER, zorder=0)
ax1.axvspan(2.5, 4.5, alpha=0.04, color=C_RED, zorder=0)

ax1.set_xticks(x)
ax1.set_xticklabels(vix_levels, fontsize=9)
ax1.set_ylabel('Win Rate (%)', fontsize=11, color=G700)
ax1.set_ylim(0, 80)
ax1.set_title('Win Rate Long vs Short segun Nivel VIX', loc='left', fontsize=13, fontweight='bold', color=G900)
ax1.legend(loc='upper left', ncol=2)
ax1.yaxis.grid(True, alpha=0.06, color=G300)
ax1.set_axisbelow(True)

# Zone labels
fig.text(0.18, 0.88, 'ZONA VERDE\nSolo Longs', ha='center', fontsize=8, color=C_GREEN, fontweight='bold', alpha=0.7)
fig.text(0.35, 0.88, 'PRECAUCION', ha='center', fontsize=8, color=C_AMBER, fontweight='bold', alpha=0.7)
fig.text(0.48, 0.88, 'ZONA ROJA\nSolo Shorts', ha='center', fontsize=8, color=C_RED, fontweight='bold', alpha=0.7)

# ── Panel 2: VIX Spike Reversal Strategy ──
ax2 = fig.add_axes([0.56, 0.44, 0.40, 0.42])

days_after = ['Dia del\nSpike', '+1 Dia', '+2 Dias', '+3 Dias', '+4 Dias']
nvda_return_after = [-2.14, 2.06, 1.42, 0.85, 0.38]
win_rate_after = [23, 69.6, 61, 55, 50]

bar_colors = [C_RED if v < 0 else C_GREEN for v in nvda_return_after]
bars_ret = ax2.bar(days_after, nvda_return_after, color=bar_colors, width=0.6,
                   zorder=3, edgecolor='white', linewidth=0.5)

for bar, val, wr in zip(bars_ret, nvda_return_after, win_rate_after):
    y_pos = bar.get_height() + 0.08 if val >= 0 else bar.get_height() - 0.25
    prefix = '+' if val >= 0 else ''
    ax2.text(bar.get_x() + bar.get_width()/2, y_pos,
             f'{prefix}{val:.2f}%\n(WR:{wr}%)', ha='center', va='bottom' if val >= 0 else 'top',
             fontsize=8, color=G700, fontweight='bold')

ax2.axhline(y=0, color=G300, linewidth=1, zorder=1)
ax2.set_ylabel('Retorno NVDA (%)', fontsize=10, color=G700)
ax2.set_ylim(-3.5, 3.5)
ax2.set_title('VIX Spike >3: Reversal al Dia Siguiente', loc='left', fontsize=12, fontweight='bold', color=G900)
ax2.yaxis.grid(True, alpha=0.06, color=G300)
ax2.set_axisbelow(True)

# ── Panel 3: Key Rules Box ──
ax3 = fig.add_axes([0.56, 0.08, 0.40, 0.30])
ax3.set_xlim(0, 1)
ax3.set_ylim(0, 1)
ax3.axis('off')

# Box background
rect = mpatches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96,
                                boxstyle="round,pad=0.03",
                                facecolor='#F8FAFC', edgecolor=G200, linewidth=1.5)
ax3.add_patch(rect)

ax3.text(0.5, 0.88, 'REGLAS DEL FILTRO VIX', ha='center', va='center',
         fontsize=13, fontweight='bold', color=G900)

rules = [
    ('VIX < 15', 'Sesion muy tranquila. Buscar Longs.', C_GREEN),
    ('VIX 15-18', 'Sesion normal. Sesgo Long con cuidado.', C_GREEN),
    ('VIX 18-22', 'Volatilidad elevada. Reducir tamaño.', C_AMBER),
    ('VIX 22-28', 'Miedo en mercado. Buscar Shorts.', C_RED),
    ('VIX > 28', 'Panico extremo. Solo Shorts o NO operar.', C_RED),
]

for i, (level, rule, color) in enumerate(rules):
    y = 0.72 - i * 0.155
    ax3.text(0.08, y, level, ha='left', va='center', fontsize=10,
             fontweight='bold', color=color)
    ax3.text(0.35, y, rule, ha='left', va='center', fontsize=9, color=G700)

fig.savefig(f'{SAVE_DIR}/02_impacto_vix.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/02_impacto_vix.png')

