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

fig, ax = plt.subplots(figsize=(18, 10))
ax.set_xlim(0, 18)
ax.set_ylim(0, 10)
ax.axis('off')

# Title
ax.text(9, 9.6, 'RESUMEN EJECUTIVO: Tu Plan de Trading en 1 Imagen', ha='center', va='center',
        fontsize=18, fontweight='bold', color=G900)
ax.text(9, 9.15, 'Guarda esta imagen en tu escritorio y revisala antes de cada sesion',
        ha='center', va='center', fontsize=11, color=G500)

# ── Row 1: Core Filters ──
# VIX Box
vix_box = FancyBboxPatch((0.3, 6.2), 5.4, 2.5,
                          boxstyle="round,pad=0.1",
                          facecolor='#FEF2F2', edgecolor=C_RED, linewidth=2)
ax.add_patch(vix_box)
vix_hdr = FancyBboxPatch((0.3, 8.1), 5.4, 0.6,
                          boxstyle="round,pad=0.05",
                          facecolor=C_RED, edgecolor='none')
ax.add_patch(vix_hdr)
ax.text(3.0, 8.4, 'FILTRO VIX (Tu brujula)', ha='center', va='center',
        fontsize=11, fontweight='bold', color='white')
ax.text(3.0, 7.6, 'VIX < 18  =  Solo LONGS', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_GREEN)
ax.text(3.0, 7.1, 'VIX > 18  =  Solo SHORTS o NO', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_RED)
ax.text(3.0, 6.6, 'VIX > 28  =  CERRAR plataforma', ha='center', va='center',
        fontsize=9, color=C_RED, fontweight='bold')

# QQQ Box
qqq_box = FancyBboxPatch((6.3, 6.2), 5.4, 2.5,
                          boxstyle="round,pad=0.1",
                          facecolor='#F0FDF4', edgecolor=C_GREEN, linewidth=2)
ax.add_patch(qqq_box)
qqq_hdr = FancyBboxPatch((6.3, 8.1), 5.4, 0.6,
                          boxstyle="round,pad=0.05",
                          facecolor=C_GREEN, edgecolor='none')
ax.add_patch(qqq_hdr)
ax.text(9.0, 8.4, 'FILTRO QQQ (Tu GPS direccional)', ha='center', va='center',
        fontsize=11, fontweight='bold', color='white')
ax.text(9.0, 7.6, 'QQQ Sube  =  NVDA sube 78.2%', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_GREEN)
ax.text(9.0, 7.1, 'QQQ Baja  =  NVDA baja 72.6%', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_RED)
ax.text(9.0, 6.6, 'Nunca operas CONTRA el QQQ', ha='center', va='center',
        fontsize=9, color=G700, fontweight='bold')

# MTFA Box
mtfa_box = FancyBboxPatch((12.3, 6.2), 5.4, 2.5,
                           boxstyle="round,pad=0.1",
                           facecolor='#EFF6FF', edgecolor=C_BLUE, linewidth=2)
ax.add_patch(mtfa_box)
mtfa_hdr = FancyBboxPatch((12.3, 8.1), 5.4, 0.6,
                           boxstyle="round,pad=0.05",
                           facecolor=C_BLUE, edgecolor='none')
ax.add_patch(mtfa_hdr)
ax.text(15.0, 8.4, 'MTFA (Tu sistema)', ha='center', va='center',
        fontsize=11, fontweight='bold', color='white')
ax.text(15.0, 7.6, '1D/4H = Tendencia (40%)', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_BLUE)
ax.text(15.0, 7.1, '1H = Zonas | 5M = Confirma | 1M = Entra', ha='center', va='center',
        fontsize=10, fontweight='bold', color=C_CYAN)
ax.text(15.0, 6.6, 'Siempre del macro al micro', ha='center', va='center',
        fontsize=9, color=G700, fontweight='bold')

# ── Row 2: 4 Setups Summary ──
setup_y = 3.8
setup_h = 2.0
setup_data = [
    ('1.TENDENCIA LIMPIA', 'NVDA 67% | TSLA 62%', '+1.15%', C_BLUE, '#EFF6FF'),
    ('2.GAP & GO', 'NVDA 63% | TSLA 58%', '+1.42%', C_GREEN, '#F0FDF4'),
    ('3.VIX CRASH REVERSAL', 'NVDA 70% | TSLA 65%', '+2.06%', C_AMBER, '#FFFBEB'),
    ('4.SHORT EN MIEDO', 'NVDA 85% | TSLA 78%', '+1.85%', C_RED, '#FEF2F2'),
]

for i, (name, wr, ret, color, bg) in enumerate(setup_data):
    x = 0.3 + i * 4.5
    
    box = FancyBboxPatch((x, setup_y), 4.2, setup_h,
                          boxstyle="round,pad=0.1",
                          facecolor=bg, edgecolor=color, linewidth=2)
    ax.add_patch(box)
    
    # Header
    hdr = FancyBboxPatch((x, setup_y + 1.4), 4.2, 0.6,
                          boxstyle="round,pad=0.05",
                          facecolor=color, edgecolor='none')
    ax.add_patch(hdr)
    ax.text(x + 2.1, setup_y + 1.7, name, ha='center', va='center',
            fontsize=9, fontweight='bold', color='white')
    
    ax.text(x + 2.1, setup_y + 0.95, wr, ha='center', va='center',
            fontsize=9, fontweight='bold', color=G900)
    
    # Return badge
    ret_badge = FancyBboxPatch((x + 1.2, setup_y + 0.15), 1.8, 0.5,
                                boxstyle="round,pad=0.05",
                                facecolor=C_GREEN, edgecolor='none', alpha=0.15)
    ax.add_patch(ret_badge)
    ax.text(x + 2.1, setup_y + 0.4, f'Retorno: {ret}', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=C_GREEN)

# Arrows between setups
for i in range(3):
    x = 4.5 + i * 4.5
    ax.annotate('', xy=(x + 0.5, setup_y + 1.0), xytext=(x, setup_y + 1.0),
                arrowprops=dict(arrowstyle='->', color=G300, lw=1.5))

# ── Row 3: Key Rules ──
rules_y = 1.2
rules_rect = FancyBboxPatch((0.3, 0.1), 17.4, 2.3,
                             boxstyle="round,pad=0.1",
                             facecolor='#F8FAFC', edgecolor=G200, linewidth=1.5)
ax.add_patch(rules_rect)

ax.text(9, 2.15, 'REGLAS DE ORO', ha='center', va='center',
        fontsize=13, fontweight='bold', color=G900)

rules = [
    ('Riesgo max 0.5%/op', C_RED),
    ('Max 5 ops/dia', C_AMBER),
    ('2 perdidas seguidas = STOP', C_RED),
    ('R:R minimo 1:2', C_GREEN),
    ('PDH/PDL como ref', C_BLUE),
    ('VWAP intradia SIEMPRE', C_CYAN),
    ('Sin emociones, solo plan', C_PURPLE),
    ('Revisar antes de abrir', C_GREEN),
]

for i, (rule, color) in enumerate(rules):
    rx = 0.8 + i * 2.15
    ax.text(rx, 1.3, f'\u2714', ha='left', va='center',
            fontsize=10, color=color, fontweight='bold')
    ax.text(rx + 0.3, 1.3, rule, ha='left', va='center',
            fontsize=8, color=G700, fontweight='bold')
    ax.text(rx, 0.65, f'\u25CF', ha='left', va='center',
            fontsize=6, color=color)

fig.savefig(f'{SAVE_DIR}/08_resumen_ejecutivo.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/08_resumen_ejecutivo.png')

