import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
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
    'savefig.dpi': 200,
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

# ═══════════════════════════════════════════════════════
# CHART 6: Complete Setup Detail Cards (4 setups)
# ═══════════════════════════════════════════════════════
fig = plt.figure(figsize=(18, 14))
fig.suptitle('Los 4 Setups de Scalping: Guia Visual Completa', fontsize=18, fontweight='bold',
             color=G900, y=0.97)
fig.text(0.08, 0.945, 'Cada setup con sus condiciones, entrada, SL, TP y Win Rate historico | Solo operas cuando TODOS los filtros coinciden',
         fontsize=10, color=G500)

setups = [
    {
        'name': 'SETUP 1: TENDENCIA LIMPIA',
        'subtitle': 'El setup mas consistente y facil de identificar',
        'color': C_BLUE,
        'bg': '#EFF6FF',
        'winrate_nvda': '67%',
        'winrate_tsla': '62%',
        'ret': '+1.15%',
        'filters': [
            'VIX < 18 (sesgo long)',
            'QQQ en positivo',
            '1D/4H en tendencia alcista',
        ],
        'entry': [
            '1H: Precio en Order Block o zona de valor',
            '5M: Pullback + estructura confirma',
            '1M: Vela de rechazo o breakout',
        ],
        'sl_tp': 'SL: Debajo del OB | TP: 1:2 - 1:3 R:R',
        'best_time': '9:30-10:00, 14:30-15:30',
    },
    {
        'name': 'SETUP 2: GAP & GO',
        'subtitle': 'Aprovecha gaps de apertura con momentum',
        'color': C_GREEN,
        'bg': '#F0FDF4',
        'winrate_nvda': '63%',
        'winrate_tsla': '58%',
        'ret': '+1.42%',
        'filters': [
            'Gap alcista > 0.5% en apertura',
            'VIX < 20',
            'Volumen pre-market alto',
        ],
        'entry': [
            '5M: Primer pullback despues del gap',
            'Esperar retroceso al VWAP',
            '1M: Vela de continuacion',
        ],
        'sl_tp': 'SL: Bajo VWAP o min 5M | TP: Gap fill',
        'best_time': '9:30-10:30 unicamente',
    },
    {
        'name': 'SETUP 3: VIX CRASH REVERSAL',
        'subtitle': 'Compra cuando todos venden (contrario)',
        'color': C_AMBER,
        'bg': '#FFFBEB',
        'winrate_nvda': '69.6%',
        'winrate_tsla': '65%',
        'ret': '+2.06%',
        'filters': [
            'VIX spike > 3 el dia anterior',
            'NVDA/TSLA cayeron > 2%',
            'VIX hoy abre bajando',
        ],
        'entry': [
            '1H: Zona de soporte activa',
            '5M: Senal de agotamiento vendedores',
            '1M: Vela hammer o bullish engulfing',
        ],
        'sl_tp': 'SL: Bajo minimo reciente | TP: 1:3 R:R',
        'best_time': '10:00-12:00 (dia post-spike)',
    },
    {
        'name': 'SETUP 4: SHORT EN MIEDO',
        'subtitle': 'Venta en momentos de panico del mercado',
        'color': C_RED,
        'bg': '#FEF2F2',
        'winrate_nvda': '85%',
        'winrate_tsla': '78%',
        'ret': '+1.85%',
        'filters': [
            'VIX > 18 Y subiendo',
            'QQQ en negativo',
            'NVDA/TSLA debiles vs mercado',
        ],
        'entry': [
            '1H: Resistencia activa / supply zone',
            '5M: Rechazo en zona + baja estructura',
            '1M: Vela de rechazo bajista',
        ],
        'sl_tp': 'SL: Encima de resistencia | TP: 1:2 R:R',
        'best_time': '9:30-10:00, 14:00-15:00',
    },
]

for i, setup in enumerate(setups):
    # 2x2 grid layout
    col = i % 2
    row = 1 - (i // 2)
    
    x_start = 0.03 + col * 0.50
    y_start = 0.04 + row * 0.44
    
    ax = fig.add_axes([x_start, y_start, 0.47, 0.42])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Main card
    card = FancyBboxPatch((0.1, 0.1), 9.8, 9.8,
                           boxstyle="round,pad=0.12",
                           facecolor=setup['bg'], edgecolor=setup['color'], linewidth=2)
    ax.add_patch(card)
    
    # Header
    header = FancyBboxPatch((0.1, 8.5), 9.8, 1.4,
                             boxstyle="round,pad=0.08",
                             facecolor=setup['color'], edgecolor='none')
    ax.add_patch(header)
    ax.text(5, 9.55, setup['name'], ha='center', va='center',
            fontsize=12, fontweight='bold', color='white')
    ax.text(5, 8.85, setup['subtitle'], ha='center', va='center',
            fontsize=8.5, color='white', alpha=0.85)
    
    # Win Rate badges
    badge_nvda = FancyBboxPatch((0.4, 7.5), 2.8, 0.7,
                                 boxstyle="round,pad=0.05",
                                 facecolor='white', edgecolor=setup['color'], linewidth=1)
    ax.add_patch(badge_nvda)
    ax.text(1.8, 7.85, f'NVDA: {setup["winrate_nvda"]} WR', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=setup['color'])
    
    badge_tsla = FancyBboxPatch((3.6, 7.5), 2.8, 0.7,
                                 boxstyle="round,pad=0.05",
                                 facecolor='white', edgecolor=setup['color'], linewidth=1)
    ax.add_patch(badge_tsla)
    ax.text(5, 7.85, f'TSLA: {setup["winrate_tsla"]} WR', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=setup['color'])
    
    badge_ret = FancyBboxPatch((6.8, 7.5), 2.8, 0.7,
                                boxstyle="round,pad=0.05",
                                facecolor='white', edgecolor=C_GREEN, linewidth=1)
    ax.add_patch(badge_ret)
    ax.text(8.2, 7.85, f'Ret: {setup["ret"]}', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=C_GREEN)
    
    # Filters section
    ax.text(0.5, 7.0, 'FILTROS NECESARIOS:', ha='left', va='center',
            fontsize=8.5, fontweight='bold', color=setup['color'])
    
    for j, f in enumerate(setup['filters']):
        ax.text(0.7, 6.55 - j * 0.38, f'\u25A0  {f}', ha='left', va='center',
                fontsize=8, color=G700)
    
    # Entry section
    entry_y = 5.3
    ax.plot([0.4, 9.6], [entry_y + 0.2, entry_y + 0.2], color=G200, linewidth=0.8)
    ax.text(0.5, entry_y - 0.05, 'ENTRADA:', ha='left', va='center',
            fontsize=8.5, fontweight='bold', color=setup['color'])
    
    for j, e in enumerate(setup['entry']):
        ax.text(0.7, entry_y - 0.5 - j * 0.38, f'\u25B6  {e}', ha='left', va='center',
                fontsize=8, color=G700)
    
    # SL/TP and Best Time
    sl_y = 3.3
    ax.plot([0.4, 9.6], [sl_y + 0.3, sl_y + 0.3], color=G200, linewidth=0.8)
    
    sl_box = FancyBboxPatch((0.4, sl_y - 0.55), 5.8, 0.7,
                             boxstyle="round,pad=0.05",
                             facecolor='white', edgecolor=C_RED, linewidth=1)
    ax.add_patch(sl_box)
    ax.text(3.3, sl_y - 0.2, setup['sl_tp'], ha='center', va='center',
            fontsize=8, fontweight='bold', color=C_RED)
    
    time_box = FancyBboxPatch((6.5, sl_y - 0.55), 3.1, 0.7,
                               boxstyle="round,pad=0.05",
                               facecolor='white', edgecolor=C_BLUE, linewidth=1)
    ax.add_patch(time_box)
    ax.text(8.05, sl_y - 0.2, setup['best_time'], ha='center', va='center',
            fontsize=7.5, color=C_BLUE, fontweight='bold')
    
    ax.text(0.5, sl_y - 1.05, 'MEJOR MOMENTO:', ha='left', va='center',
            fontsize=7.5, color=G500)

fig.savefig(f'{SAVE_DIR}/06_4_setups_detalles.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/06_4_setups_detalles.png')

