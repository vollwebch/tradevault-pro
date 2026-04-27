import matplotlib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os

# Font setup
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/chinese/SimHei.ttf')
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

# Color palette - Business Cool
G900 = '#111827'
G700 = '#374151'
G500 = '#6B7280'
G400 = '#9CA3AF'
G300 = '#D1D5DB'
G200 = '#E5E7EB'
G100 = '#F3F4F6'
G50  = '#F9FAFB'

C_BLUE   = '#0077BB'
C_CYAN   = '#33BBEE'
C_PURPLE = '#8B5CF6'
C_AMBER  = '#F59E0B'
C_RED    = '#CC3311'
C_GREEN  = '#009988'

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
    'axes.labelsize': 11,
    'axes.titlesize': 18,
    'axes.titleweight': 'bold',
    'axes.titlepad': 20,
    'legend.frameon': False,
    'legend.fontsize': 10,
    'figure.dpi': 200,
    'savefig.dpi': 200,
    'savefig.bbox': 'tight',
    'savefig.facecolor': '#FFFFFF',
    'savefig.pad_inches': 0.3,
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

# ═══════════════════════════════════════════
# CHART 1: Win Rate por Setup (Bar Chart)
# ═══════════════════════════════════════════
fig, ax = plt.subplots(figsize=(14, 7))

setups = [
    'Tendencia\nLimpia',
    'Gap & Go',
    'VIX Crash\nReversal',
    'Short en\nMiedo'
]

# NVDA win rates
nvda_wr = [67, 63, 69.6, 85]
# TSLA win rates  
tsla_wr = [62, 58, 65, 78]
# Average returns (%)
avg_ret = [1.15, 1.42, 2.06, 1.85]

x = np.arange(len(setups))
width = 0.32

# NVDA bars
bars1 = ax.bar(x - width/2, nvda_wr, width=width*0.85, color=C_BLUE,
               label='NVDA Win Rate', zorder=3, edgecolor='white', linewidth=0.5)

# TSLA bars
bars2 = ax.bar(x + width/2, tsla_wr, width=width*0.85, color=C_AMBER,
               label='TSLA Win Rate', zorder=3, edgecolor='white', linewidth=0.5)

# Value labels on bars
for bars, vals in [(bars1, nvda_wr), (bars2, tsla_wr)]:
    for bar, val in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1.2,
                f'{val}%', ha='center', va='bottom', fontsize=10,
                color=G700, fontweight='bold')

# Average return annotation line
ax2 = ax.twinx()
ax2.plot(x, avg_ret, color=C_RED, linewidth=2.5, marker='D', markersize=8,
         markerfacecolor='white', markeredgewidth=2.5, markeredgecolor=C_RED,
         zorder=4, label='Retorno Promedio (%)')
for i, ret in enumerate(avg_ret):
    ax2.annotate(f'+{ret}%', (x[i], ret), textcoords="offset points",
                 xytext=(0, 14), ha='center', fontsize=9, color=C_RED, fontweight='bold')

ax2.set_ylabel('Retorno Promedio (%)', color=C_RED, fontsize=11)
ax2.tick_params(axis='y', labelcolor=C_RED)
ax2.spines['top'].set_visible(False)
ax2.set_ylim(0, max(avg_ret) * 2)

# Reference line at 50%
ax.axhline(y=50, color=G300, linewidth=1.5, linestyle='--', zorder=1)
ax.text(len(setups)-0.5, 51, '50% (Break-even)', color=G400, fontsize=9, ha='right')

ax.set_xticks(x)
ax.set_xticklabels(setups, fontsize=11)
ax.set_ylabel('Win Rate (%)', color=G700, fontsize=11)
ax.set_ylim(0, 100)
ax.set_title('Win Rate por Setup de Scalping', loc='left', pad=20, fontsize=18, fontweight='bold', color=G900)

# Subtitle
fig.text(0.12, 0.92, 'Comparativa de Win Rate por setup | Datos historicos NVDA & TSLA | VIX + QQQ como filtros',
         fontsize=10, color=G500)

ax.legend(loc='upper left', ncol=2, bbox_to_anchor=(0.0, 0.95))
ax2.legend(loc='upper right', bbox_to_anchor=(1.0, 0.95))

ax.yaxis.grid(True, alpha=0.06, color=G300)
ax.set_axisbelow(True)

fig.savefig(f'{SAVE_DIR}/01_winrate_por_setup.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/01_winrate_por_setup.png')

