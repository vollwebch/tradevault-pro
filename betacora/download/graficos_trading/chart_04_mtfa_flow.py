import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/chinese/SimHei.ttf')
matplotlib.font_manager.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

G900 = '#111827'
G700 = '#374151'
G500 = '#6B7280'
G400 = '#9CA3AF'
G300 = '#D1D5DB'
G200 = '#E5E7EB'
G100 = '#F3F4F6'
G50  = '#F9FAFB'

C_BLUE   = '#0077BB'
C_GREEN  = '#009988'
C_AMBER  = '#F59E0B'
C_RED    = '#CC3311'
C_CYAN   = '#33BBEE'
C_PURPLE = '#8B5CF6'

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans', 'SimHei'],
    'axes.unicode_minus': False,
    'figure.facecolor': '#FFFFFF',
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

fig, ax = plt.subplots(1, 1, figsize=(18, 11))
ax.set_xlim(0, 18)
ax.set_ylim(0, 11)
ax.axis('off')

# Title
ax.text(9, 10.6, 'Sistema MTFA: Analisis Multi-Timeframe para Scalping 1 Minuto',
        ha='center', va='center', fontsize=18, fontweight='bold', color=G900)
ax.text(9, 10.2, 'Como usar cada timeframe como filtro | Del contexto general al trigger de entrada',
        ha='center', va='center', fontsize=11, color=G500)

# ── Timeframe boxes (left to right) ──
timeframes = [
    {
        'name': '1D / 4H',
        'role': 'TENDENCIA GENERAL',
        'color': C_BLUE,
        'bg': '#EFF6FF',
        'x': 1.2, 'y': 7.2,
        'checks': [
            'Tendencia alcista/bajista',
            'Maximos/minimos recientes',
            'Estructura del mercado',
            'Niveles S/R clave',
        ],
        'output': 'Sesgo: LONG o SHORT',
        'output_color': C_BLUE,
        'desc': 'Solo miras 5 min antes de abrir. Define el sesgo del dia.',
        'weight': 'PESO: 40%'
    },
    {
        'name': '1H',
        'role': 'ZONAS DE INTERES',
        'color': C_CYAN,
        'bg': '#F0FDFA',
        'x': 5.2, 'y': 7.2,
        'checks': [
            'Order Blocks activos',
            'Zonas de liquidez',
            'Estructura swing H/L',
            'VWAP diario',
        ],
        'output': 'Niveles exactos de entrada',
        'output_color': C_CYAN,
        'desc': 'Identificas donde podria reaccionar el precio.',
        'weight': 'PESO: 25%'
    },
    {
        'name': '5M',
        'role': 'CONFIRMACION',
        'color': C_GREEN,
        'bg': '#F0FDF4',
        'x': 9.2, 'y': 7.2,
        'checks': [
            'Estructura en 5min confirma',
            'Pullback a zona clave',
            'Vela de rechazo/breakout',
            'Volumen confirma',
        ],
        'output': 'Senal de entrada valida',
        'output_color': C_GREEN,
        'desc': 'Esperas a que el precio llegue a tu zona y confirme.',
        'weight': 'PESO: 20%'
    },
    {
        'name': '1M',
        'role': 'ENTRADA PRECISA',
        'color': C_AMBER,
        'bg': '#FFFBEB',
        'x': 13.2, 'y': 7.2,
        'checks': [
            'Vela de entrada perfecto',
            'SL ajustado (3-5 ticks)',
            'VWAP intradia como ref',
            'Gestion en tiempo real',
        ],
        'output': 'ENTRAR AHORA',
        'output_color': C_RED,
        'desc': 'Entrada, SL y TP definidos. Ejecutas sin dudar.',
        'weight': 'PESO: 15%'
    },
]

# Draw arrows between timeframes
for i in range(3):
    x_start = timeframes[i]['x'] + 3.2
    x_end = timeframes[i+1]['x'] - 0.1
    y_mid = timeframes[i]['y'] + 0.5
    ax.annotate('', xy=(x_end, y_mid), xytext=(x_start, y_mid),
                arrowprops=dict(arrowstyle='->', color=G300, lw=2.5))

# Draw each timeframe card
for tf in timeframes:
    x, y = tf['x'], tf['y']
    
    # Main card
    rect = FancyBboxPatch((x - 0.3, y - 2.8), 3.8, 5.2,
                           boxstyle="round,pad=0.1",
                           facecolor=tf['bg'], edgecolor=tf['color'], linewidth=2)
    ax.add_patch(rect)
    
    # Timeframe header
    header = FancyBboxPatch((x - 0.3, y + 1.8), 3.8, 0.6,
                             boxstyle="round,pad=0.05",
                             facecolor=tf['color'], edgecolor='none')
    ax.add_patch(header)
    ax.text(x + 1.6, y + 2.1, tf['name'], ha='center', va='center',
            fontsize=16, fontweight='bold', color='white')
    
    # Weight badge
    ax.text(x + 3.3, y + 2.1, tf['weight'], ha='center', va='center',
            fontsize=7, color='white', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.15', facecolor=tf['color'], alpha=0.8, edgecolor='none'))
    
    # Role label
    ax.text(x + 1.6, y + 1.45, tf['role'], ha='center', va='center',
            fontsize=10, fontweight='bold', color=tf['color'])
    
    # Description
    ax.text(x + 1.6, y + 1.0, tf['desc'], ha='center', va='center',
            fontsize=7.5, color=G500, style='italic')
    
    # Separator
    ax.plot([x + 0.1, x + 3.1], [y + 0.7, y + 0.7], color=G200, linewidth=0.8)
    
    # Check items
    for j, check in enumerate(tf['checks']):
        cy = y + 0.35 - j * 0.45
        # Bullet
        ax.text(x + 0.2, cy, '\u2713', ha='left', va='center',
                fontsize=9, color=tf['color'], fontweight='bold')
        ax.text(x + 0.5, cy, check, ha='left', va='center',
                fontsize=8.5, color=G700)
    
    # Output box at bottom
    out_rect = FancyBboxPatch((x + 0.1, y - 2.5), 3.2, 0.5,
                               boxstyle="round,pad=0.05",
                               facecolor='white', edgecolor=tf['output_color'], linewidth=1.5)
    ax.add_patch(out_rect)
    ax.text(x + 1.7, y - 2.25, tf['output'], ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=tf['output_color'])

# ── Bottom section: Complete Flow Example ──
flow_y = 3.2
ax.text(9, flow_y + 1.2, 'EJEMPLO PRACTICO: Setup "Tendencia Limpia" LONG en NVDA',
        ha='center', va='center', fontsize=13, fontweight='bold', color=G900)

flow_rect = FancyBboxPatch((0.5, flow_y - 2.2), 17, 3.0,
                            boxstyle="round,pad=0.15",
                            facecolor=G50, edgecolor=G200, linewidth=1.5)
ax.add_patch(flow_rect)

steps = [
    ('1', '1D/4H', 'NVDA en tendencia alcista\ncon HH y HL', C_BLUE),
    ('2', 'Filtro', 'VIX = 16 (< 18)\nQQQ sube (+0.8%)', C_GREEN),
    ('3', '1H', 'Precio en zona de\nOrder Block + VWAP', C_CYAN),
    ('4', '5M', 'Pullback a OB +\nvela de rechazo verde', C_GREEN),
    ('5', '1M', 'ENTRADA en ruptura\nde max de 5min', C_RED),
]

for i, (num, label, desc, color) in enumerate(steps):
    sx = 1.5 + i * 3.3
    
    # Step number circle
    circle = plt.Circle((sx - 0.4, flow_y + 0.15), 0.25, color=color, zorder=5)
    ax.add_patch(circle)
    ax.text(sx - 0.4, flow_y + 0.15, num, ha='center', va='center',
            fontsize=11, fontweight='bold', color='white', zorder=6)
    
    # Label
    ax.text(sx + 0.2, flow_y + 0.3, label, ha='left', va='center',
            fontsize=10, fontweight='bold', color=color)
    
    # Description
    ax.text(sx + 0.2, flow_y - 0.35, desc, ha='left', va='center',
            fontsize=8.5, color=G700)
    
    # Arrow to next
    if i < len(steps) - 1:
        ax.annotate('', xy=(sx + 2.7, flow_y + 0.15), xytext=(sx + 1.5, flow_y + 0.15),
                    arrowprops=dict(arrowstyle='->', color=G300, lw=1.5))

fig.savefig(f'{SAVE_DIR}/04_sistema_mtfa.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/04_sistema_mtfa.png')

