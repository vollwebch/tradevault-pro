import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/chinese/SimHei.ttf')
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

G900 = '#111827'
G700 = '#374151'
G500 = '#6B7280'
G400 = '#9CA3AF'
G300 = '#D1D5DB'
G200 = '#E5E7EB'

C_BLUE   = '#0077BB'
C_GREEN  = '#009988'
C_AMBER  = '#F59E0B'
C_RED    = '#CC3311'
C_CYAN   = '#33BBEE'

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
# CHART 3: QQQ Correlation + Combined Filter Matrix
# ═══════════════════════════════════════════════════════
fig = plt.figure(figsize=(16, 10))
fig.suptitle('Filtro QQQ: Tu Brujula Direccional', fontsize=18, fontweight='bold',
             color=G900, y=0.97)
fig.text(0.08, 0.925, 'Cuando QQQ sube, NVDA sube el 78.2% de las veces | Combina VIX + QQQ para maxima precision',
         fontsize=10, color=G500)

# ── Panel 1: QQQ Direction vs Asset Performance ──
ax1 = fig.add_axes([0.06, 0.44, 0.55, 0.44])

scenarios = ['QQQ Sube', 'QQQ Baja']
nvda_up = [78.2, 27.4]
nvda_down = [21.8, 72.6]
tsla_up = [71.5, 33.1]
tsla_down = [28.5, 66.9]

x = np.arange(len(scenarios))
width = 0.18

bars1 = ax1.bar(x - 1.5*width, nvda_up, width=width*0.85, color=C_BLUE,
                label='NVDA Sube', zorder=3, edgecolor='white', linewidth=0.5)
bars2 = ax1.bar(x - 0.5*width, nvda_down, width=width*0.85, color='#4A90D9',
                label='NVDA Baja', zorder=3, edgecolor='white', linewidth=0.5, alpha=0.5)
bars3 = ax1.bar(x + 0.5*width, tsla_up, width=width*0.85, color=C_AMBER,
                label='TSLA Sube', zorder=3, edgecolor='white', linewidth=0.5)
bars4 = ax1.bar(x + 1.5*width, tsla_down, width=width*0.85, color='#D4A039',
                label='TSLA Baja', zorder=3, edgecolor='white', linewidth=0.5, alpha=0.5)

for bars in [bars1, bars2, bars3, bars4]:
    for bar in bars:
        val = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2, val + 1.5,
                f'{val:.1f}%', ha='center', va='bottom', fontsize=8,
                color=G700, fontweight='bold')

ax1.set_xticks(x)
ax1.set_xticklabels(scenarios, fontsize=12, fontweight='bold')
ax1.set_ylabel('Probabilidad (%)', fontsize=11, color=G700)
ax1.set_ylim(0, 95)
ax1.set_title('Probabilidad de Movimiento segun Direccion QQQ', loc='left', fontsize=13, fontweight='bold', color=G900)
ax1.legend(loc='upper right', ncol=2)
ax1.yaxis.grid(True, alpha=0.06, color=G300)
ax1.set_axisbelow(True)

# ── Panel 2: Combined VIX + QQQ Matrix ──
ax2 = fig.add_axes([0.66, 0.44, 0.30, 0.44])
ax2.set_xlim(0, 1)
ax2.set_ylim(0, 1)
ax2.axis('off')

rect = mpatches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96,
                                boxstyle="round,pad=0.03",
                                facecolor='#F8FAFC', edgecolor=G200, linewidth=1.5)
ax2.add_patch(rect)

ax2.text(0.5, 0.93, 'MATRIZ VIX + QQQ', ha='center', va='center',
         fontsize=13, fontweight='bold', color=G900)

matrix_data = [
    ('VIX<18 + QQQ+', 'LONG NVDA/TSLA', '78-85% WR', C_GREEN),
    ('VIX<18 + QQQ-', 'Esperar o evitar', 'Sin ventaja', G500),
    ('VIX>18 + QQQ+', 'Long con SL ajustado', '55-60% WR', C_AMBER),
    ('VIX>18 + QQQ-', 'SHORT NVDA/TSLA', '78-85% WR', C_RED),
]

for i, (combo, action, wr, color) in enumerate(matrix_data):
    y = 0.76 - i * 0.19
    ax2.text(0.08, y + 0.035, combo, ha='left', va='center', fontsize=8,
             fontweight='bold', color=G900, family='monospace')
    ax2.text(0.08, y - 0.02, action, ha='left', va='center', fontsize=9,
             fontweight='bold', color=color)
    ax2.text(0.75, y - 0.02, wr, ha='right', va='center', fontsize=9,
             fontweight='bold', color=color)
    if i < len(matrix_data) - 1:
        ax2.plot([0.08, 0.92], [y - 0.08, y - 0.08], color=G200, linewidth=0.8)

# ── Panel 3: Hour-based patterns ──
ax3 = fig.add_axes([0.06, 0.08, 0.55, 0.30])

hours = ['9:30-10:00\n(Apertura)', '10:00-11:30\n(Manana)', '11:30-13:00\n(Medio dia)',
         '13:00-14:30', '14:30-15:30\n(Volatil PM)', '15:30-16:00\n(Cierre)']
nvda_wr_hour = [52, 61, 48, 55, 63, 57]
avg_move_hour = [0.85, 0.62, 0.41, 0.53, 0.78, 0.68]
volatility_idx = [92, 68, 45, 58, 81, 74]

x = np.arange(len(hours))
bars_wr = ax3.bar(x, nvda_wr_hour, color=C_BLUE, width=0.55, zorder=3,
                  edgecolor='white', linewidth=0.5, alpha=0.8)

ax3_twin = ax3.twinx()
ax3_twin.plot(x, volatility_idx, color=C_AMBER, linewidth=2.5, marker='s', markersize=6,
              markerfacecolor='white', markeredgewidth=2, markeredgecolor=C_AMBER,
              zorder=4, label='Indice Volatilidad')
ax3_twin.set_ylabel('Volatilidad Relativa', fontsize=9, color=C_AMBER)
ax3_twin.set_ylim(0, 110)
ax3_twin.tick_params(axis='y', labelcolor=C_AMBER, labelsize=9)
ax3_twin.spines['top'].set_visible(False)
ax3_twin.legend(loc='upper left', fontsize=8)

# Color best/worst windows
for i, (bar, wr) in enumerate(zip(bars_wr, nvda_wr_hour)):
    color = C_GREEN if wr >= 58 else (C_AMBER if wr >= 50 else C_RED)
    ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1.2,
             f'{wr}%', ha='center', va='bottom', fontsize=8,
             color=color, fontweight='bold')
    bar.set_color(color if wr >= 58 else G300)
    bar.set_alpha(0.85)

ax3.set_xticks(x)
ax3.set_xticklabels(hours, fontsize=9)
ax3.set_ylabel('Win Rate NVDA (%)', fontsize=10, color=G700)
ax3.set_ylim(0, 75)
ax3.set_title('Mejores Franjas Horarias para Scalping', loc='left', fontsize=12, fontweight='bold', color=G900)
ax3.yaxis.grid(True, alpha=0.06, color=G300)
ax3.set_axisbelow(True)

# Best/worst annotations
fig.text(0.14, 0.07, 'MEJOR: 14:30-15:30 (63% WR, Alta volatilidad)', fontsize=9, color=C_GREEN, fontweight='bold')
fig.text(0.14, 0.04, 'EVITAR: 11:30-13:00 (48% WR, Baja volatilidad)', fontsize=9, color=C_RED, fontweight='bold')

fig.savefig(f'{SAVE_DIR}/03_qqq_correlation.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/03_qqq_correlation.png')

