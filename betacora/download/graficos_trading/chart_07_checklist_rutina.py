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

fig = plt.figure(figsize=(18, 13))
fig.suptitle('Tu Rutina Diaria Completa: De Pre-Market a Cierre', fontsize=18, fontweight='bold',
             color=G900, y=0.97)
fig.text(0.08, 0.94, 'Sigue esta rutina cada dia y tu disciplina se convertira en rentabilidad | Checklists visuales para cada fase',
         fontsize=10, color=G500)

# ── Timeline: Top section ──
ax_time = fig.add_axes([0.03, 0.62, 0.94, 0.28])
ax_time.set_xlim(0, 22)
ax_time.set_ylim(0, 6)
ax_time.axis('off')

phases = [
    {
        'time': '7:00 - 9:00',
        'name': 'PRE-MARKET',
        'color': C_BLUE,
        'x': 0.5,
        'items': ['Nivel VIX actual', 'Tendencia QQQ', '1D/4H NVDA/TSLA', 'Zonas 1H identificadas']
    },
    {
        'time': '9:30 - 10:00',
        'name': 'APERTURA',
        'color': C_RED,
        'x': 6.0,
        'items': ['Solo observar 5-10 min', 'Confirmar direccion', 'Buscar Gap & Go', 'NO entradas impulsivas']
    },
    {
        'time': '10:00 - 15:00',
        'name': 'SCALPING',
        'color': C_GREEN,
        'x': 11.5,
        'items': ['Esperar setup perfecto', 'Seguir checklist', 'Gestionar posiciones', 'Max 3-5 operaciones']
    },
    {
        'time': '15:00 - 16:00',
        'name': 'CIERRE',
        'color': C_AMBER,
        'x': 17.0,
        'items': ['Cerrar todas ops', 'Registrar trades', 'Analizar errores', 'Planificar manana']
    },
]

# Draw timeline line
ax_time.plot([1.5, 20.5], [3.0, 3.0], color=G200, linewidth=3, zorder=1)

for i, phase in enumerate(phases):
    x = phase['x']
    
    # Timeline dot
    dot = plt.Circle((x + 2.3, 3.0), 0.35, color=phase['color'], zorder=5)
    ax_time.add_patch(dot)
    ax_time.text(x + 2.3, 3.0, str(i+1), ha='center', va='center',
                 fontsize=14, fontweight='bold', color='white', zorder=6)
    
    # Phase card
    card = FancyBboxPatch((x, 3.8), 4.8, 2.0,
                           boxstyle="round,pad=0.1",
                           facecolor='white', edgecolor=phase['color'], linewidth=2)
    ax_time.add_patch(card)
    
    # Phase header
    hdr = FancyBboxPatch((x, 5.1), 4.8, 0.7,
                          boxstyle="round,pad=0.05",
                          facecolor=phase['color'], edgecolor='none')
    ax_time.add_patch(hdr)
    ax_time.text(x + 2.4, 5.45, phase['name'], ha='center', va='center',
                 fontsize=11, fontweight='bold', color='white')
    ax_time.text(x + 2.4, 4.75, phase['time'], ha='center', va='center',
                 fontsize=9, color=G500)
    
    # Items below timeline
    for j, item in enumerate(phase['items']):
        ax_time.text(x + 0.3, 2.2 - j * 0.5, f'\u2610  {item}', ha='left', va='center',
                     fontsize=8.5, color=G700)
    
    # Arrow to next
    if i < len(phases) - 1:
        ax_time.annotate('', xy=(phase['x'] + 5.3, 3.0), xytext=(phase['x'] + 4.7, 3.0),
                         arrowprops=dict(arrowstyle='->', color=G300, lw=2))

# ── Pre-Market Checklist Detail ──
ax_check = fig.add_axes([0.03, 0.03, 0.47, 0.55])
ax_check.set_xlim(0, 11)
ax_check.set_ylim(0, 11)
ax_check.axis('off')

rect = FancyBboxPatch((0.1, 0.1), 10.8, 10.8,
                        boxstyle="round,pad=0.1",
                        facecolor='#F8FAFC', edgecolor=C_BLUE, linewidth=2)
ax_check.add_patch(rect)

ax_check.text(5.5, 10.3, 'CHECKLIST PRE-MARKET', ha='center', va='center',
              fontsize=14, fontweight='bold', color=G900)
ax_check.text(5.5, 9.7, 'Completa esto ANTES de abrir tu plataforma de trading',
              ha='center', va='center', fontsize=9, color=G500)

checklist = [
    ('Nivel VIX actual', 'VIX < 18 = sesgo Long | VIX > 18 = sesgo Short o NO operar', C_BLUE),
    ('Direccion QQQ pre-market', 'QQQ verde = buscar Longs | QQQ rojo = buscar Shorts', C_GREEN),
    ('Tendencia NVDA en 1D/4H', 'Alcista = HH/HL | Bajista = LH/LL | Lateral = PRECAUCION', C_BLUE),
    ('Tendencia TSLA en 1D/4H', 'Mismo analisis que NVDA', C_BLUE),
    ('Niveles clave 1H', 'Order Blocks, zonas de soporte/resistencia, VWAP', C_CYAN),
    ('Escenarios de VIX', 'Hubo spike > 3 ayer? = Buscar reversales', C_AMBER),
    ('Perdidas acumuladas esta semana', 'Si > 5% semanal = REDUCIR tamano o descansar', C_RED),
    ('Tamaño de posicion calculado', 'Riesgo 0.25-0.5% por operacion (según SL)', C_GREEN),
    ('Plan del dia definido', 'Que setups buscar, en que activos, que niveles', C_PURPLE),
    ('Estado mental correcto', 'Descansado, sin emociones, enfocado', C_AMBER),
]

for i, (item, detail, color) in enumerate(checklist):
    y = 9.0 - i * 0.85
    
    # Checkbox
    checkbox = FancyBboxPatch((0.4, y - 0.25), 0.45, 0.45,
                               boxstyle="round,pad=0.03",
                               facecolor='white', edgecolor=color, linewidth=1.5)
    ax_check.add_patch(checkbox)
    
    # Item name
    ax_check.text(1.1, y + 0.05, item, ha='left', va='center',
                  fontsize=9.5, fontweight='bold', color=G900)
    ax_check.text(1.1, y - 0.28, detail, ha='left', va='center',
                  fontsize=8, color=G500)

# ── Indicators Dashboard ──
ax_ind = fig.add_axes([0.52, 0.03, 0.46, 0.55])
ax_ind.set_xlim(0, 11)
ax_ind.set_ylim(0, 11)
ax_ind.axis('off')

rect2 = FancyBboxPatch((0.1, 0.1), 10.8, 10.8,
                         boxstyle="round,pad=0.1",
                         facecolor='#F8FAFC', edgecolor=C_PURPLE, linewidth=2)
ax_ind.add_patch(rect2)

ax_ind.text(5.5, 10.3, 'INDICADORES OPTIMOS PARA SCALPING', ha='center', va='center',
            fontsize=14, fontweight='bold', color=G900)
ax_ind.text(5.5, 9.7, 'Solo usa estos indicadores con tu grafico de 1 min',
            ha='center', va='center', fontsize=9, color=G500)

# Recommended indicators
ax_ind.text(5.5, 9.1, 'USA ESTOS (Recomendados)', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C_GREEN)

indicators_yes = [
    ('VWAP Intradia', 'Referencia de precio justo. Todo el dia.', 'Esencial'),
    ('EMA 9 + EMA 20', 'Tendencia a corto plazo en 1M y 5M.', 'Muy util'),
    ('Volumen', 'Confirma movimientos. Sin volumen = trampa.', 'Esencial'),
    ('Nivel PDH/PDL', 'Previous Day High/Low. Soporte/Resistencia.', 'Importante'),
    ('Order Blocks 1H', 'Zonas donde grandes orders entraron.', 'Avanzado'),
]

for i, (name, desc, level) in enumerate(indicators_yes):
    y = 8.4 - i * 0.75
    color = C_GREEN if level == 'Esencial' else (C_BLUE if level == 'Muy util' else C_CYAN)
    ax_ind.text(0.5, y + 0.05, f'\u2714  {name}', ha='left', va='center',
                fontsize=9.5, fontweight='bold', color=color)
    ax_ind.text(0.8, y - 0.25, desc, ha='left', va='center', fontsize=8, color=G500)
    
    # Level badge
    badge = FancyBboxPatch((8.5, y - 0.18), 2.0, 0.4,
                            boxstyle="round,pad=0.03",
                            facecolor=color, edgecolor='none', alpha=0.15)
    ax_ind.add_patch(badge)
    ax_ind.text(9.5, y + 0.02, level, ha='center', va='center',
                fontsize=7.5, fontweight='bold', color=color)

# Not recommended
ax_ind.plot([0.5, 10.5], [4.5, 4.5], color=G200, linewidth=1)
ax_ind.text(5.5, 4.1, 'EVITA ESTOS (Te confunden en 1 min)', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C_RED)

indicators_no = [
    ('RSI', 'Lento, te da senales tardias en 1M.'),
    ('MACD', 'Diseñado para graficos diarios, NO para 1M.'),
    ('Bollinger Bands', 'En 1M dan demasiadas senales falsas.'),
    ('Stochastic', 'Sobrecompra/sobreventa inutil en scalping.'),
    ('Fibonacci', 'Subjetivo. Demasiados niveles posibles.'),
]

for i, (name, desc) in enumerate(indicators_no):
    y = 3.4 - i * 0.7
    ax_ind.text(0.5, y + 0.05, f'\u2718  {name}', ha='left', va='center',
                fontsize=9.5, fontweight='bold', color=C_RED, alpha=0.7)
    ax_ind.text(0.8, y - 0.25, desc, ha='left', va='center', fontsize=8, color=G400)

fig.savefig(f'{SAVE_DIR}/07_rutina_checklist.png', dpi=200, facecolor='white', bbox_inches='tight')
plt.close(fig)
print(f'Saved: {SAVE_DIR}/07_rutina_checklist.png')

