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

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans', 'SimHei'],
    'axes.unicode_minus': False,
    'figure.facecolor': '#FFFFFF',
    'savefig.dpi': 200,
})

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

fig = plt.figure(figsize=(18, 11))
fig.suptitle('Gestion de Riesgo: Tu Escudo contra la Liquidacion', fontsize=18, fontweight='bold',
             color=G900, y=0.97)
fig.text(0.08, 0.925, 'En cuentas de fondeo, sobrevivir es mas importante que ganar | Reglas de oro para no perder tu cuenta',
         fontsize=10, color=G500)

# ── Section 1: Daily Loss Limits (KPI Cards) ──
ax1 = fig.add_axes([0.04, 0.52, 0.60, 0.36])
ax1.set_xlim(0, 10)
ax1.set_ylim(0, 5)
ax1.axis('off')

kpis = [
    ('Perdida Maxima Diaria', '-3% a -5%', 'STOP TOTAL.\nNo operas mas hoy.', C_RED),
    ('Riesgo por Operacion', '0.25% - 0.5%', 'Del capital total.\nMax 1% si senal fuerte.', C_AMBER),
    ('Operaciones por Dia', '3 - 5 Max', 'Calidad > Cantidad.\nDespues de 2 perdidas: STOP.', C_BLUE),
    ('Risk:Reward Minimo', '1:2 o mejor', 'Nunca entres si R:R < 1:1.5.\nSL ajustado 3-5 ticks.', C_GREEN),
]

for i, (title, value, desc, color) in enumerate(kpis):
    cx = 0.3 + (i % 2) * 5
    cy = 3.5 - (i // 2) * 2.8
    
    card = FancyBboxPatch((cx, cy), 4.4, 2.3,
                           boxstyle="round,pad=0.1",
                           facecolor='white', edgecolor=color, linewidth=2)
    ax1.add_patch(card)
    
    # Color accent bar
    accent = FancyBboxPatch((cx, cy + 1.7), 4.4, 0.6,
                             boxstyle="round,pad=0.05",
                             facecolor=color, edgecolor='none', alpha=0.1)
    ax1.add_patch(accent)
    
    ax1.text(cx + 2.2, cy + 2.0, title, ha='center', va='center',
             fontsize=10, fontweight='bold', color=G900)
    ax1.text(cx + 2.2, cy + 1.1, value, ha='center', va='center',
             fontsize=22, fontweight='bold', color=color)
    ax1.text(cx + 2.2, cy + 0.35, desc, ha='center', va='center',
             fontsize=8.5, color=G500)

# ── Section 2: Position Sizing Table ──
ax2 = fig.add_axes([0.66, 0.52, 0.32, 0.36])
ax2.set_xlim(0, 5)
ax2.set_ylim(0, 5)
ax2.axis('off')

rect = FancyBboxPatch((0.1, 0.1), 4.8, 4.8,
                        boxstyle="round,pad=0.1",
                        facecolor='#F8FAFC', edgecolor=G200, linewidth=1.5)
ax2.add_patch(rect)

ax2.text(2.5, 4.5, 'TAMANO DE POSICION', ha='center', va='center',
         fontsize=12, fontweight='bold', color=G900)

# Table header
header_items = ['Capital', 'Riesgo/Op', 'Max Perdida']
header_x = [0.7, 2.2, 3.8]
for hx, ht in zip(header_x, header_items):
    ax2.text(hx, 3.85, ht, ha='center', va='center',
             fontsize=9, fontweight='bold', color=G700)

ax2.plot([0.4, 4.6], [3.55, 3.55], color=G300, linewidth=1)

table_data = [
    ('$10,000', '$25-$50', '$50-$100'),
    ('$25,000', '$63-$125', '$125-$250'),
    ('$50,000', '$125-$250', '$250-$500'),
    ('$100,000', '$250-$500', '$500-$1,000'),
]

for j, (cap, risk, max_loss) in enumerate(table_data):
    row_y = 3.15 - j * 0.65
    bg_color = '#FFFFFF' if j % 2 == 0 else '#F8FAFC'
    row_rect = FancyBboxPatch((0.3, row_y - 0.22), 4.2, 0.55,
                               boxstyle="round,pad=0.02",
                               facecolor=bg_color, edgecolor='none')
    ax2.add_patch(row_rect)
    
    vals = [cap, risk, max_loss]
    for hx, v in zip(header_x, vals):
        color = C_RED if '$' in risk and j == 0 else G700
        if hx == 2.2:
            color = C_AMBER
        if hx == 3.8:
            color = C_RED
        ax2.text(hx, row_y + 0.05, v, ha='center', va='center',
                 fontsize=9, color=color, fontweight='bold')

ax2.text(2.5, 0.55, '* Ajustar segun SL de la operacion', ha='center', va='center',
         fontsize=8, color=G500, style='italic')

# ── Section 3: Sequential Loss Rules ──
ax3 = fig.add_axes([0.04, 0.06, 0.92, 0.42])
ax3.set_xlim(0, 20)
ax3.set_ylim(0, 6)
ax3.axis('off')

ax3.text(10, 5.6, 'Protocolo de Perdidas Consecutivas: Cuando PARAR', ha='center', va='center',
         fontsize=14, fontweight='bold', color=G900)

loss_stages = [
    ('1ra Perdida', 'OK', 'Normal, parte del juego.\nRevisar que se cumplio el plan.', C_AMBER, 0.6),
    ('2da Perdida', 'ALERTA', 'Reducir tamano a MITAD.\nProxima entrada solo con R:R > 1:3.', C_AMBER, 5.2),
    ('3ra Perdida', 'STOP', 'PARAR de operar hoy.\nCerrar plataforma. Volver manana.', C_RED, 9.8),
    ('Dia Red', '-3% a -5%', 'STOP TOTAL DEL DIA.\nNo volver hasta manana.', C_RED, 14.4),
]

for i, (title, level, desc, color, x) in enumerate(loss_stages):
    # Card
    card = FancyBboxPatch((x, 0.5), 4.2, 4.5,
                           boxstyle="round,pad=0.1",
                           facecolor='white', edgecolor=color, linewidth=2)
    ax3.add_patch(card)
    
    # Level header
    header = FancyBboxPatch((x, 4.3), 4.2, 0.7,
                             boxstyle="round,pad=0.05",
                             facecolor=color, edgecolor='none', alpha=0.15)
    ax3.add_patch(header)
    
    ax3.text(x + 2.1, 4.65, title, ha='center', va='center',
             fontsize=12, fontweight='bold', color=color)
    
    # Level badge
    badge = FancyBboxPatch((x + 1.3, 3.2), 1.6, 0.7,
                             boxstyle="round,pad=0.08",
                             facecolor=color, edgecolor='none')
    ax3.add_patch(badge)
    ax3.text(x + 2.1, 3.55, level, ha='center', va='center',
             fontsize=11, fontweight='bold', color='white')
    
    # Description
    ax3.text(x + 2.1, 2.0, desc, ha='center', va='center',
             fontsize=9, color=G700, linespacing=1.5)
    
    # Arrow
    if i < len(loss_stages) - 1:
        ax3.annotate('', xy=(x + 4.7, 2.8), xytext=(x + 4.2, 2.8),
                     arrowprops=dict(arrowstyle='->', color=G300, lw=2))

fig.savefig(f'{SAVE_DIR}/05_gestion_riesgo.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/05_gestion_riesgo.png')

