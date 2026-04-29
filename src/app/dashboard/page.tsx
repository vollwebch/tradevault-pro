'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'
import { LayoutDashboard, BookOpen, BarChart3, GraduationCap, User, LogIn, Plus, Pencil, Trash2, X, Menu, TrendingUp, TrendingDown, Trophy, Target, Flame, DollarSign, Activity, Calendar, Shield, Upload, LogOut, Eye, Clock, Award, Zap, Calculator, ClipboardCheck, Brain, Timer, Wallet, Gamepad2, CalendarDays, Grid3X3, BookMarked, FileText } from 'lucide-react'

/* ─── TYPES ─── */
interface User { id:string;email:string;name:string;avatar:string|null;broker:string|null;createdAt:string;password?:string }
interface Trade { id:number;userId:string;date:string;symbol:string;direction:string;entryPrice:number;exitPrice:number;stopLoss:number|null;takeProfit:number|null;shares:number;commission:number|null;brokerFees:number|null;profitSplit:number|null;realPnl:number|null;setup:string|null;notes:string|null;emotion:number|null;screenshot:string|null;tags:string|null;createdAt:string;_dbId?:string }
const DEFAULT_SETUPS=['VWAP Bounce','Bollinger Squeeze','EMA Cross','Gap Fill','Reversal','Otro']
const DEFAULT_SYMBOLS=['TSLA','SPY','AAPL','NVDA','AMZN','META','GOOGL','MSFT','AMD','QQQ']

/* ─── STORAGE ─── */
function getStore<T>(k:string,f:T){if(typeof window==='undefined')return f;try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function setStore<T>(k:string,v:T){if(typeof window!=='undefined')localStorage.setItem(k,JSON.stringify(v))}

/* ─── HELPERS ─── */
function calcPnL(t:Trade){const raw=t.direction==='LONG'?(t.exitPrice-t.entryPrice)*t.shares:(t.entryPrice-t.exitPrice)*t.shares;const comm=t.commission||0;return raw-comm}
function calcRealPnL(t:Trade){if(t.realPnl!=null)return t.realPnl;return calcPnL(t)}
function fmt$(n:number){return `$${n>=0?'+':''}${n.toFixed(2)}`}
function fmtDate(d:string){return new Date(d).toLocaleDateString('es-US',{month:'short',day:'numeric',year:'numeric'})}
function fmtDateShort(d:string){return new Date(d).toLocaleDateString('es-US',{month:'short',day:'numeric'})}
const COLORS=['#00c853','#e31937','#00d4ff','#a855f7','#f59e0b','#ff6b00','#14b8a6','#ef4444']

/* ─── IMAGE COMPRESSOR ─── */
function compressImage(file:File,maxW=1200,maxH=1200,quality=0.95):Promise<string>{
  return new Promise((resolve)=>{
    const img=new Image()
    img.onload=()=>{
      const canvas=document.createElement('canvas')
      let w=img.width,h=img.height
      if(w>maxW||h>maxH){const r=Math.min(maxW/w,maxH/h);w=Math.round(w*r);h=Math.round(h*r)}
      canvas.width=w;canvas.height=h
      const ctx=canvas.getContext('2d')!
      ctx.imageSmoothingEnabled=true
      ctx.imageSmoothingQuality='high'
      ctx.drawImage(img,0,0,w,h)
      // Try WebP first (better compression), fallback to JPEG
      const webp=canvas.toDataURL('image/webp',quality)
      const jpeg=canvas.toDataURL('image/jpeg',quality)
      resolve(webp.length<jpeg.length?webp:jpeg)
    }
    img.src=URL.createObjectURL(file)
  })
}

/* ─── STATS CALCULATOR ─── */
function calcStats(trades:Trade[],period?:string){
  let t=[...trades]
  if(period&&period!=='all'){const d=parseInt(period);const c=new Date();c.setDate(c.getDate()-d);c.setHours(0,0,0,0);t=t.filter(x=>new Date(x.date)>=c)}
  t.sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime())
  if(!t.length)return{totalTrades:0,winRate:0,totalPnL:0,avgPnL:0,profitFactor:0,avgWin:0,avgLoss:0,largestWin:0,largestLoss:0,bestDay:0,worstDay:0,currentStreak:0,streakType:'win',maxDrawdown:0,pnlByDay:[],pnlBySetup:[],pnlByHour:[],pnlByDayOfWeek:[],winRateBySetup:[],setupDistribution:[],equityCurve:[]}
  const pnls=t.map(calcRealPnL),wins=pnls.filter(p=>p>0),losses=pnls.filter(p=>p<0)
  const w=Math.round(wins.length/t.length*100),tp=pnls.reduce((a,b)=>a+b,0),aw=wins.length?wins.reduce((a,b)=>a+b,0)/wins.length:0
  const al=losses.length?losses.reduce((a,b)=>a+b,0)/losses.length:0
  const gw=wins.reduce((a,b)=>a+b,0),gl=Math.abs(losses.reduce((a,b)=>a+b,0))
  const pf=gl>0?gw/gl:gw>0?Infinity:0
  const dm=new Map<string,number>();t.forEach((tr,i)=>{const d=fmtDateShort(tr.date);dm.set(d,(dm.get(d)||0)+pnls[i])})
  const pbd=Array.from(dm.entries()).map(([date,pnl])=>({date,pnl}))
  const bd=pbd.length?Math.max(...pbd.map(d=>d.pnl)):0,wdd=pbd.length?Math.min(...pbd.map(d=>d.pnl)):0
  const sm=new Map<string,{p:number,w:number,c:number}>();t.forEach((tr,i)=>{const s=tr.setup||'Otro';const e=sm.get(s)||{p:0,w:0,c:0};e.p+=pnls[i];e.c++;if(pnls[i]>0)e.w++;sm.set(s,e)})
  const pbs=Array.from(sm.entries()).map(([setup,d])=>({setup,pnl:Math.round(d.p*100)/100,winRate:Math.round(d.w/d.c*100),count:d.c}))
  let cs=0,st='win';for(let i=pnls.length-1;i>=0;i--){const w2=pnls[i]>0;if(i===pnls.length-1){st=w2?'win':'loss';cs=1}else if((st==='win'&&w2)||(st==='loss'&&!w2))cs++;else break}
  let peak=0,mdd=0,cum=0;pnls.forEach(p=>{cum+=p;if(cum>peak)peak=cum;const dd=peak-cum;if(dd>mdd)mdd=dd})
  let eq=0;const ec=t.map(tr=>{eq+=calcRealPnL(tr);return{date:fmtDateShort(tr.date),equity:Math.round(eq*100)/100}})
  const hm=new Map<number,number>();t.forEach((tr,i)=>{const h=new Date(tr.date).getHours();hm.set(h,(hm.get(h)||0)+pnls[i])})
  const pbh=Array.from(hm.entries()).map(([hour,pnl])=>({hour,pnl:Math.round(pnl*100)/100})).sort((a,b)=>a.hour-b.hour)
  const dn=['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];const dwm=new Map<number,number>();t.forEach((tr,i)=>{const d=new Date(tr.date).getDay();dwm.set(d,(dwm.get(d)||0)+pnls[i])})
  const pbdow=Array.from(dwm.entries()).map(([dow,pnl])=>({day:dn[dow],dow,pnl:Math.round(pnl*100)/100})).sort((a,b)=>a.dow-b.dow)
  return{totalTrades:t.length,winRate:w,totalPnL:Math.round(tp*100)/100,avgPnL:Math.round(tp/t.length*100)/100,profitFactor:pf,avgWin:Math.round(aw*100)/100,avgLoss:Math.round(al*100)/100,largestWin:wins.length?Math.round(Math.max(...wins)*100)/100:0,largestLoss:losses.length?Math.round(Math.min(...losses)*100)/100:0,bestDay:Math.round(bd*100)/100,worstDay:Math.round(wdd*100)/100,currentStreak:cs,streakType:st,maxDrawdown:Math.round(mdd*100)/100,pnlByDay:pbd,pnlBySetup:pbs,pnlByHour:pbh,pnlByDayOfWeek:pbdow,winRateBySetup:pbs.map(s=>({setup:s.setup,winRate:s.winRate,count:s.count})),setupDistribution:pbs.map(s=>({setup:s.setup,count:s.count})),equityCurve:ec}
}

/* ─── COURSE MODULES (15) ─── */
const MODULES=[
{id:'m1',title:'Module 1: Tesla como Instrumento de Trading',icon:'⚡',color:'#e31937',subtitle:'Por que Tesla es diferente a cualquier otra accion',content:[
{heading:'Por que Tesla es el Rey del Scalping',text:'Tesla (TSLA) no es una accion normal. Es un vehiculo de trading unico que combina alta volatilidad, volumen masivo y movimiento constante. Mientras que el SPY se mueve 0.5% en un dia, Tesla puede moverse 3-8% en una sola sesion. Esto significa que como scalper, tienes MUCHAS mas oportunidades de entrada y salida durante el dia. Tesla promedia entre 50-80 millones de acciones negociadas por dia, lo que te da liquidez absoluta para entrar y salir posiciones en cualquier momento sin slippage significativo. La volatilidad promedio diaria (ATR) de Tesla es de 4-7 dolares en terminos de precio, lo que en porcentaje representa movimientos de 2-4% diarios. Esto es 3-5 veces mas que el promedio del S&P 500.'},
{heading:'El ADN de Tesla: Factores que Mueven el Precio',text:'Tesla responde a multiples catalizadores que debes conocer: (1) Tuites de Elon Musk - un solo tweet puede mover la accion 2-10% en minutos, especialmente temas de autonomia, nueva tecnologia, o datos de entregas. (2) Datos de entregas trimestrales - publicados los primeros dias de cada trimestre, causan movimientos gap de 5-15%. (3) Earnings reports - Tesla reporta earnings en enero, abril, julio y octubre. Las horas previas y posteriores son de EXTREMA volatilidad. (4) Cambios en politicas de incentivos para EVs en China, Europa y EEUU. (5) Anuncios de nuevos modelos (Model 2, Cybertruck updates, Robotaxi). (6) Datos macro del sector automotriz y competencia (BYD, Rivian, Ford). Como scalper, no necesitas analizar todos estos fundamentalmente, pero DEBES saber cuando ocurren porque cambian el comportamiento del precio completamente.'},
{heading:'Perfil de Volatilidad de Tesla por Hora del Dia',text:'Los patrones intradia de Tesla son predecibles: (1) Pre-market (4:00-9:30 ET): Volumen bajo pero alta volatilidad por noticias. Movimientos de 1-3% son comunes con poco volumen. (2) Apertura (9:30-10:00 ET): La hora MAS volatil. Tesla puede mover 2-5% en los primeros 30 minutos. VWAP se establece aqui. (3) Manana (10:00-12:00 ET): Tendencia se establece. Buen momento para swing trades cortos. ADX suele dar las lecturas mas claras. (4) Mediodia (12:00-14:00 ET): "Lunch lull" - volumen baja, rangos se estrechan. PEOR momento para scalping. False breakouts son comunes. (5) Tarde (14:00-15:30 ET): Volumen regresa. Breakouts del rango del mediodia suelen ser genuinos. (6) Cierre (15:30-16:00 ET): Alta volatilidad por cierre de posiciones institucionales.'},
{heading:'Estadisticas Clave de Tesla que Debes Saber',text:'Datos historicos que todo trader de Tesla debe memorizar: Rango promedio diario: $4.50-$7.00 (2.5-4% del precio). Gap up promedio: +1.8%. Gap down promedio: -2.1%. Probabilidad de gap fill (parcial): 62%. Probabilidad de gap fill (completo): 38%. Promedio de movimientos intradia > 3%: 3-4 veces por semana. Dias rojos vs verdes: aproximadamente 52% verdes vs 48% rojos. Volatilidad post-earnings: promedio de movimiento de 8-12% en las 24 horas posteriores. El beta de Tesla vs S&P 500 es de aproximadamente 2.1, lo que significa que se mueve el doble que el mercado en cualquier direccion.'}
]},
{id:'m2',title:'Module 2: Historial de Precios y Patrones',icon:'📊',color:'#00d4ff',subtitle:'Decadas de datos destilados en conocimiento accionable',content:[
{heading:'La Historia Completa de Tesla en el Precio',text:'Tesla salio a bolsa en junio de 2010 a $17 por accion (ajustado por splits seria ~$1.13). El recorrido ha sido espectacular: de $17 a $265 en 2020 (pre-split), luego el split 5:1 en agosto 2020, llegando a $414 por accion post-split (~$2070 pre-split equivalente) en noviembre 2021. Desde el ATH de noviembre 2021, Tesla corrijo un 73% hasta los $101 en enero 2023. Luego recupero hasta los $299 en julio 2024.'},
{heading:'Niveles Criticos de Soporte y Resistencia',text:'Basado en el analisis historico reciente (2023-2026), Tesla tiene estos niveles clave: Resistencia mayor: $350 (doble top historico). Resistencia intermedia: $300 (nivel psicologico). Soporte intermedio: $200 (zona de valor institucional). Soporte mayor: $150 (zona de acumulacion). Nivel critico: $100 (soporte historico absoluto). Para scalping en 1-min, los niveles intradia mas importantes son: VWAP del dia, High/Low del dia anterior.'},
{heading:'Patrones de Precio que se Repiten en Tesla',text:'(1) Gap and Trap: Tesla abre en gap, los retail entran, y el precio revierte. Ocurre ~40% de las veces. (2) VWAP Grab: En dias de tendencia fuerte, Tesla se pega al VWAP como un iman. (3) Afternoon Reversal: Tesla tiene tendencia a revertir entre 2:00-3:00 PM ET. (4) Earnings Volatility Squeeze: Antes de earnings la volatilidad se comprime y post-earnings explota.'},
{heading:'Analisis Estacional de Tesla',text:'Q1 (Enero-Marzo): Generalmente debil. Enero es el mas volatil. Q2 (Abril-Junio): Earnings de abril dan direction. Q3 (Julio-Septiembre): Julio debil, Septiembre el peor mes. Q4 (Octubre-Diciembre): El trimestre MAS fuerte. Entregas Q4 son las mas altas.'}
]},
{id:'m3',title:'Module 3: Indicadores Optimizados para Tesla',icon:'🎯',color:'#00ff88',subtitle:'Configuraciones exactas probadas para TSLA en 1-minuto',content:[
{heading:'INDICADOR #1 OBLIGATORIO: VWAP',text:'El VWAP es el precio promedio ponderado por volumen. Es EL indicador que las instituciones usan. Tesla lo respeta excepcionalmente. REGLAS: (1) Precio arriba del VWAP = sesgo alcista. (2) Precio abajo = sesgo bajista. (3) Cruce del VWAP con volumen = cambio de sesgo. (4) Tesla revierte desde las bandas de 2 desviaciones en 72% de las veces.'},
{heading:'INDICADOR #2 OBLIGATORIO: Bollinger Bands (20,2)',text:'PERFECTAS para la volatilidad extrema de Tesla. REGLAS: (1) Bollinger Squeeze = explosion inminente. (2) Touch banda superior + RSI > 70 = senal de venta corta. (3) Touch banda inferior + RSI < 30 = senal de compra. (4) Bandwidth < 0.5% = squeeze extremo.'},
{heading:'INDICADOR #3 OBLIGATORIO: Volumen',text:'El volumen es la VERDAD del mercado. REGLAS: (1) Todo breakout DEBE confirmarse con volumen > promedio. (2) Volume Profile: Identifica "Point of Control". (3) Climax de volumen (3x+ promedio) = punto de giro probable.'},
{heading:'Tu Setup Optimizado Completo (7 Indicadores)',text:'(1) VWAP + Bandas - Define sesgo y niveles. (2) EMA 9 - Tendencia inmediata. (3) EMA 21 - Confirma tendencia. (4) EMA 45 - Soporte dinamico. (5) RSI(9) - Mas rapido que RSI(14). (6) MACD(6,12,6) - Perfecto para TSLA. (7) Bollinger Bands(20,2) - Squeezes y extremos.'}
]},
{id:'m4',title:'Module 4: Setups de Scalping 1-Minuto',icon:'🔥',color:'#ff6b00',subtitle:'Estrategias paso a paso que puedes usar AHORA en Webull',content:[
{heading:'Setup #1: VWAP Bounce (WR: 62-68%)',text:'PASOS: (1) Espera post-apertura (9:45-10:00 ET minimo). (2) Identifica sesgo: arriba VWAP = largos, abajo = cortos. (3) Espera pullback al VWAP. (4) Verifica: RSI no extremo, MACD alineado, volumen > promedio. (5) Target: banda VWAP 1 desviacion. (6) Stop: 10-15 centavos del VWAP. R:R 1:1.5 a 1:2. Ocurre 3-8 veces por dia.'},
{heading:'Setup #2: Bollinger Squeeze Breakout (WR: 55-60%)',text:'PASOS: (1) Identifica squeeze (bandas estrechas 20+ velas). (2) Espera breakout con volumen > 1.5x promedio. (3) Target: distancia del squeeze. (4) Stop: banda opuesta. R:R 1:2 a 1:3.'},
{heading:'Setup #3: EMA Ribbon Cross + VWAP (WR: 58-64%)',text:'EMA 9 cruza EMA 21 = senal. FILTRO CRITICO: precio del lado correcto del VWAP. Target: proximo S/R intradia. Stop: debajo/encima EMA 45.'},
{heading:'Setup #4: Gap Fill Scalp (WR: 55-62%)',text:'Gaps < 1% se llenan 65% del tiempo. Espera 15-30 min tras apertura. Target: 50-100% del gap. A las 10:30 ET si no empezo a llenarse, ABANDONA.'},
{heading:'Setup #5: Reversal S/R Intradia (WR: 52-58%)',text:'Marca high/low del dia a las 10:30 ET. Precio regresa al high + RSI > 75 + volumen bajando = corta. NECESITAS confirmacion de vela. Target: VWAP del dia.'}
]},
{id:'m5',title:'Module 5: Secretos de Rentabilidad',icon:'💎',color:'#a855f7',subtitle:'Lo que el 95% de los traders de Tesla NO saben',content:[
{heading:'Secreto #1: Los Primeros 30 Minutos Definen el Dia',text:'9:30-10:00 ET define toda la sesion. Tesla abre fuerte + VWAP soporte = LARGOS todo el dia. Rango estrecho (< $1) = dia de RANGO. Movimiento fuerte (> $2) = dia de TENDENCIA.'},
{heading:'Secreto #2: Tesla Respeta los Niveles de Opcion',text:'Viernes OpEx: Tesla gravita al "max pain". Strikes redondos con mayor OI = imanes. "Gamma squeeze": market makers compran acciones para cubrir opciones, causando movimientos explosivos.'},
{heading:'Secreto #3: El Power Hour (3:00-4:00 PM ET)',text:'Volumen 40-60% mayor que el resto del dia. Breakouts post-3 PM son 70% genuinos. EVITA 3:45-4:00 PM: manipulacion puede revertir todo.'},
{heading:'Las 3 Reglas de Oro',text:'#1 NUNCA operes contra el VWAP en los primeros 60 minutos. #2 Tu mejor amigo es el R:R. Minimo 1:1.5. #3 DIAS DE RANGO = NO uses estrategia de tendencia. Los rentables NO operan todos los dias.'}
]},
{id:'m6',title:'Module 6: Gestion de Riesgo Profesional',icon:'🛡️',color:'#ff3366',subtitle:'Sin esto, nada de lo anterior importa',content:[
{heading:'Calculo de Position Size',text:'Formula: Shares = (Capital x Riesgo%) / (Distancia al Stop). Ejemplo: Capital $25,000, Riesgo 1% = $250. Stop $0.50 = 500 acciones maximo. Maximo 5% del capital por dia.'},
{heading:'Donde Colocar Stop Loss',text:'Stop TECNICO: Debajo VWAP, debajo EMA 45, 5-10c bajo low de vela de entrada. Stop de tiempo: si no se mueve en 5-10 min, sal. NUNCA muevas stop ALEJANDO riesgo.'},
{heading:'Take Profit: Sistema por Tiers',text:'(1) Tier 1: 50% posicion en 1:1 R:R. (2) Tier 2: 30% en 1:2 R:R. (3) Runner: 20% con trailing stop a breakeven.'},
{heading:'El Diario de Trading',text:'OBLIGATORIO. Registra: fecha/hora, setup, direccion, precios, resultado, captura, estado emocional 1-10. Traders con diario mejoran 30-50% mas rapido.'}
]},
{id:'m7',title:'Module 7: Psicologia del Trader',icon:'🧠',color:'#14b8a6',subtitle:'El 80% del trading es mental',content:[
{heading:'FOMO: El Error #1',text:'Tesla genera MAS FOMO que cualquier accion. Trades por FOMO = WR solo 28-35% vs 58-65% con setup. REGLAS: Perdiste un movimiento = el proximo NO es tuyo.'},
{heading:'Tilt: Cuando Pierdes el Control',text:'ANTI-TILT: 2 perdidas seguidas = 30 min descanso. 3 perdidas = DIA TERMINADO. Max daily loss 3-5% = dia acabado.'},
{heading:'Mentalidad del Scalper Rentable',text:'(1) Piensa en PROBABILIDADES. (2) Acepta perdidas como costo. (3) Enfocate en PROCESO, no resultado. (4) PACIENCIA para esperar setup. (5) Consistencia es ABURRIDA y eso esta bien.'}
]},
{id:'m8',title:'Module 8: Errores Fatales',icon:'💀',color:'#dc2626',subtitle:'Los errores que destruyen cuentas',content:[
{heading:'Error #1: Operar Todas las Horas',text:'OPTIMO: 9:30-10:30 ET, 10:30-11:30 ET, 14:00-15:30 ET. EVITAR: 12:00-14:00 ET (lunch lull). MAXIMO 2-3 horas/dia.'},
{heading:'Error #2: Averaging Down',text:'NUNCA promedies posicion perdedora en 1-min. Si stop se toca, SAL. Maximo 2 adiciones. Perdida maxima por idea = 1% del capital.'},
{heading:'Error #3: Ignorar Contexto del Mercado',text:'SPY en tendencia fuerte = Tesla sigue 70%. Dias CPI, NFP, FOMC = NO operes durante evento. Espera 15-30 min.'},
{heading:'Error #4: Overtrading',text:'MAXIMO 5-8 trades/dia. > 10 trades = WR cae a 35-42%. Los mejores toman 3-5 trades de ALTA calidad.'}
]},
{id:'m9',title:'Module 9: Plan de Accion Diario',icon:'📋',color:'#f59e0b',subtitle:'Tu checklist antes de tocar Webull',content:[
{heading:'Pre-Market Routine (8:30-9:30 ET)',text:'(1) Revisa noticias Tesla overnight. (2) Mira pre-market. (3) Niveles dia anterior. (4) Calendario economico. (5) SPY futures. (6) Define plan. (7) Revisa diario de ayer. (8) Estado mental.'},
{heading:'Checklist de Entrada',text:'(1) Precio del lado correcto del VWAP? (2) Setup coincide? (3) EMAs alineadas? (4) RSI y MACD confirman? (5) Volumen > promedio? (6) Stop y target claros? (7) R:R min 1:1.5? (8) Sin tilt/FOMO?'},
{heading:'Post-Session Review',text:'(1) Registra CADA trade. (2) Capturas de pantalla. (3) Metricas. (4) Mejor/peor trade. (5) Emociones del dia. (6) APAGA computadora.'}
]},
{id:'m10',title:'Module 10: Tipos de Ordenes en Webull',icon:'📌',color:'#3b82f6',subtitle:'Saber CUANDO usar cada orden',content:[
{heading:'Market Order',text:'Practicamente NUNCA en scalping TSLA 1-min. Slippage de 1-5 centavos. UNICA EXCEPTION: movimiento explosivo que necesita entrada inmediata.'},
{heading:'Limit Order',text:'TU ORDEN PRINCIPAL (90%+ de trades). Se ejecuta SOLO al precio que especificas. Ideal para entradas precisas sin slippage.'},
{heading:'Stop Order (Stop Market)',text:'TU STOP LOSS PRINCIPAL. Se convierte en MARKET al tocar tu nivel. Riesgo: slippage de 2-5 centavos en alta volatilidad.'},
{heading:'Stop Limit Order',text:'MAS SEGURO: Define stop price + limit price. Da espacio de 2-3c debajo del stop para evitar quedar sin proteccion.'},
{heading:'Trailing Stop',text:'EL MEJOR AMIGO DEL SCALPER. Se mueve automaticamente con el precio. Configuracion recomendada TSLA 1-min: $0.25-$0.40.'}
]},
{id:'m11',title:'Module 11: Patrones de Velas Japonesas',icon:'🕯️',color:'#f97316',subtitle:'Los patrones que confirman tus entradas',content:[
{heading:'Hammer (Martillo) - Senal Alcista',text:'Cuerpo pequeno arriba, mecha larga abajo. En el VWAP = confirmacion de bounce. Solo valido despues de tendencia bajista. Necesita confirmacion de siguiente vela.'},
{heading:'Shooting Star - Senal Bajista',text:'Cuerpo pequeno abajo, mecha larga arriba. En resistencia = confirmacion de reversal. MUY UTIL en high del dia + RSI > 75.'},
{heading:'Doji - Indecision',text:'Cuerpo inexistente. En nivel critico = alerta de cambio. NO es senal de entrada por si sola. Espera siguiente vela para confirmar.'},
{heading:'Engulfing - La Senal Mas Fuerte',text:'Vela grande que absorbe la anterior. Con volumen 2x = MUY fuerte. 65-72% de probabilidad de seguir la direccion en TSLA.'},
{heading:'Pin Bar - Rechazo de Precio',text:'Mecha 3x+ el cuerpo. Rechazo brutal en nivel critico. Pin bar + VWAP + RSI sobreventa = una de las mejores senales de entrada.'}
]},
{id:'m12',title:'Module 12: Earnings Day Playbook',icon:'🚨',color:'#ef4444',subtitle:'Estrategia para los dias mas volatiles',content:[
{heading:'Que Son los Earnings',text:'Tesla reporta 4 veces al ano: Enero, Abril, Julio, Octubre. Post-earnings mueve 8-12% en 24 horas. Las MEJORES oportunidades Y las mas peligrosas.'},
{heading:'Pre-Earnings: La Compra de Volatilidad',text:'3-5 dias antes, IV sube dramaticamente. Bollinger Bands se comprimen. NO operes direccionales pre-earnings. Usa tamano de posicion de mitad.'},
{heading:'Post-Earnings: Los Primeros 30 Minutos',text:'NO entres en los primeros 5 minutos. Espera 10-15 min para rango inicial. Gap direction tiene 60-65% probabilidad de mantenerse. Stop 1.5x mas amplio.'},
{heading:'Errores Fatales en Earnings Day',text:'NO uses apalancamiento. NO operes contra el gap dia 1. NO overnight. NO entres al primer minuto. SI tienes plan escrito ANTES. SI toma ganancias agresivamente.'}
]},
{id:'m13',title:'Module 13: Level 2 & Order Flow',icon:'📟',color:'#06b6d4',subtitle:'Lo que ven los profesionales',content:[
{heading:'Que es el Level 2',text:'Muestra TODAS las ordenes abiertas de compra y venta. Para TSLA 1-min es la diferencia entre entrar en el movimiento correcto o ser liquidez de alguien mas.'},
{heading:'Spread de Tesla',text:'Spread normal: 1-2 centavos. Spread > 5c = ALERTA. Spread > 10c = NO OPERES. El spread es tu costo oculto: $50/dia solo en spread con 500 shares.'},
{heading:'Ordenes Institucionales',text:'WALL: 10,000+ acciones en un nivel = soporte/resistencia. ICEBERG: orden grande dividida en partes. SPOOFING: ordenes falsas - NO reacciones.'},
{heading:'Time & Sales',text:'CADA transaccion ejecutada. Prints alto volumen + verde = senal alcista. Velocidad de prints indica momentum. Trade at ask = compradores agresivos.'}
]},
{id:'m14',title:'Module 14: Configuracion de Webull',icon:'💻',color:'#8b5cf6',subtitle:'Tu estacion de batalla',content:[
{heading:'Layout Optimo',text:'Panel izquierdo (70%): Grafico 1-min con todos los indicadores. Derecho superior: Level 2. Derecho medio: Time & Sales. Derecho inferior: Ordenes + posiciones.'},
{heading:'Hotkeys',text:'B = Buy, S = Sell, Escape = Cancelar todo, Flatten = Cerrar posicion. Hotkeys = 0.5-2 segundos mas rapido que mouse = $0.10-$0.30 de diferencia en precio.'},
{heading:'Alertas Automatizadas',text:'Configura: (1) Precio al VWAP. (2) Niveles del dia anterior. (3) Niveles psicologicos. (4) Volumen spike > 2x promedio. (5) RSI extremo. Maximo 5-7 alertas/dia.'},
{heading:'Checklist Pre-Market',text:'8:30 Abre Webull. 8:40 Marca niveles. 8:55 Configura alertas. 9:10 Escribe plan. 9:25 Panel de ordenes listo. 9:30 SIN TOCAR en primeros 5 min.'}
]},
{id:'m15',title:'Module 15: Short Selling en Tesla',icon:'📉',color:'#10b981',subtitle:'El lado oscuro del trading',content:[
{heading:'Por Que Shortear Tesla',text:'Tesla cae con la misma violencia con la que sube. Movimientos bajistas son MAS RAPIDOS. Tesla ha tenido multiples dias de -5% a -12%. Ignorar cortos = ignorar 50% de oportunidades.'},
{heading:'Reglas para Shortear',text:'Solo corta con sesgo bajista confirmado. Stops MAS AJUSTADOS ($0.40-$0.50 max). NO cortes en pre-market. Corta en PULLBACKS. Target = VWAP o low del dia.'},
{heading:'Shares y Hard-to-Borrow',text:'Tesla normalmente es ETB (Easy-to-Borrow). Puede volverse HTB cerca de earnings. NUNCA pagues mas de 10% borrow rate. Espera 2-3 dias si es HTB.'},
{heading:'Setups de Short',text:'#1 VWAP Rejection Short (58-64%). #2 EMA Death Cross + VWAP (55-60%). #3 Resistance Rejection Short (52-58%). MEJOR momento: 9:45-10:30 AM + VWAP debil.'},
{heading:'Peligros del Shorting',text:'Gamma Squeeze: puede mover $10-$30/dia. Elon Tweets: +5-10% gap up. Short Interest alto = squeezes probables. REGLA FINAL: Solo corta en INTRADIA. NUNCA overnight.'}
]}
]

/* ─── EXAM (25 questions) ─── */
const EXAM=[
{q:'Tesla abre en gap up +1.5%. A las 9:45 toca VWAP. Que haces?',opts:['Entro largo inmediato','Espero segundo touch con confirmacion volumen','Entro corto (gap se llenara)','Espero a las 12 PM'],c:1,e:'Nunca entres al primer touch del VWAP.'},
{q:'Primer trade perdida. Segundo tambien. Que haces?',opts:['Aumento posicion','30 min descanso','Tercer trade inmediato','Cambio a 5 min'],c:1,e:'2 perdidas = 30 min. Aumentar posicion destruye cuentas.'},
{q:'BB en squeeze 25+ velas. ADX 18. Que indica?',opts:['Dia aburrido','Volatilidad inminente','Precio caera','Mean reversion'],c:1,e:'Squeeze + ADX bajo = explosion. $1.50-$3.00 post-squeeze.'},
{q:'Son las 12:30 PM. TSLA en rango $0.80 desde 11 AM. Breakout?',opts:['Entro inmediato','NO entro - lunch lull','Espero 2 PM','Entro reversa'],c:1,e:'12-14 ET = lunch lull. Breakouts 50% fake vs 70% post 2 PM.'},
{q:'INDICADOR MAS IMPORTANTE para TSLA 1-min?',opts:['RSI','MACD','VWAP','Bollinger Bands'],c:2,e:'VWAP es #1. Tesla lo respeta como S/R en 68% de sesiones.'},
{q:'Capital $25K. Stop $0.40. Riesgo 1%. Max shares?',opts:['625','500','6250','250'],c:0,e:'($25K x 0.01) / $0.40 = $250 / $0.40 = 625 shares.'},
{q:'EMA 9 cruza EMA 21, PERO precio debajo VWAP?',opts:['Entro largo','NO entres - conflicto','Espero EMA 45','Entro corto'],c:1,e:'FILTRO: Solo toma senal si precio del lado correcto del VWAP.'},
{q:'En largo desde $245.50. Precio $246.80. Trailing stop $0.30?',opts:['$245.50','$246.50','$246.80','No uso'],c:1,e:'$246.80 - $0.30 = $246.50. Protege $1.00 ganancia.'},
{q:'Viernes OpEx. TSLA rango $3 alrededor strike $250?',opts:['Rompe al alza','Gravita a max pain ($250)','Rango continua','No afecta'],c:1,e:'OpEx: TSLA gravita a max pain.'},
{q:'Vela cuerpo arriba, mecha larga abajo en VWAP?',opts:['Shooting star','Hammer','Doji','Engulfing'],c:1,e:'Hammer en VWAP = bounce alcista.'},
{q:'Earnings day. Gap +6%. Que haces a 9:30?',opts:['Entro largo','Espero 10-15 min','Entro corto','No opero'],c:1,e:'Post-earnings: NUNCA primeros 5 min.'},
{q:'SPY -1.5%. Tus indicadores TSLA muestran compra?',opts:['Sigo indicadores','NO entres - TSLA sigue SPY 70%','Espero SPY recupere','Tamano chico'],c:1,e:'Contexto siempre vence indicadores.'},
{q:'7 trades, WR 57%, -4.2% de 5% max?',opts:['2 trades mas','1 trade mas','DIA TERMINADO','Espero Power Hour'],c:2,e:'Solo 0.8% restante. Un trade mas y pasas limite.'},
{q:'Vela verde cubre vela roja anterior en VWAP + volumen 2x?',opts:['Hammer','Doji','Bullish Engulfing','Pin Bar'],c:2,e:'Engulfing + volumen 2x en VWAP = 65-72% alcista.'},
{q:'Win rate esperado VWAP Bounce?',opts:['45-50%','52-55%','62-68%','75-80%'],c:2,e:'VWAP Bounce: 62-68%. Tu bread and butter.'},
{q:'Comprar TSLA a $248.50. Precio $248.62. Que orden?',opts:['Market','Limit $248.50','Stop market','Stop limit'],c:1,e:'Limit: tu precio sin slippage. 90%+ entradas.'},
{q:'3:15 PM. TSLA arriba VWAP. Breakout rango mediodia?',opts:['30%','50%','70%','90%'],c:2,e:'Breakouts post-3 PM son 70% genuinos.'},
{q:'Stop loss promedio TSLA 1-min?',opts:['$0.10-0.20','$0.30-0.60','$1-2','$2.50-5'],c:1,e:'$0.30-0.60. Mas = timeframe incorrecto.'},
{q:'Doji en high del dia con RSI 78?',opts:['Compra fuerte','Indecision - NO es senal sola','Vendo todo','Otro Doji'],c:1,e:'Doji = indecision. Espera confirmacion.'},
{q:'Max trades por dia?',opts:['Ilimitados','5-8','15-20','Max 3'],c:1,e:'> 10 y WR cae a 35-42%.'},
{q:'50K acciones en bid desaparece cuando precio se acerca?',opts:['Soporte real','Spoofing','Iceberg','Ejecutada'],c:1,e:'Spoofing: orden falsa. Confia en ordenes que se MANTIENEN.'},
{q:'Spread TSLA 8 centavos?',opts:['Normal','ALERTA - espero','Oportunidad','Limit 2c'],c:1,e:'> 5c = ALERTA. Slippage $0.05-0.10.'},
{q:'HTB borrow rate 18%?',opts:['Shorteo igual','No shorteo - costo no rentable','Espero 5%','B y C'],c:3,e:'Nunca > 10% borrow. Espera 2-3 dias.'},
{q:'SSR activo. Quieres shortear?',opts:['Market short','No o tamano chico con limit','Espero 3 PM','Tamano completo'],c:1,e:'SSR = spreads anchos. Limit orders, 0.5% riesgo.'},
{q:'MEJOR momento para shortear TSLA 1-min?',opts:['Pre-market','9:45-10:30 + bajo VWAP','12-2 PM','Cualquier momento'],c:1,e:'9:45-10:30 + VWAP debil + SPY cayendo = mejor ventana.'}
]

/* ─── CALENDAR EVENTS 2025 ─── */
const CALENDAR_EVENTS=[
...[['2025-01-10','NFP','Empleo No Agricola','high'],['2025-01-15','CPI','Indice de Precios al Consumidor','high'],['2025-01-17','OpEx','Vencimiento de Opciones','medium'],['2025-01-29','Earnings','Tesla Earnings Q4 2024','high'],['2025-01-29','FOMC','Reunion FOMC','high'],['2025-02-07','NFP','Empleo No Agricola','high'],['2025-02-13','CPI','Indice de Precios al Consumidor','high'],['2025-02-14','OpEx','Vencimiento de Opciones','medium'],['2025-03-07','NFP','Empleo No Agricola','high'],['2025-03-12','CPI','Indice de Precios al Consumidor','high'],['2025-03-19','FOMC','Reunion FOMC','high'],['2025-03-21','OpEx','Vencimiento de Opciones','medium'],['2025-04-04','NFP','Empleo No Agricola','high'],['2025-04-10','CPI','Indice de Precios al Consumidor','high'],['2025-04-18','OpEx','Vencimiento de Opciones','medium'],['2025-04-23','Earnings','Tesla Earnings Q1 2025','high'],['2025-05-02','NFP','Empleo No Agricola','high'],['2025-05-07','FOMC','Reunion FOMC','high'],['2025-05-13','CPI','Indice de Precios al Consumidor','high'],['2025-05-16','OpEx','Vencimiento de Opciones','medium'],['2025-06-06','NFP','Empleo No Agricola','high'],['2025-06-11','CPI','Indice de Precios al Consumidor','high'],['2025-06-18','FOMC','Reunion FOMC','high'],['2025-06-20','OpEx','Vencimiento de Opciones','medium'],['2025-07-03','NFP','Empleo No Agricola','high'],['2025-07-11','CPI','Indice de Precios al Consumidor','high'],['2025-07-18','OpEx','Vencimiento de Opciones','medium'],['2025-07-23','Earnings','Tesla Earnings Q2 2025','high'],['2025-07-30','FOMC','Reunion FOMC','high'],['2025-08-01','NFP','Empleo No Agricola','high'],['2025-08-13','CPI','Indice de Precios al Consumidor','high'],['2025-08-15','OpEx','Vencimiento de Opciones','medium'],['2025-09-05','NFP','Empleo No Agricola','high'],['2025-09-10','CPI','Indice de Precios al Consumidor','high'],['2025-09-17','FOMC','Reunion FOMC','high'],['2025-09-19','OpEx','Vencimiento de Opciones','medium'],['2025-10-03','NFP','Empleo No Agricola','high'],['2025-10-15','CPI','Indice de Precios al Consumidor','high'],['2025-10-17','OpEx','Vencimiento de Opciones','medium'],['2025-10-22','Earnings','Tesla Earnings Q3 2025','high'],['2025-11-07','NFP','Empleo No Agricola','high'],['2025-11-05','FOMC','Reunion FOMC','high'],['2025-11-13','CPI','Indice de Precios al Consumidor','high'],['2025-11-21','OpEx','Vencimiento de Opciones','medium'],['2025-12-05','NFP','Empleo No Agricola','high'],['2025-12-11','CPI','Indice de Precios al Consumidor','high'],['2025-12-17','FOMC','Reunion FOMC','high'],['2025-12-19','OpEx','Vencimiento de Opciones','medium']].map(([date,type,title,impact])=>({date,type,title,impact}))]

/* ─── PLAYBOOK STRATEGIES ─── */
const STRATEGIES=[
{name:'VWAP Bounce',wr:'62-68%',difficulty:'Intermedio',color:'#00c853',
 entry:['Espera post-apertura (9:45-10:00 minimo)','Identifica sesgo: arriba VWAP = largos, abajo = cortos','Espera pullback al VWAP','Verifica: RSI no extremo, MACD alineado, volumen > promedio'],
 exit:['Target: banda VWAP 1 desviacion','Stop: 10-15 centavos del VWAP','R:R 1:1.5 a 1:2'],
 indicators:['VWAP','RSI(9)','MACD(6,12,6)','Volumen'],
 bestTimes:'9:45-11:30 AM, 2:00-3:30 PM ET',
 mistakes:['Entrar al primer touch sin confirmacion','Operar contra VWAP en primer hora','Stop muy alejado del VWAP']},
{name:'Bollinger Squeeze',wr:'55-60%',difficulty:'Avanzado',color:'#f59e0b',
 entry:['Identifica squeeze (bandas estrechas 20+ velas)','Espera breakout con volumen > 1.5x promedio','Confirma direccion con RSI y MACD','Entra en cierre de vela de breakout'],
 exit:['Target: distancia del squeeze completo','Stop: banda opuesta del BB','R:R 1:2 a 1:3'],
 indicators:['Bollinger Bands(20,2)','VWAP','RSI(9)','Volumen'],
 bestTimes:'Cualquier momento durante squeeze, especialmente 10-11 AM',
 mistakes:['Entrar antes del breakout confirmado','Ignorar volumen de confirmacion','Stop demasiado ajustado en squeeze grande']},
{name:'EMA Ribbon Cross',wr:'58-64%',difficulty:'Intermedio',color:'#00d4ff',
 entry:['EMA 9 cruza EMA 21 (arriba = largo, abajo = corto)','FILTRO CRITICO: precio del lado correcto del VWAP','Espera pullback a EMA 9 o 21','Confirma con MACD y volumen'],
 exit:['Target: proximo S/R intradia','Stop: debajo/encima EMA 45','Trailing stop despues de 1:1 R:R'],
 indicators:['EMA 9','EMA 21','EMA 45','VWAP','MACD(6,12,6)'],
 bestTimes:'9:45-11:30 AM, 2:00-3:30 PM ET',
 mistakes:['Ignorar VWAP (error mas comun)','Entrar en cruzamiento sin confirmacion','Operar en lunch lull']},
{name:'Gap Fill Scalp',wr:'55-62%',difficulty:'Principiante',color:'#a855f7',
 entry:['Gaps < 1% se llenan 65% del tiempo','Espera 15-30 min tras apertura para direccion','Identifica nivel del gap anterior','Entra en pullback con volumen creciente'],
 exit:['Target: 50-100% del gap','Stop: debajo/encima del low/high de apertura','A las 10:30 si no empezo, ABANDONA'],
 indicators:['VWAP','Niveles dia anterior','Volumen','EMA 9'],
 bestTimes:'9:30-10:30 AM ET unicamente',
 mistakes:['Operar gaps > 2% (menos probables)','Quedarse demasiado tiempo','Ignorar sesgo del mercado general']},
{name:'Reversal S/R Intradia',wr:'52-58%',difficulty:'Avanzado',color:'#ef4444',
 entry:['Marca high/low del dia a las 10:30 ET','Espera segundo touch del nivel','Confirma con vela de rechazo (pin bar, shooting star)','RSI > 75 en resistencia o < 25 en soporte'],
 exit:['Target: VWAP del dia','Stop: mas alla del swing high/low','R:R minimo 1:1.5'],
 indicators:['S/R intradia','RSI(9)','VWAP','Patrones de vela','Volumen'],
 bestTimes:'10:30-11:30 AM, 2:00-3:00 PM ET',
 mistakes:['Operar primer touch sin confirmacion','No esperar segundo touch','Ignorar VWAP en la ecuacion']}
]

export default function Home(){
  const [page,setPage]=useState('auth')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [user,setUser]=useState<User|null>(null)
  const [allTrades,setAllTrades]=useState<Trade[]>([])
  const [mounted,setMounted]=useState(false)
  const [toast,setToast]=useState<string|null>(null)
  const [authMode,setAuthMode]=useState<'login'|'register'>('login')
  const [authEmail,setAuthEmail]=useState('')
  const [authPassword,setAuthPassword]=useState('')
  const [authName,setAuthName]=useState('')
  const [authError,setAuthError]=useState('')
  const [tradeOpen,setTradeOpen]=useState(false)
  const [editTrade,setEditTrade]=useState<Trade|null>(null)
  const [tf,setTf]=useState({date:new Date().toISOString().slice(0,16),symbol:'',direction:'LONG' as const,entryPrice:'',exitPrice:'',stopLoss:'',takeProfit:'',shares:'100',commission:'',brokerFees:'',profitSplit:'100',isFunded:false,setup:'',notes:'',emotion:5,tags:'',screenshot:''})
  const [fSymbol,setFSymbol]=useState('');const [fDir,setFDir]=useState('');const [fSetup,setFSetup]=useState('');const [fFrom,setFFrom]=useState('');const [fTo,setFTo]=useState('')
  const [period,setPeriod]=useState('30')
  const [profName,setProfName]=useState('');const [profAvatar,setProfAvatar]=useState('#e31937');const [profBroker,setProfBroker]=useState('')
  const [completed,setCompleted]=useState<string[]>([]);const [examStarted,setExamStarted]=useState(false);const [examDone,setExamDone]=useState(false)
  const [examAns,setExamAns]=useState<Record<number,number>>({});const [showExpl,setShowExpl]=useState<Record<number,boolean>>({})
  const [initCapital,setInitCapital]=useState(0);const [txs,setTxs]=useState<{id:number,date:string,type:'deposit'|'withdrawal',amount:number,note:string}[]>([])
  const [calcCap,setCalcCap]=useState('25000');const [calcRisk,setCalcRisk]=useState('1');const [calcStop,setCalcStop]=useState('0.50');const [calcEntry,setCalcEntry]=useState('250');const [calcDir,setCalcDir]=useState<'LONG'|'SHORT'>('LONG')
  const [checkItems,setCheckItems]=useState<Record<string,boolean>>({});const [checkHistory,setCheckHistory]=useState<{date:string,done:number,total:number}[]>([])
  const [psychEntries,setPsychEntries]=useState<{id:number,date:string,pre:number,post:number,conf:number,disc:number,quality:string,notes:string}[]>([])
  const [psychPre,setPsychPre]=useState(5);const [psychPost,setPsychPost]=useState(5);const [psychConf,setPsychConf]=useState(5);const [psychDisc,setPsychDisc]=useState(5);const [psychQuality,setPsychQuality]=useState('Normal');const [psychNotes,setPsychNotes]=useState('')
  const [timerRun,setTimerRun]=useState(false);const [timerSec,setTimerSec]=useState(0);const [pomMin,setPomMin]=useState(25);const [pomRun,setPomRun]=useState(false);const [pomSec,setPomSec]=useState(25*60);const [sesCount,setSesCount]=useState(0)
  const [goals,setGoals]=useState<{id:number,type:string,target:string,current:string,unit:string,period:string,createdAt:string}[]>([])
  const [simBal,setSimBal]=useState(25000);const [simTrades,setSimTrades]=useState<{id:number,date:string,dir:string,entry:number,exit:number,shares:number,pnl:number}[]>([])
  const [simPrice,setSimPrice]=useState('');const [simShares,setSimShares]=useState('100');const [simDir,setSimDir]=useState<'BUY'|'SELL'>('BUY')
  const [calFilter,setCalFilter]=useState('all');const [calImpact,setCalImpact]=useState('all')
  const [heatView,setHeatView]=useState<'pnl'|'count'>('pnl')
  const [playStatus,setPlayStatus]=useState<Record<string,string>>({})
  const [imgModal,setImgModal]=useState<string|null>(null)
  const [revDate,setRevDate]=useState(new Date().toISOString().slice(0,10));const [revScore,setRevScore]=useState(5);const [revPlan,setRevPlan]=useState(false);const [revBest,setRevBest]=useState('');const [revWorst,setRevWorst]=useState('');const [revLesson,setRevLesson]=useState('');const [revEmotion,setRevEmotion]=useState(5);const [revRules,setRevRules]=useState<Record<string,boolean>>({});const [revNotes,setRevNotes]=useState('')
  const [reviews,setReviews]=useState<{id:number,date:string,score:number,best:string,worst:string,lesson:string,emotion:number,rules:Record<string,boolean>,notes:string,plan:boolean}[]>([])

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),3000)}

  // Timer effects
  useEffect(()=>{let iv:NodeJS.Timeout;if(timerRun)iv=setInterval(()=>setTimerSec(s=>s+1),1000);return()=>clearInterval(iv)},[timerRun])
  useEffect(()=>{let iv:NodeJS.Timeout;if(pomRun&&pomSec>0)iv=setInterval(()=>setPomSec(s=>{if(s<=1){setPomRun(false);setSesCount(c=>c+1);showToast('Pomodoro completado!');return 25*60}return s-1}),1000);return()=>clearInterval(iv)},[pomRun,pomSec])

  // Persistence effects
  useEffect(()=>{if(user&&mounted)setStore(`tv_mod_${user.id}`,completed)},[completed,user,mounted])
  useEffect(()=>{if(user&&mounted&&Object.keys(examAns).length>0)setStore(`tv_exam_${user.id}`,examAns)},[examAns,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_cap_${user.id}`,initCapital)},[initCapital,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_tx_${user.id}`,txs)},[txs,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_chk_${user.id}`,checkItems)},[checkItems,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_chkh_${user.id}`,checkHistory)},[checkHistory,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_psy_${user.id}`,psychEntries)},[psychEntries,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_goals_${user.id}`,goals)},[goals,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_sim_b_${user.id}`,simBal)},[simBal,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_sim_t_${user.id}`,simTrades)},[simTrades,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_play_${user.id}`,playStatus)},[playStatus,user,mounted])
  useEffect(()=>{if(user&&mounted)setStore(`tv_rev_${user.id}`,reviews)},[reviews,user,mounted])

  // Mount
  useEffect(()=>{
    // Check for #register hash to default to register tab
    if(typeof window!=='undefined'&&window.location.hash==='#register'){setAuthMode('register');window.history.replaceState(null,'',window.location.pathname)}
    const u=getStore<User|null>('tv_user',null)
    if(u){
      setUser(u);setPage('dashboard')
      setProfName(u.name);setProfAvatar(u.avatar||'#e31937');setProfBroker(u.broker||'')
      setCompleted(getStore<string[]>(`tv_mod_${u.id}`,[]))
      const ea=getStore<Record<number,number>>(`tv_exam_${u.id}`,{})
      if(Object.keys(ea).length===EXAM.length){setExamAns(ea);setExamStarted(true);setExamDone(true)}
      else if(Object.keys(ea).length>0){setExamAns(ea);setExamStarted(true)}
      setInitCapital(getStore<number>(`tv_cap_${u.id}`,0));setTxs(getStore(`tv_tx_${u.id}`,[]))
      setCheckItems(getStore(`tv_chk_${u.id}`,{}));setCheckHistory(getStore(`tv_chkh_${u.id}`,[]))
      setPsychEntries(getStore(`tv_psy_${u.id}`,[]));setGoals(getStore(`tv_goals_${u.id}`,[]))
      setSimBal(getStore(`tv_sim_b_${u.id}`,25000));setSimTrades(getStore(`tv_sim_t_${u.id}`,[]))
      setPlayStatus(getStore(`tv_play_${u.id}`,{}));setReviews(getStore(`tv_rev_${u.id}`,[]))
      // Load trades from API, fallback to localStorage
      const token=getStore<string>('tv_token','')
      if(token){
        // Validate token first
        fetch('/api/auth/me',{headers:{'Authorization':`Bearer ${token}`}}).then(r=>{
          if(!r.ok){
            // Token invalid, force logout
            setUser(null);setPage('auth');setAllTrades([]);localStorage.removeItem('tv_token');localStorage.removeItem('tv_user');return
          }
          return fetch('/api/trades',{headers:{'Authorization':`Bearer ${token}`}})
        }).then(r2=>{
          if(r2)r2.json().then(d=>{if(d.trades){setAllTrades(d.trades);setStore(`tv_trades_${u.id}`,d.trades)}})
        }).catch(()=>{setAllTrades(getStore<Trade[]>(`tv_trades_${u.id}`,[]))})
      }else{setAllTrades(getStore<Trade[]>(`tv_trades_${u.id}`,[]))}
    }
    setMounted(true)
  },[])

  const trades=useMemo(()=>{
    let f=[...allTrades]
    if(fSymbol)f=f.filter(t=>t.symbol===fSymbol);if(fDir)f=f.filter(t=>t.direction===fDir);if(fSetup)f=f.filter(t=>t.setup===fSetup)
    if(fFrom)f=f.filter(t=>t.date>=fFrom);if(fTo)f=f.filter(t=>t.date<=fTo+'T23:59:59')
    return f.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
  },[allTrades,fSymbol,fDir,fSetup,fFrom,fTo])

  const stats=useMemo(()=>calcStats(allTrades,period),[allTrades,period])

  const openTrade=(t?:Trade)=>{
    if(t){setEditTrade(t);setTf({date:t.date.slice(0,16),symbol:t.symbol,direction:t.direction as 'LONG',entryPrice:String(t.entryPrice),exitPrice:String(t.exitPrice),stopLoss:t.stopLoss?String(t.stopLoss):'',takeProfit:t.takeProfit?String(t.takeProfit):'',shares:String(t.shares),commission:t.commission?String(t.commission):'',brokerFees:t.brokerFees?String(t.brokerFees):'',profitSplit:t.profitSplit?String(t.profitSplit):'100',isFunded:(t.profitSplit||100)<100||!!t.brokerFees,setup:t.setup||'VWAP Bounce',notes:t.notes||'',emotion:t.emotion||5,tags:t.tags||'',screenshot:t.screenshot||''})}
    else{setEditTrade(null);setTf({date:new Date().toISOString().slice(0,16),symbol:'',direction:'LONG',entryPrice:'',exitPrice:'',stopLoss:'',takeProfit:'',shares:'100',commission:'',brokerFees:'',profitSplit:'100',isFunded:false,setup:'',notes:'',emotion:5,tags:'',screenshot:''})}
    setTradeOpen(true)
  }

  const saveTrade=async()=>{
    if(!tf.date||!tf.entryPrice||!tf.exitPrice||!tf.shares){showToast('Completa los campos requeridos');return}
    const ep=parseFloat(tf.entryPrice),xp=parseFloat(tf.exitPrice),sh=parseFloat(tf.shares)
    if(isNaN(ep)||isNaN(xp)||isNaN(sh)){showToast('Valores numericos invalidos');return}
    const comm=tf.commission?parseFloat(tf.commission):0
    const rawPnl=tf.direction==='LONG'?(xp-ep)*sh:(ep-xp)*sh
    const grossPnl=rawPnl-comm
    const bf=tf.brokerFees?parseFloat(tf.brokerFees):0
    const ps=tf.profitSplit?parseFloat(tf.profitSplit):100
    const realPnl=Math.round((grossPnl-bf)*(ps/100)*100)/100
    const token=getStore<string>('tv_token','')
    if(!token){showToast('Token no encontrado, vuelve a iniciar sesion');return}
    const headers={'Content-Type':'application/json','Authorization':`Bearer ${token}`}
    const payload={date:tf.date,symbol:tf.symbol,direction:tf.direction,entryPrice:ep,exitPrice:xp,stopLoss:tf.stopLoss?parseFloat(tf.stopLoss):null,takeProfit:tf.takeProfit?parseFloat(tf.takeProfit):null,shares:sh,commission:comm||null,brokerFees:bf||null,profitSplit:ps,realPnl,setup:tf.setup,notes:tf.notes,emotion:tf.emotion,tags:tf.tags,screenshot:tf.screenshot||null}
    try{
      if(editTrade&&editTrade._dbId){
        const res=await fetch(`/api/trades/${editTrade._dbId}`,{method:'PUT',headers,body:JSON.stringify(payload)})
        if(res.ok){const d=await res.json();const updated=allTrades.map(t=>t._dbId===editTrade._dbId?{...d.trade,...(t.id===editTrade.id?{}:{})}:t);setAllTrades(updated);setStore(`tv_trades_${user!.id}`,updated);showToast('Trade actualizado')}
        else{const err=await res.json().catch(()=>({}));showToast(err.error||'Error al actualizar')}
      }else{
        const res=await fetch('/api/trades',{method:'POST',headers,body:JSON.stringify(payload)})
        if(res.ok){const d=await res.json();const updated=[...allTrades,d.trade];setAllTrades(updated);setStore(`tv_trades_${user!.id}`,updated);showToast('Trade guardado')}
        else{const err=await res.json().catch(()=>({}));showToast(err.error||'Error al guardar')}
      }
    }catch{showToast('Error de conexion')}
    setTradeOpen(false)
  }

  const deleteTrade=async(id:number,dbId?:string)=>{
    if(dbId){
      try{
        const token=getStore<string>('tv_token','')
        const res=await fetch(`/api/trades/${dbId}`,{method:'DELETE',headers:{'Authorization':`Bearer ${token}`}})
        if(!res.ok){showToast('Error al eliminar');return}
      }catch{showToast('Error de conexion');return}
    }
    const updated=allTrades.filter(t=>t.id!==id);setAllTrades(updated);setStore(`tv_trades_${user!.id}`,updated);showToast('Trade eliminado')
  }

  const handleAuth=async()=>{
    setAuthError('')
    if(!authEmail||!authPassword){setAuthError('Email y contrasena requeridos');return}
    try{
      if(authMode==='login'){
        const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:authEmail,password:authPassword})})
        const d=await res.json()
        if(!res.ok){setAuthError(d.error||'Email o contrasena incorrectos');return}
        const u={id:d.id,email:d.email,name:d.name,avatar:d.avatar,broker:d.broker,createdAt:new Date().toISOString()}
        setStore('tv_user',u);setStore('tv_token',d.token);setUser(u as User);setPage('dashboard');showToast('Bienvenido!')
        fetch('/api/trades',{headers:{'Authorization':`Bearer ${d.token}`}}).then(r=>r.json()).then(d=>{if(d.trades){setAllTrades(d.trades);setStore(`tv_trades_${u.id}`,d.trades)}}).catch(()=>{})
      }else{
        if(!authName){setAuthError('Nombre requerido');return}
        const res=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:authEmail,password:authPassword,name:authName})})
        const d=await res.json()
        if(!res.ok){setAuthError(d.error||'Error al registrar');return}
        const u={id:d.id,email:d.email,name:d.name,avatar:d.avatar,broker:d.broker,createdAt:new Date().toISOString()}
        setStore('tv_user',u);setStore('tv_token',d.token);setUser(u as User);setAllTrades([]);setPage('dashboard');showToast('Cuenta creada!')
      }
    }catch{setAuthError('Error de conexion')}
  }

  const navItems=[
    {id:'dashboard',icon:<LayoutDashboard size={20}/>,label:'Dashboard'},
    {id:'journal',icon:<BookOpen size={20}/>,label:'Bitacora'},
    {id:'analytics',icon:<BarChart3 size={20}/>,label:'Analytics'},
    {id:'courses',icon:<GraduationCap size={20}/>,label:'Cursos'},
    {id:'calculator',icon:<Calculator size={20}/>,label:'Calculadora'},
    {id:'checklist',icon:<ClipboardCheck size={20}/>,label:'Checklist'},
    {id:'psychology',icon:<Brain size={20}/>,label:'Psicologia'},
    {id:'timer',icon:<Timer size={20}/>,label:'Temporizador'},
    {id:'goals',icon:<Target size={20}/>,label:'Objetivos'},
    {id:'simulator',icon:<Gamepad2 size={20}/>,label:'Simulador'},
    {id:'calendar',icon:<CalendarDays size={20}/>,label:'Calendario'},
    {id:'heatmap',icon:<Grid3X3 size={20}/>,label:'Heatmap'},
    {id:'playbook',icon:<BookMarked size={20}/>,label:'Playbook'},
    {id:'review',icon:<FileText size={20}/>,label:'Review Diario'},
    {id:'capital',icon:<Wallet size={20}/>,label:'Capital'},
    {id:'profile',icon:<User size={20}/>,label:'Perfil'},
  ]

  const fmtTimer=(s:number)=>{const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}

  // Simulated trade handler
  const handleSimTrade=()=>{
    const price=parseFloat(simPrice);if(!price||!simShares)return
    const shares=parseInt(simShares);const id=simTrades.length>0?Math.max(...simTrades.map(t=>t.id))+1:1
    const pnl=simDir==='BUY'?((Math.random()*4-1)*shares):(-1*(Math.random()*4-1)*shares)
    const newTrade={id,date:new Date().toISOString(),dir:simDir,entry:price,exit:price+(simDir==='BUY'?pnl/shares:-pnl/shares),shares,pnl:Math.round(pnl*100)/100}
    setSimTrades(prev=>[...prev,newTrade]);setSimBal(prev=>Math.round((prev+pnl)*100)/100)
    showToast(`Sim trade: ${fmt$(pnl)}`)
  }

  const resetSim=()=>{setSimBal(25000);setSimTrades([]);showToast('Simulador reseteado')}

  const simWR=simTrades.length?Math.round(simTrades.filter(t=>t.pnl>0).length/simTrades.length*100):0
  const simPnL=simTrades.reduce((a,t)=>a+t.pnl,0)

  // Check items
  const CHECKLIST_ITEMS=['Revisé noticias Tesla overnight','Vi pre-market price action','Marqué niveles del día anterior','Revisé calendario económico','Chequé SPY futures','Definí mi plan del día','Revisé mi diario de ayer','Mi estado mental es el adecuado','VWAP identificado','Niveles S/R marcados','Alertas configuradas','Risk % definido para hoy','Hotkeys verificados','Panel de ordenas listo','Sin tilt/FOMO']

  // Heatmap data
  const heatData=useMemo(()=>{
    const grid=Array(13).fill(null).map(()=>Array(13).fill(null)) // 13 hours (6-18) x 7 days
    const counts=Array(13).fill(null).map(()=>Array(13).fill(0))
    allTrades.forEach(t=>{const h=new Date(t.date).getHours()-6;const d=new Date(t.date).getDay();if(h>=0&&h<13&&d>=1&&d<=6){const p=calcRealPnL(t);grid[d-1][h]=(grid[d-1][h]||0)+p;counts[d-1][h]++}})
    return heatView==='pnl'?grid:counts
  },[allTrades,heatView])

  // Review rules
  const REVIEW_RULES=['No operé por FOMO','Respeté mi stop loss','No hice revenge trading','Máximo 5-8 trades','Seguí mi plan','No operé en lunch lull','Tomé ganancias en target','Registro cada trade']

  // Calendar filtered
  const filteredEvents=useMemo(()=>{
    let evts=[...CALENDAR_EVENTS]
    if(calFilter!=='all')evts=evts.filter(e=>e.type===calFilter)
    if(calImpact!=='all')evts=evts.filter(e=>e.impact===calImpact)
    return evts
  },[calFilter,calImpact])

  if(!user||page==='auth')return(
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111] border-[#222]">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#e31937] flex items-center justify-center font-bold text-2xl mx-auto">T</div>
            <h1 className="text-2xl font-bold">TradeVault Pro</h1>
            <p className="text-zinc-400 text-sm">Plataforma de Trading TSLA</p>
          </div>
          <Tabs value={authMode} onValueChange={(v)=>setAuthMode(v as 'login'|'register')}>
            <TabsList className="w-full bg-[#1a1a1a]"><TabsTrigger value="login" className="flex-1">Iniciar Sesion</TabsTrigger><TabsTrigger value="register" className="flex-1">Registrarse</TabsTrigger></TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div><Label className="text-zinc-300 text-xs">Email</Label><Input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="bg-[#1a1a1a] border-[#333] text-white mt-1" placeholder="tu@email.com"/></div>
              <div><Label className="text-zinc-300 text-xs">Contrasena</Label><Input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="bg-[#1a1a1a] border-[#333] text-white mt-1" onKeyDown={e=>e.key==='Enter'&&handleAuth()}/></div>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-4">
              <div><Label className="text-zinc-300 text-xs">Nombre</Label><Input value={authName} onChange={e=>setAuthName(e.target.value)} className="bg-[#1a1a1a] border-[#333] text-white mt-1"/></div>
              <div><Label className="text-zinc-300 text-xs">Email</Label><Input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="bg-[#1a1a1a] border-[#333] text-white mt-1"/></div>
              <div><Label className="text-zinc-300 text-xs">Contrasena</Label><Input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="bg-[#1a1a1a] border-[#333] text-white mt-1" onKeyDown={e=>e.key==='Enter'&&handleAuth()}/></div>
            </TabsContent>
          </Tabs>
          {authError&&<p className="text-[#e31937] text-sm">{authError}</p>}
          <Button onClick={handleAuth} className="w-full bg-[#e31937] hover:bg-[#c41530] text-white">{authMode==='login'?'Iniciar Sesion':'Crear Cuenta'}</Button>
        </CardContent>
      </Card>
    </div>
  )

  const tradingPnL=allTrades.reduce((a,t)=>a+calcRealPnL(t),0)
  const totalBal=initCapital+txs.filter(t=>t.type==='deposit').reduce((a,t)=>a+t.amount,0)-txs.filter(t=>t.type==='withdrawal').reduce((a,t)=>a+t.amount,0)+tradingPnL
  const roi=initCapital>0?Math.round(((totalBal-initCapital)/initCapital)*10000)/100:0

  return(
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {toast&&<div className="fixed top-4 right-4 z-[100] bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg shadow-xl">{toast}</div>}
      {sidebarOpen&&<div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <aside className={`fixed lg:static z-50 w-64 h-screen bg-[#111] border-r border-[#222] flex flex-col transition-transform ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-[#222]"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-[#e31937] flex items-center justify-center font-bold text-lg">T</div><div><h1 className="font-bold text-sm">TradeVault Pro</h1><p className="text-[10px] text-zinc-500">Trading Platform</p></div></div></div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>{setPage(item.id);setSidebarOpen(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${page===item.id?'bg-[#e31937]/15 text-[#e31937] font-medium':'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'}`}>{item.icon}<span className="text-xs">{item.label}</span></button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#222]">
          <div className="flex items-center gap-2 mb-3 px-2"><Avatar className="h-8 w-8"><AvatarFallback style={{backgroundColor:user.avatar||'#e31937'}} className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{user.name}</p><p className="text-[10px] text-zinc-500 truncate">{user.email}</p></div></div>
          <button onClick={()=>{setUser(null);setPage('auth');setAllTrades([]);if(typeof window!=='undefined')localStorage.removeItem('tv_token')}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-[#e31937] hover:bg-[#1a1a1a]"><LogOut size={16}/>Cerrar Sesion</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[#1a1a1a]"><Menu size={20}/></button>
          <h2 className="font-semibold text-lg">{navItems.find(n=>n.id===page)?.label}</h2>
          <div className="flex-1"/>
          {(page==='dashboard'||page==='journal')&&<Button onClick={()=>openTrade()} size="sm" className="bg-[#e31937] hover:bg-[#c41530] text-white gap-1"><Plus size={16}/>Nuevo Trade</Button>}
        </header>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">

          {/* DASHBOARD */}
          {page==='dashboard'&&(
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold">Bienvenido, {user.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span></h1><p className="text-zinc-400 text-sm mt-1">Resumen de tu trading</p></div>
              <Card className="bg-gradient-to-r from-[#e31937]/20 to-[#e31937]/5 border-[#e31937]/30"><CardContent className="p-5 flex items-center justify-between flex-wrap gap-4"><div><p className="text-xs text-zinc-400 uppercase tracking-wide">Balance Actual</p><p className="text-2xl font-bold mt-1" style={{color:totalBal>=0?'#00c853':'#e31937'}}>{fmt$(totalBal)}</p></div><div className="flex gap-6"><div><p className="text-[10px] text-zinc-500 uppercase">Capital Inicial</p><p className="text-lg font-semibold">{initCapital>0?fmt$(initCapital):'$0.00'}</p></div><div><p className="text-[10px] text-zinc-500 uppercase">P&L Trading</p><p className="text-lg font-semibold" style={{color:stats.totalPnL>=0?'#00c853':'#e31937'}}>{fmt$(stats.totalPnL)}</p></div><div><p className="text-[10px] text-zinc-500 uppercase">ROI</p><p className="text-lg font-semibold" style={{color:roi>=0?'#00c853':'#e31937'}}>{roi}%</p></div></div></CardContent></Card>
              {stats.totalTrades>0&&(
                <><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[{l:'P&L Total',v:fmt$(stats.totalPnL),c:stats.totalPnL>=0?'text-[#00c853]':'text-[#e31937]'},{l:'Win Rate',v:`${stats.winRate}%`,c:'text-[#00d4ff]'},{l:'Total Trades',v:String(stats.totalTrades),c:'text-white'},{l:'Profit Factor',v:stats.profitFactor===Infinity?'∞':String(stats.profitFactor),c:'text-[#f59e0b]'},{l:'Racha',v:`${stats.currentStreak}${stats.streakType==='win'?'W':'L'}`,c:stats.streakType==='win'?'text-[#00c853]':'text-[#e31937]'},{l:'Max DD',v:fmt$(stats.maxDrawdown),c:'text-[#e31937]'}].map((s,i)=>(
                    <Card key={i} className="bg-[#111] border-[#222]"><CardContent className="p-3"><p className="text-[10px] text-zinc-500 uppercase">{s.l}</p><p className={`text-lg font-bold ${s.c}`}>{s.v}</p></CardContent></Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Curva de Equity</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><AreaChart data={stats.equityCurve}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="date" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8}}/><Area type="monotone" dataKey="equity" stroke="#00c853" fill="#00c853" fillOpacity={0.1}/></AreaChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">P&L por Dia</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><BarChart data={stats.pnlByDay}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="date" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8}}/><Bar dataKey="pnl" fill="#00c853" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
                </div>
                <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Trades Recientes</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-zinc-500 text-xs border-b border-[#222]"><th className="text-left py-2 px-2">Fecha</th><th className="text-left py-2 px-2">Simbolo</th><th className="text-left py-2 px-2">Dir</th><th className="text-right py-2 px-2">Entrada</th><th className="text-right py-2 px-2">Salida</th><th className="text-right py-2 px-2">P&L</th><th className="text-left py-2 px-2">Setup</th></tr></thead><tbody>{trades.slice(0,10).map(t=>(<tr key={t.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] cursor-pointer" onClick={()=>openTrade(t)}><td className="py-2 px-2 text-zinc-300">{fmtDateShort(t.date)}</td><td className="py-2 px-2 text-white font-medium">{t.symbol}</td><td className="py-2 px-2"><Badge className={t.direction==='LONG'?'bg-[#00c853]/20 text-[#00c853] border-[#00c853]/30':'bg-[#e31937]/20 text-[#e31937] border-[#e31937]/30'}>{t.direction}</Badge></td><td className="py-2 px-2 text-right text-zinc-300">${t.entryPrice}</td><td className="py-2 px-2 text-right text-zinc-300">${t.exitPrice}</td><td className={`py-2 px-2 text-right font-bold ${calcRealPnL(t)>=0?'text-[#00c853]':'text-[#e31937]'}`}>{fmt$(calcRealPnL(t))}</td><td className="py-2 px-2 text-zinc-400 text-xs">{t.setup||'-'}</td></tr>))}</tbody></table></div>{trades.length===0&&<p className="text-zinc-500 text-sm text-center py-4">No hay trades todavia</p>}</CardContent></Card></>
              )||<Card className="bg-[#111] border-[#222]"><CardContent className="p-8 text-center"><p className="text-zinc-400">No hay datos todavia. Agrega tu primer trade.</p></CardContent></Card>}
            </div>
          )}

          {/* JOURNAL */}
          {page==='journal'&&(
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Input list="filter-symbols" value={fSymbol} onChange={e=>setFSymbol(e.target.value)} className="w-28 bg-[#1a1a1a] border-[#333] text-xs h-8" placeholder="Symbol"/><datalist id="filter-symbols">{DEFAULT_SYMBOLS.map(s=><option key={s} value={s}/>)}</datalist>
                <Select value={fDir} onValueChange={v=>setFDir(v)}><SelectTrigger className="w-28 bg-[#1a1a1a] border-[#333] text-xs h-8"><SelectValue placeholder="Dir"/></SelectTrigger><SelectContent><SelectItem value="LONG">LONG</SelectItem><SelectItem value="SHORT">SHORT</SelectItem></SelectContent></Select>
                <Input list="filter-setups" value={fSetup} onChange={e=>setFSetup(e.target.value)} className="w-36 bg-[#1a1a1a] border-[#333] text-xs h-8" placeholder="Setup"/><datalist id="filter-setups">{DEFAULT_SETUPS.map(s=><option key={s} value={s}/>)}</datalist>
                <Input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} className="w-36 bg-[#1a1a1a] border-[#333] text-xs h-8"/>
                <Input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} className="w-36 bg-[#1a1a1a] border-[#333] text-xs h-8"/>
                <Button size="sm" variant="outline" className="border-[#333] text-xs h-8" onClick={()=>{setFSymbol('');setFDir('');setFSetup('');setFFrom('');setFTo('')}}>Limpiar</Button>
              </div>
              <div className="space-y-3">
                {trades.map(t=>(<Card key={t.id} className="bg-[#111] border-[#222]"><CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><Badge className={t.direction==='LONG'?'bg-[#00c853]/20 text-[#00c853]':'bg-[#e31937]/20 text-[#e31937]'}>{t.direction}</Badge><span className="font-semibold">{t.symbol}</span><span className="text-xs text-zinc-500">{t.setup}</span></div>
                    <div className="flex items-center gap-2"><span className={`font-bold text-lg ${calcRealPnL(t)>=0?'text-[#00c853]':'text-[#e31937]'}`}>{fmt$(calcRealPnL(t))}</span><button onClick={()=>openTrade(t)} className="p-1 hover:bg-[#1a1a1a] rounded"><Pencil size={14}/></button><button onClick={()=>deleteTrade(t.id,t._dbId)} className="p-1 hover:bg-[#1a1a1a] rounded text-[#e31937]"><Trash2 size={14}/></button></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3 text-xs text-zinc-400">
                    <div>Entry: <span className="text-white">${t.entryPrice}</span></div>
                    <div>Exit: <span className="text-white">${t.exitPrice}</span></div>
                    <div>Shares: <span className="text-white">{t.shares}</span></div>
                    <div>Fecha: <span className="text-white">{fmtDateShort(t.date)}</span></div>
                    {t.stopLoss&&<div>Stop: <span className="text-white">${t.stopLoss}</span></div>}
                    {t.takeProfit&&<div>Target: <span className="text-white">${t.takeProfit}</span></div>}
                    {t.emotion&&<div>Emocion: <span className="text-white">{t.emotion}/10</span></div>}
                    {t.notes&&<div className="col-span-4">Notas: <span className="text-zinc-300">{t.notes}</span></div>}
                    {t.screenshot&&<div className="col-span-4 mt-2"><img src={t.screenshot} alt="screenshot" className="h-24 rounded-lg border border-[#333] cursor-pointer hover:border-[#e31937] transition-colors object-cover" onClick={()=>setImgModal(t.screenshot)}/></div>}
                  </div>
                </CardContent></Card>))}
                {trades.length===0&&<p className="text-zinc-500 text-center py-8">No hay trades</p>}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {page==='analytics'&&(
            <div className="space-y-4">
              <div className="flex gap-2">
                {['7','30','90','all'].map(p=><Button key={p} size="sm" variant={period===p?'default':'outline'} className={period===p?'bg-[#e31937] text-white':'border-[#333] text-zinc-400'} onClick={()=>setPeriod(p)}>{p==='all'?'Todo':`${p}d`}</Button>)}
              </div>
              {stats.totalTrades>0?(
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">P&L por Dia</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={stats.pnlByDay}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="date" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Bar dataKey="pnl" fill="#00c853" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">P&L por Setup</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={stats.pnlBySetup}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="setup" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Bar dataKey="pnl" radius={[4,4,0,0]}>{stats.pnlBySetup.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Curva de Equity</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><AreaChart data={stats.equityCurve}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="date" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Area type="monotone" dataKey="equity" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1}/></AreaChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">P&L por Hora</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={stats.pnlByHour}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="hour" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Bar dataKey="pnl" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">P&L por Dia Semana</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={stats.pnlByDayOfWeek}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="day" tick={{fontSize:10}} stroke="#555"/><YAxis tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Bar dataKey="pnl" fill="#a855f7" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Win Rate por Setup</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={stats.winRateBySetup} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis type="number" domain={[0,100]} tick={{fontSize:10}} stroke="#555"/><YAxis dataKey="setup" type="category" tick={{fontSize:10}} stroke="#555" width={100}/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Bar dataKey="winRate" fill="#00c853" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
                </div>
              ):<p className="text-zinc-500 text-center py-8">Agrega trades para ver analytics</p>}
            </div>
          )}

          {/* COURSES */}
          {page==='courses'&&(
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-2">
                {MODULES.map(m=>(
                  <AccordionItem key={m.id} value={m.id} className="bg-[#111] border-[#222] rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-left py-3"><div className="flex items-center gap-3"><span className="text-xl">{m.icon}</span><div><p className="font-semibold text-sm">{m.title}</p><p className="text-xs text-zinc-500">{m.subtitle}</p></div>{completed.includes(m.id)&&<Badge className="bg-[#00c853]/20 text-[#00c853] ml-auto mr-2">Completado</Badge>}</div></AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-4">
                      {m.content.map((c,i)=>(<div key={i} className="bg-[#1a1a1a] rounded-lg p-4"><h4 className="font-semibold text-sm mb-2" style={{color:m.color}}>{c.heading}</h4><p className="text-sm text-zinc-300 leading-relaxed">{c.text}</p></div>))}
                      <Button size="sm" onClick={()=>{if(!completed.includes(m.id)){const u=[...completed,m.id];setCompleted(u)}}} className={completed.includes(m.id)?'bg-[#00c853] text-white':'bg-[#222] text-zinc-300 hover:bg-[#333]'}>{completed.includes(m.id)?'Completado':'Marcar como Completado'}</Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Card className="bg-[#111] border-[#222] mt-8"><CardHeader><CardTitle className="text-sm">Examen Final - 25 Preguntas</CardTitle></CardHeader><CardContent>
                {!examStarted?<Button onClick={()=>setExamStarted(true)} className="bg-[#e31937] hover:bg-[#c41530] text-white">Comenzar Examen</Button>:
                !examDone?<div className="space-y-4">{EXAM.map((q,i)=>(
                  <div key={i} className="bg-[#1a1a1a] rounded-lg p-4"><p className="text-sm font-medium mb-3">{i+1}. {q.q}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{q.opts.map((o,j)=>(<button key={j} onClick={()=>setExamAns(p=>({...p,[i]:j}))} className={`text-left p-2 rounded-lg text-xs border transition-colors ${examAns[i]===j?'border-[#00c853] bg-[#00c853]/10':'border-[#333] hover:border-[#555]'}`}>{o}</button>))}</div>
                    {showExpl[i]&&<p className="mt-2 text-xs text-zinc-400 bg-[#0a0a0a] p-2 rounded">{q.e}</p>}
                    {examAns[i]!==undefined&&<button onClick={()=>setShowExpl(p=>({...p,[i]:true}))} className="mt-2 text-xs text-[#00d4ff] hover:underline">Ver explicacion</button>}
                  </div>))}<Button onClick={()=>setExamDone(true)} className="bg-[#e31937] hover:bg-[#c41530] text-white mt-4" disabled={Object.keys(examAns).length<25}>Ver Resultados ({Object.keys(examAns).length}/25)</Button></div>:
                <div className="text-center space-y-4"><p className="text-3xl font-bold">{Object.entries(examAns).filter(([i,a])=>EXAM[parseInt(i)].c===a).length}/25</p><p className="text-lg text-[#00c853]">{Math.round(Object.entries(examAns).filter(([i,a])=>EXAM[parseInt(i)].c===a).length/25*100)}% Correctas</p><Button onClick={()=>{setExamStarted(false);setExamDone(false);setExamAns({});setShowExpl({})}}>Repetir</Button></div>}
              </CardContent></Card>
            </div>
          )}

          {/* CALCULATOR */}
          {page==='calculator'&&(()=>{
            const cap=parseFloat(calcCap)||0,risk=parseFloat(calcRisk)||0,stop=parseFloat(calcStop)||0,entry=parseFloat(calcEntry)||0
            const maxShares=stop>0?Math.floor((cap*risk/100)/stop):0,posSize=maxShares*entry,potLoss=maxShares*stop
            const t1=calcDir==='LONG'?entry+stop:entry-stop,t2=calcDir==='LONG'?entry+stop*2:entry-stop*2,t3=calcDir==='LONG'?entry+stop*3:entry-stop*3
            return(<div className="space-y-4"><Card className="bg-[#111] border-[#222]"><CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold">Calculadora de Riesgo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-zinc-400">Capital ($)</Label><Input value={calcCap} onChange={e=>setCalcCap(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div>
                <div><Label className="text-xs text-zinc-400">Riesgo (%)</Label><Input value={calcRisk} onChange={e=>setCalcRisk(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div>
                <div><Label className="text-xs text-zinc-400">Distancia al Stop ($)</Label><Input value={calcStop} onChange={e=>setCalcStop(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div>
                <div><Label className="text-xs text-zinc-400">Precio de Entrada ($)</Label><Input value={calcEntry} onChange={e=>setCalcEntry(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div>
              </div>
              <div><Label className="text-xs text-zinc-400">Direccion</Label><div className="flex gap-2 mt-1"><Button size="sm" variant={calcDir==='LONG'?'default':'outline'} className={calcDir==='LONG'?'bg-[#00c853] text-white':'border-[#333]'} onClick={()=>setCalcDir('LONG')}>LONG</Button><Button size="sm" variant={calcDir==='SHORT'?'default':'outline'} className={calcDir==='SHORT'?'bg-[#e31937] text-white':'border-[#333]'} onClick={()=>setCalcDir('SHORT')}>SHORT</Button></div></div>
            </CardContent></Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[{l:'Max Shares',v:String(maxShares),c:'text-[#00d4ff]'},{l:'Posicion Size',v:fmt$(posSize),c:'text-white'},{l:'Perdida Potencial',v:fmt$(potLoss),c:'text-[#e31937]'},{l:'Target 1:1',v:`$${t1.toFixed(2)}`,c:'text-[#00c853]'},{l:'Target 1:3',v:`$${t3.toFixed(2)}`,c:'text-[#00c853]'}].map((s,i)=><Card key={i} className="bg-[#111] border-[#222]"><CardContent className="p-3 text-center"><p className="text-[10px] text-zinc-500">{s.l}</p><p className={`text-lg font-bold ${s.c}`}>{s.v}</p></CardContent></Card>)}
            </div></div>)
          })()}

          {/* CHECKLIST */}
          {page==='checklist'&&(()=>{
            const doneCount=CHECKLIST_ITEMS.filter(i=>checkItems[i]).length
            return(<div className="space-y-4">
              <div className="flex items-center justify-between"><Progress value={doneCount/CHECKLIST_ITEMS.length*100} className="flex-1 mr-4 h-2"/><span className="text-sm font-medium">{doneCount}/{CHECKLIST_ITEMS.length}</span></div>
              <div className="space-y-2">{CHECKLIST_ITEMS.map((item,i)=>(
                <label key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#111] border-[#222] cursor-pointer hover:bg-[#1a1a1a]">
                  <input type="checkbox" checked={!!checkItems[item]} onChange={e=>setCheckItems(p=>({...p,[item]:e.target.checked}))} className="w-4 h-4 accent-[#e31937]"/>
                  <span className={`text-sm ${checkItems[item]?'text-zinc-400 line-through':'text-white'}`}>{item}</span>
                </label>
              ))}</div>
              <div className="flex gap-2"><Button size="sm" onClick={()=>{const h=[...checkHistory,{date:new Date().toISOString(),done:doneCount,total:CHECKLIST_ITEMS.length}];setCheckHistory(h);showToast('Checklist guardado');setCheckItems({})}} className="bg-[#e31937] hover:bg-[#c41530] text-white">Guardar y Resetear</Button><Button size="sm" variant="outline" className="border-[#333]" onClick={()=>setCheckItems({})}>Resetear</Button></div>
              {checkHistory.length>0&&<Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Historial</CardTitle></CardHeader><CardContent>{checkHistory.slice(-5).reverse().map((h,i)=>(<div key={i} className="flex justify-between text-xs py-1"><span className="text-zinc-400">{fmtDateShort(h.date)}</span><span>{h.done}/{h.total} completados</span></div>))}</CardContent></Card>}
            </div>)
          })()}

          {/* PSYCHOLOGY */}
          {page==='psychology'&&(()=>{
            const avgPre=psychEntries.length?Math.round(psychEntries.reduce((a,e)=>a+e.pre,0)/psychEntries.length*10)/10:0
            const avgPost=psychEntries.length?Math.round(psychEntries.reduce((a,e)=>a+e.post,0)/psychEntries.length*10)/10:0
            const trendLabel=psychEntries.length>=2?(() => {const last3=psychEntries.slice(-3);const diff=last3[last3.length-1].post-last3[0].pre;if(diff>1)return'Positiva';if(diff<-1)return'Negativa';return'Estable'})():'Sin datos'
            const trendColor=trendLabel==='Positiva'?'text-[#00c853]':trendLabel==='Negativa'?'text-[#e31937]':'text-[#f59e0b]'
            return(<div className="space-y-4">
              <div><h3 className="text-sm font-semibold">Psicologia del Trader</h3><p className="text-xs text-zinc-500">Rastrea tu estado mental y emocional</p></div>
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 text-center"><p className="text-[10px] text-zinc-500 uppercase">Emocion Pre</p><p className="text-2xl font-bold mt-1" style={{color:'#ff6b00'}}>{avgPre||psychPre}</p><p className="text-lg">{avgPre>=7?'😊':avgPre>=4?'😐':'😟'}</p></CardContent></Card>
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 text-center"><p className="text-[10px] text-zinc-500 uppercase">Emocion Post</p><p className="text-2xl font-bold mt-1" style={{color:'#00d4ff'}}>{avgPost||psychPost}</p><p className="text-lg">{avgPost>=7?'😊':avgPost>=4?'😐':'😟'}</p></CardContent></Card>
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 text-center"><p className="text-[10px] text-zinc-500 uppercase">Registros</p><p className="text-2xl font-bold mt-1">{psychEntries.length}</p><p className="text-xs text-zinc-500">total</p></CardContent></Card>
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 text-center"><p className="text-[10px] text-zinc-500 uppercase">Tendencia</p><p className={`text-lg font-bold mt-1 ${trendColor}`}>{trendLabel}</p><p className="text-lg">{trendLabel==='Positiva'?'📈':trendLabel==='Negativa'?'📉':'➡️'}</p></CardContent></Card>
              </div>
              {/* New Entry Form */}
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-5 space-y-4">
                <h4 className="text-sm font-semibold">Nuevo Registro</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-xs text-zinc-400">Pre-sesion Emocion <span className="font-bold text-white">{psychPre}</span>/10</Label><Slider min={1} max={10} value={[psychPre]} onValueChange={v=>setPsychPre(v[0])} className="mt-2"/></div>
                    <div><Label className="text-xs text-zinc-400">Post-sesion Emocion <span className="font-bold text-white">{psychPost}</span>/10</Label><Slider min={1} max={10} value={[psychPost]} onValueChange={v=>setPsychPost(v[0])} className="mt-2"/></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-xs text-zinc-400">Confianza <span className="font-bold text-white">{psychConf}</span>/10</Label><Slider min={1} max={10} value={[psychConf]} onValueChange={v=>setPsychConf(v[0])} className="mt-2"/></div>
                    <div><Label className="text-xs text-zinc-400">Disciplina <span className="font-bold text-white">{psychDisc}</span>/10</Label><Slider min={1} max={10} value={[psychDisc]} onValueChange={v=>setPsychDisc(v[0])} className="mt-2"/></div>
                  </div>
                  <div><Label className="text-xs text-zinc-400">Calidad de Sesion</Label><Select value={psychQuality} onValueChange={setPsychQuality}><SelectTrigger className="bg-[#1a1a1a] border-[#333] mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Excelente">Excelente</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Mala">Mala</SelectItem><SelectItem value="Terrible">Terrible</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs text-zinc-400">Notas / Reflexiones</Label><Textarea placeholder="Como te sentiste hoy? Que aprendiste?" value={psychNotes} onChange={e=>setPsychNotes(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1 min-h-[80px]"/></div>
                </div>
                <Button className="bg-[#e31937] hover:bg-[#c41530] text-white" onClick={()=>{const id=psychEntries.length>0?Math.max(...psychEntries.map(e=>e.id))+1:1;setPsychEntries(p=>[...p,{id,date:new Date().toISOString(),pre:psychPre,post:psychPost,conf:psychConf,disc:psychDisc,quality:psychQuality,notes:psychNotes}]);setPsychPre(5);setPsychPost(5);setPsychConf(5);setPsychDisc(5);setPsychQuality('Normal');setPsychNotes('');showToast('Registro guardado')}}>Guardar Registro</Button>
              </CardContent></Card>
              {/* Recent Records */}
              {psychEntries.length>0&&<Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Registros Recientes</CardTitle></CardHeader><CardContent className="space-y-2">{psychEntries.slice().reverse().slice(0,10).map(e=>(<div key={e.id} className="p-3 rounded-lg bg-[#1a1a1a] flex justify-between items-center"><div className="flex items-center gap-3"><div><p className="text-xs font-medium">{fmtDateShort(e.date)}</p><p className="text-xs text-zinc-400">Pre: {e.pre} | Post: {e.post} | Conf: {e.conf} | Disc: {e.disc}</p></div></div><Badge className={e.quality==='Excelente'?'bg-[#00c853]/20 text-[#00c853]':e.quality==='Mala'?'bg-[#f59e0b]/20 text-[#f59e0b]':e.quality==='Terrible'?'bg-[#e31937]/20 text-[#e31937]':'bg-[#333] text-zinc-400'}>{e.quality}</Badge></div>))}</CardContent></Card>}
            </div>)
          })()}

          {/* TIMER */}
          {page==='timer'&&(
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-6 text-center space-y-4"><h3 className="text-sm font-semibold">Sesion de Trading</h3><p className="text-5xl font-mono font-bold">{fmtTimer(timerSec)}</p><div className="flex justify-center gap-2"><Button size="sm" onClick={()=>setTimerRun(!timerRun)} className={timerRun?'bg-[#e31937] text-white':'bg-[#00c853] text-white'}>{timerRun?'Pausar':'Iniciar'}</Button><Button size="sm" variant="outline" className="border-[#333]" onClick={()=>{setTimerRun(false);setTimerSec(0)}}>Resetear</Button></div></CardContent></Card>
                <Card className="bg-[#111] border-[#222]"><CardContent className="p-6 text-center space-y-4"><h3 className="text-sm font-semibold">Pomodoro ({pomMin} min)</h3><p className="text-5xl font-mono font-bold" style={{color:pomRun?'#e31937':'white'}}>{fmtTimer(pomSec)}</p><div className="flex items-center justify-center gap-2"><Label className="text-xs">Min:</Label><Input type="number" value={pomMin} onChange={e=>{const v=parseInt(e.target.value)||25;setPomMin(v);if(!pomRun)setPomSec(v*60)}} className="w-16 bg-[#1a1a1a] border-[#333] text-center"/></div><div className="flex justify-center gap-2"><Button size="sm" onClick={()=>setPomRun(!pomRun)} className={pomRun?'bg-[#e31937] text-white':'bg-[#00c853] text-white'}>{pomRun?'Pausar':'Iniciar'}</Button></div><p className="text-xs text-zinc-500">Sesiones completadas: {sesCount}</p></CardContent></Card>
              </div>
            </div>
          )}

          {/* GOALS */}
          {page==='goals'&&(
            <div className="space-y-4">
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold">Nuevo Objetivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Select defaultValue="profit"><SelectTrigger className="bg-[#1a1a1a] border-[#333]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="profit">Profit</SelectItem><SelectItem value="trades">Trades</SelectItem><SelectItem value="wr">Win Rate</SelectItem></SelectContent></Select>
                  <Input placeholder="Meta" className="bg-[#1a1a1a] border-[#333]"/><Input placeholder="Actual" className="bg-[#1a1a1a] border-[#333]"/>
                  <Select defaultValue="diario"><SelectTrigger className="bg-[#1a1a1a] border-[#333]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="diario">Diario</SelectItem><SelectItem value="semanal">Semanal</SelectItem><SelectItem value="mensual">Mensual</SelectItem></SelectContent></Select>
                </div>
                <Button size="sm" className="bg-[#e31937] hover:bg-[#c41530] text-white" onClick={()=>{const id=goals.length>0?Math.max(...goals.map(g=>g.id))+1:1;setGoals(p=>[...p,{id,type:'profit',target:'100',current:'0',unit:'$',period:'diario',createdAt:new Date().toISOString()}]);showToast('Objetivo agregado')}}>Agregar</Button>
              </CardContent></Card>
              <div className="space-y-2">{goals.map(g=>{const pct=parseFloat(g.target)>0?Math.min(100,parseFloat(g.current||'0')/parseFloat(g.target)*100):0;return(<Card key={g.id} className="bg-[#111] border-[#222]"><CardContent className="p-4"><div className="flex justify-between items-center mb-2"><span className="text-sm font-medium capitalize">{g.type} - {g.period}</span><button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))} className="text-[#e31937] hover:bg-[#e31937]/10 p-1 rounded"><Trash2 size={14}/></button></div><Progress value={pct} className="h-2 mb-1"/><p className="text-xs text-zinc-400">{g.current || 0} / {g.target} {g.unit} ({Math.round(pct)}%)</p></CardContent></Card>)})}</div>
            </div>
          )}

          {/* SIMULATOR */}
          {page==='simulator'&&(
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[{l:'Balance Virtual',v:fmt$(simBal),c:'text-[#00d4ff]'},{l:'P&L Simulado',v:fmt$(simPnL),c:simPnL>=0?'text-[#00c853]':'text-[#e31937]'},{l:'Win Rate',v:`${simWR}%`,c:'text-[#f59e0b]'},{l:'Trades',v:String(simTrades.length),c:'text-white'}].map((s,i)=><Card key={i} className="bg-[#111] border-[#222]"><CardContent className="p-3"><p className="text-[10px] text-zinc-500">{s.l}</p><p className={`text-lg font-bold ${s.c}`}>{s.v}</p></CardContent></Card>)}
              </div>
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold">Ejecutar Trade</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input placeholder="Precio TSLA" value={simPrice} onChange={e=>setSimPrice(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                  <Input placeholder="Shares" value={simShares} onChange={e=>setSimShares(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                  <Select value={simDir} onValueChange={v=>setSimDir(v as 'BUY'|'SELL')}><SelectTrigger className="bg-[#1a1a1a] border-[#333]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="BUY">BUY</SelectItem><SelectItem value="SELL">SELL</SelectItem></SelectContent></Select>
                  <Button onClick={handleSimTrade} className={simDir==='BUY'?'bg-[#00c853] text-white':'bg-[#e31937] text-white'}>{simDir==='BUY'?'Comprar':'Vender'}</Button>
                </div>
              </CardContent></Card>
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">Trades Simulados</h3><Button size="sm" variant="outline" className="border-[#e31937] text-[#e31937]" onClick={resetSim}>Reset</Button></div>
                {simTrades.slice().reverse().map(t=>(<div key={t.id} className="flex justify-between items-center p-2 rounded bg-[#1a1a1a] text-xs"><span className={t.pnl>=0?'text-[#00c853]':'text-[#e31937]'}>{fmt$(t.pnl)}</span><span>{t.dir} {t.shares} @ ${t.entry.toFixed(2)}</span><span className="text-zinc-500">{fmtDateShort(t.date)}</span></div>))}
                {simTrades.length===0&&<p className="text-zinc-500 text-sm text-center py-4">Sin trades simulados</p>}
              </CardContent></Card>
            </div>
          )}

          {/* CALENDAR */}
          {page==='calendar'&&(
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select value={calFilter} onValueChange={setCalFilter}><SelectTrigger className="w-32 bg-[#1a1a1a] border-[#333] text-xs h-8"><SelectValue placeholder="Tipo"/></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Earnings">Earnings</SelectItem><SelectItem value="FOMC">FOMC</SelectItem><SelectItem value="CPI">CPI</SelectItem><SelectItem value="NFP">NFP</SelectItem><SelectItem value="OpEx">OpEx</SelectItem></SelectContent></Select>
                <Select value={calImpact} onValueChange={setCalImpact}><SelectTrigger className="w-32 bg-[#1a1a1a] border-[#333] text-xs h-8"><SelectValue placeholder="Impacto"/></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="high">Alto</SelectItem><SelectItem value="medium">Medio</SelectItem><SelectItem value="low">Bajo</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">{filteredEvents.map((e,i)=>(
                <Card key={i} className="bg-[#111] border-[#222]"><CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${e.impact==='high'?'bg-[#e31937]':e.impact==='medium'?'bg-[#f59e0b]':'bg-[#00c853]'}`}/>
                  <div className="flex-1"><p className="text-sm font-medium">{e.title}</p><p className="text-xs text-zinc-400">{e.type} - {fmtDate(e.date)}</p></div>
                  <Badge className={e.impact==='high'?'bg-[#e31937]/20 text-[#e31937]':e.impact==='medium'?'bg-[#f59e0b]/20 text-[#f59e0b]':'bg-[#00c853]/20 text-[#00c853]'}>{e.impact==='high'?'Alto':e.impact==='medium'?'Medio':'Bajo'}</Badge>
                </CardContent></Card>
              ))}</div>
            </div>
          )}

          {/* HEATMAP */}
          {page==='heatmap'&&(
            <div className="space-y-4">
              <div className="flex gap-2"><Button size="sm" variant={heatView==='pnl'?'default':'outline'} className={heatView==='pnl'?'bg-[#e31937] text-white':'border-[#333]'} onClick={()=>setHeatView('pnl')}>P&L</Button><Button size="sm" variant={heatView==='count'?'default':'outline'} className={heatView==='count'?'bg-[#e31937] text-white':'border-[#333]'} onClick={()=>setHeatView('count')}>Trades</Button></div>
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="flex gap-1 mb-1"><div className="w-16"/><div className="flex-1 grid grid-cols-13 gap-1 text-center text-[10px] text-zinc-500">{Array.from({length:13},(_,i)=>(<span key={i}>{i+6}:00</span>))}</div></div>
                  {['Lun','Mar','Mie','Jue','Vie','Sab'].map((day,di)=>(
                    <div key={day} className="flex gap-1 mb-1"><span className="w-16 text-xs text-zinc-400 flex items-center">{day}</span>
                      <div className="flex-1 grid grid-cols-13 gap-1">{Array.from({length:13},(_,hi)=>{
                        const val=heatData[di]?.[hi];const color=val===null?'bg-[#1a1a1a]':heatView==='pnl'?(val>=0?`bg-[#00c853]`:`bg-[#e31937]`):`bg-[#00d4ff]`;const opacity=val===null?1:heatView==='pnl'?Math.min(1,Math.abs(val)/100):Math.min(1,(val||0)/5)
                        return <div key={hi} className={`h-8 rounded ${color} flex items-center justify-center text-[9px]`} style={{opacity}} title={`${day} ${hi+6}:00 ${heatView==='pnl'?'P&L:'+val:'Trades:'+val}`}>{val!==null?(heatView==='pnl'?fmt$(val):val):''}</div>
                      })}</div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </div>
          )}

          {/* PLAYBOOK */}
          {page==='playbook'&&(
            <div className="space-y-4">
              {STRATEGIES.map((s,i)=>(
                <Card key={i} className="bg-[#111] border-[#222]"><CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3"><div><h3 className="font-bold" style={{color:s.color}}>{s.name}</h3><p className="text-xs text-zinc-400">WR: {s.wr} | {s.difficulty}</p></div>
                    <Select value={playStatus[s.name]||'No Iniciado'} onValueChange={v=>setPlayStatus(p=>({...p,[s.name]:v}))}><SelectTrigger className="w-28 bg-[#1a1a1a] border-[#333] text-xs h-7"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="No Iniciado">No Iniciado</SelectItem><SelectItem value="Aprendiendo">Aprendiendo</SelectItem><SelectItem value="Dominado">Dominado</SelectItem></SelectContent></Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#0a0a0a] rounded p-3"><p className="font-semibold text-[#00c853] mb-1">Entrada</p><ul className="space-y-1 text-zinc-300">{s.entry.map((e,j)=><li key={j}>{j+1}. {e}</li>)}</ul></div>
                    <div className="bg-[#0a0a0a] rounded p-3"><p className="font-semibold text-[#e31937] mb-1">Salida</p><ul className="space-y-1 text-zinc-300">{s.exit.map((e,j)=><li key={j}>{e}</li>)}</ul></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><span className="text-xs text-zinc-500">Indicadores:</span>{s.indicators.map(ind=><Badge key={ind} variant="outline" className="border-[#333] text-zinc-400 text-[10px]">{ind}</Badge>)}</div>
                  <p className="text-xs text-zinc-500 mt-2">Mejor momento: {s.bestTimes}</p>
                  <p className="text-xs text-zinc-500">Errores comunes: {s.mistakes.join(', ')}</p>
                </CardContent></Card>
              ))}
            </div>
          )}

          {/* REVIEW DIARIO */}
          {page==='review'&&(
            <div className="space-y-4">
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold">Review Diario</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label className="text-xs">Fecha</Label><Input type="date" value={revDate} onChange={e=>setRevDate(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div>
                  <div><Label className="text-xs">Session Score ({revScore}/10)</Label><Slider min={1} max={10} value={[revScore]} onValueChange={v=>setRevScore(v[0])} className="mt-2"/></div>
                  <div><Label className="text-xs">Estado Emocional ({revEmotion}/10)</Label><Slider min={1} max={10} value={[revEmotion]} onValueChange={v=>setRevEmotion(v[0])} className="mt-2"/></div>
                  <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={revPlan} onChange={e=>setRevPlan(e.target.checked)} className="accent-[#e31937]"/>Segui mi plan</label></div>
                </div>
                <Textarea placeholder="Mejor trade del dia..." value={revBest} onChange={e=>setRevBest(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                <Textarea placeholder="Peor trade del dia..." value={revWorst} onChange={e=>setRevWorst(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                <Textarea placeholder="Lecciones aprendidas..." value={revLesson} onChange={e=>setRevLesson(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                <div><Label className="text-xs">Reglas Cumplidas</Label><div className="grid grid-cols-2 gap-1 mt-1">{REVIEW_RULES.map((r,i)=><label key={i} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!revRules[r]} onChange={e=>setRevRules(p=>({...p,[r]:e.target.checked}))} className="accent-[#e31937]"/><span className="text-zinc-300">{r}</span></label>)}</div></div>
                <Textarea placeholder="Notas para manana..." value={revNotes} onChange={e=>setRevNotes(e.target.value)} className="bg-[#1a1a1a] border-[#333]"/>
                <Button className="bg-[#e31937] hover:bg-[#c41530] text-white" onClick={()=>{const id=reviews.length>0?Math.max(...reviews.map(r=>r.id))+1:1;setReviews(p=>[...p,{id,date:revDate,score:revScore,best:revBest,worst:revWorst,lesson:revLesson,emotion:revEmotion,rules:{...revRules},notes:revNotes,plan:revPlan}]);showToast('Review guardado')}}>Guardar Review</Button>
              </CardContent></Card>
              {reviews.length>0&&(
                <Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Historial de Reviews</CardTitle></CardHeader><CardContent className="space-y-2">
                  <ResponsiveContainer width="100%" height={150}><LineChart data={reviews.map(r=>({date:fmtDateShort(r.date),score:r.score}))}><CartesianGrid strokeDasharray="3 3" stroke="#222"/><XAxis dataKey="date" tick={{fontSize:10}} stroke="#555"/><YAxis domain={[0,10]} tick={{fontSize:10}} stroke="#555"/><Tooltip contentStyle={{background:'#1a1a1a',border:'#333',borderRadius:8}}/><Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} dot={{fill:'#00d4ff'}}/></LineChart></ResponsiveContainer>
                  {reviews.slice().reverse().slice(0,5).map(r=>(<div key={r.id} className="p-3 rounded-lg bg-[#1a1a1a]"><div className="flex justify-between text-xs mb-1"><span className="font-medium">{fmtDateShort(r.date)}</span><span className={r.score>=7?'text-[#00c853]':r.score>=4?'text-[#f59e0b]':'text-[#e31937]'}>Score: {r.score}/10</span></div>{r.lesson&&<p className="text-xs text-zinc-400 mt-1">{r.lesson.slice(0,100)}{r.lesson.length>100?'...':''}</p>}</div>))}
                </CardContent></Card>
              )}
            </div>
          )}

          {/* CAPITAL */}
          {page==='capital'&&(()=>{
            const deposits=txs.filter(t=>t.type==='deposit').reduce((a,t)=>a+t.amount,0)
            const withdrawals=txs.filter(t=>t.type==='withdrawal').reduce((a,t)=>a+t.amount,0)
            return(<div className="space-y-4">
              <Card className="bg-gradient-to-r from-[#e31937]/20 to-transparent border-[#e31937]/30"><CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div><p className="text-[10px] text-zinc-500">Capital Inicial</p><p className="text-xl font-bold">{fmt$(initCapital)}</p></div>
                <div><p className="text-[10px] text-zinc-500">Depositos</p><p className="text-lg font-semibold text-[#00c853]">{fmt$(deposits)}</p></div>
                <div><p className="text-[10px] text-zinc-500">Retiros</p><p className="text-lg font-semibold text-[#e31937]">{fmt$(withdrawals)}</p></div>
                <div><p className="text-[10px] text-zinc-500">Balance</p><p className={`text-xl font-bold ${totalBal>=0?'text-[#00c853]':'text-[#e31937]'}`}>{fmt$(totalBal)}</p></div>
                <div><p className="text-[10px] text-zinc-500">ROI</p><p className="text-lg font-semibold" style={{color:roi>=0?'#00c853':'#e31937'}}>{roi}%</p></div>
              </CardContent></Card>
              {!initCapital&&<Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-3"><Label className="text-sm">Capital Inicial</Label><div className="flex gap-2"><Input type="number" placeholder="25000" className="bg-[#1a1a1a] border-[#333] flex-1"/><Button onClick={()=>{setInitCapital(parseFloat((document.querySelector('input[type=number]')as HTMLInputElement)?.value||'25000'));showToast('Capital configurado')}} className="bg-[#e31937] text-white">Guardar</Button></div></CardContent></Card>}
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-4 space-y-3"><h3 className="text-sm font-semibold">Movimientos</h3><div className="flex gap-2"><Input type="number" placeholder="Monto" id="capAmount" className="bg-[#1a1a1a] border-[#333] flex-1"/><Button size="sm" className="bg-[#00c853] text-white" onClick={()=>{const a=parseFloat((document.getElementById('capAmount')as HTMLInputElement)?.value||'0');if(!a)return;const id=txs.length>0?Math.max(...txs.map(t=>t.id))+1:1;setTxs(p=>[...p,{id,date:new Date().toISOString(),type:'deposit',amount:a,note:''}]);showToast('Deposito agregado')}}>Depositar</Button><Button size="sm" className="bg-[#e31937] text-white" onClick={()=>{const a=parseFloat((document.getElementById('capAmount')as HTMLInputElement)?.value||'0');if(!a)return;const id=txs.length>0?Math.max(...txs.map(t=>t.id))+1:1;setTxs(p=>[...p,{id,date:new Date().toISOString(),type:'withdrawal',amount:a,note:''}]);showToast('Retiro agregado')}}>Retirar</Button></div>
                {txs.length>0&&<div className="space-y-1">{txs.slice().reverse().map(t=>(<div key={t.id} className="flex justify-between p-2 rounded bg-[#1a1a1a] text-xs"><span className={t.type==='deposit'?'text-[#00c853]':'text-[#e31937]'}>{t.type==='deposit'?'+':'-'}${t.amount.toFixed(2)}</span><span className="text-zinc-500">{fmtDateShort(t.date)}</span></div>))}</div>}
              </CardContent></Card>
            </div>)
          })()}

          {/* PROFILE */}
          {page==='profile'&&(
            <div className="space-y-4">
              <Card className="bg-[#111] border-[#222]"><CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarFallback style={{backgroundColor:profAvatar}} className="text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div><h3 className="text-lg font-bold">{user.name}</h3><p className="text-sm text-zinc-400">{user.email}</p></div></div>
                <div className="space-y-3"><div><Label className="text-xs">Nombre</Label><Input value={profName} onChange={e=>setProfName(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1"/></div><div><Label className="text-xs">Broker</Label><Input value={profBroker} onChange={e=>setProfBroker(e.target.value)} className="bg-[#1a1a1a] border-[#333] mt-1" placeholder="Webull"/></div>
                <div><Label className="text-xs">Color de Avatar</Label><div className="flex gap-2 mt-1">{['#e31937','#00c853','#00d4ff','#a855f7','#f59e0b','#ff6b00','#14b8a6','#ef4444'].map(c=><button key={c} onClick={()=>setProfAvatar(c)} className={`w-8 h-8 rounded-full ${profAvatar===c?'ring-2 ring-white ring-offset-2 ring-offset-[#111]':''}`} style={{backgroundColor:c}}/>)}</div></div>
                <Button className="bg-[#e31937] hover:bg-[#c41530] text-white" onClick={()=>{setUser(prev=>prev?{...prev,name:profName,avatar:profAvatar,broker:profBroker}:null);setStore('tv_user',user);showToast('Perfil actualizado')}}>Guardar Cambios</Button></div>
              </CardContent></Card>
              {stats.totalTrades>0&&<Card className="bg-[#111] border-[#222]"><CardHeader><CardTitle className="text-sm">Estadisticas</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3">
                {[['Total Trades',stats.totalTrades],['Win Rate',`${stats.winRate}%`],['P&L Total',fmt$(stats.totalPnL)],['Profit Factor',stats.profitFactor===Infinity?'∞':stats.profitFactor],['Mejor Dia',fmt$(stats.bestDay)],['Peor Dia',fmt$(stats.worstDay)]].map(([l,v],i)=><div key={i} className="bg-[#1a1a1a] rounded p-3"><p className="text-[10px] text-zinc-500">{l}</p><p className="text-sm font-bold">{v}</p></div>)}
              </CardContent></Card>}
            </div>
          )}

        </div>

        {/* Trade Dialog */}
        {tradeOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={()=>setTradeOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#111] border border-[#222] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 pb-0 flex justify-between items-start">
              <h2 className="text-lg font-semibold text-white">{editTrade?'Editar Trade':'Nuevo Trade'}</h2>
              <button onClick={()=>setTradeOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Fecha y Simbolo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Fecha y Hora</label><input type="datetime-local" value={tf.date} onChange={e=>setTf(p=>({...p,date:e.target.value}))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white focus:border-[#e31937] outline-none transition-colors"/></div>
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Simbolo</label><Input list="symbols-list" value={tf.symbol} onChange={e=>setTf(p=>({...p,symbol:e.target.value}))} className="bg-[#1a1a1a] border-[#333] h-9 text-sm text-white focus:border-[#e31937] outline-none transition-colors" placeholder="Escribe o elige..."/><datalist id="symbols-list">{DEFAULT_SYMBOLS.map(s=><option key={s} value={s}/>)}</datalist></div>
              </div>

              {/* Direccion LONG/SHORT */}
              <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Direccion</label><div className="flex gap-2 mt-1"><button onClick={()=>setTf(p=>({...p,direction:'LONG'}))} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${tf.direction==='LONG'?'bg-[#00c853]/15 border-[#00c853]/50 text-[#00c853]':'border-[#333] text-zinc-400 hover:border-[#444]'}`}>LONG</button><button onClick={()=>setTf(p=>({...p,direction:'SHORT'}))} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${tf.direction==='SHORT'?'bg-[#e31937]/15 border-[#e31937]/50 text-[#e31937]':'border-[#333] text-zinc-400 hover:border-[#444]'}`}>SHORT</button></div></div>

              {/* Precios y Costos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Precio Entrada</label><input type="number" step="any" value={tf.entryPrice} onChange={e=>setTf(p=>({...p,entryPrice:e.target.value}))} placeholder="0.00" className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors"/></div>
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Precio Salida</label><input type="number" step="any" value={tf.exitPrice} onChange={e=>setTf(p=>({...p,exitPrice:e.target.value}))} placeholder="0.00" className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors"/></div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-300 text-xs font-medium flex items-center gap-1">Comisión <span className="text-[10px] text-zinc-500">(Total $)</span></label>
                  <input type="number" step="any" placeholder="0.00" value={tf.commission} onChange={e=>{const val=e.target.value.replace(",",".");setTf(p=>({...p,commission:val}))}} className="w-full bg-[#1a1a1a] border border-[#e31937]/30 rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                </div>
              </div>

              {/* Stop Loss, Take Profit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Stop Loss</label><input type="number" step="any" value={tf.stopLoss} onChange={e=>setTf(p=>({...p,stopLoss:e.target.value}))} placeholder="Opcional" className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors"/></div>
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Take Profit</label><input type="number" step="any" value={tf.takeProfit} onChange={e=>setTf(p=>({...p,takeProfit:e.target.value}))} placeholder="Opcional" className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors"/></div>
              </div>

              {/* Shares y Setup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="flex items-center gap-2 text-zinc-300 text-xs font-medium">Shares (Cantidad)</label><input type="number" step="any" placeholder="0.00" value={tf.shares} onChange={e=>{const val=e.target.value.replace(",",".");setTf(p=>({...p,shares:val}))}} className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white mt-1 outline-none focus:border-[#e31937] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/></div>
                <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Setup</label><Input list="setups-list" value={tf.setup} onChange={e=>setTf(p=>({...p,setup:e.target.value}))} className="bg-[#1a1a1a] border border-[#333] h-9 text-sm text-white focus:border-[#e31937] outline-none transition-colors" placeholder="Escribe o elige..."/><datalist id="setups-list">{DEFAULT_SETUPS.map(s=><option key={s} value={s}/>)}</datalist></div>
              </div>

              {/* Liquidacion Final */}
              {(()=>{
                const ep=parseFloat(tf.entryPrice)||0,xp=parseFloat(tf.exitPrice)||0,sh=parseFloat(tf.shares)||0
                const comm=parseFloat(tf.commission)||0,bf=tf.isFunded?(parseFloat(tf.brokerFees)||0):0,ps=tf.isFunded?(parseFloat(tf.profitSplit)||100):100
                const rawPnl=tf.direction==='LONG'?(xp-ep)*sh:(ep-xp)*sh
                const grossPnl=rawPnl-comm
                const netReal=Math.round((grossPnl-bf)*(ps/100)*100)/100
                const hasValues=ep>0&&xp>0&&sh>0
                return(
              <div className="space-y-2 p-3 bg-zinc-900/50 border border-[#333] rounded-lg mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Liquidacion Final</p>
                  <button onClick={()=>setTf(p=>({...p,isFunded:!p.isFunded}))} className={`relative w-9 h-5 rounded-full transition-colors ${tf.isFunded?'bg-[#e31937]':'bg-[#333]'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${tf.isFunded?'translate-x-4':''}`}/>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 -mt-1">{tf.isFunded?'Cuenta de Fondeo activada':'Cuenta personal'}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Bruto P&L:</span>
                  <span className="text-white font-medium">{hasValues?fmt$(rawPnl):'$0.00'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">- Comision:</span>
                  <span className="text-[#e31937]">{comm>0?`-$${comm.toFixed(2)}`:'$0.00'}</span>
                </div>
                {tf.isFunded&&<>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Spread/Broker:</span>
                  <input type="number" step="any" placeholder="0.00" value={tf.brokerFees} onChange={e=>{const val=e.target.value.replace(",",".");setTf(p=>({...p,brokerFees:val}))}} className="w-20 bg-[#1a1a1a] border border-[#444] rounded px-2 py-0.5 text-right text-white outline-none focus:border-[#e31937] text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Profit Split:</span>
                  <div className="flex items-center gap-1">
                    <input type="number" step="any" placeholder="100" value={tf.profitSplit} onChange={e=>{let v=e.target.value.replace(",",".");if(v&&parseFloat(v)>100)v='100';if(v&&parseFloat(v)<0)v='0';setTf(p=>({...p,profitSplit:v}))}} className="w-14 bg-[#1a1a1a] border border-[#444] rounded px-2 py-0.5 text-right text-white outline-none focus:border-[#e31937] text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <span className="text-zinc-500">%</span>
                  </div>
                </div>
                </>}
                <hr className="border-[#333] my-1"/>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{tf.isFunded?'Ganancia Neta Real:':'P&L Neto:'}</span>
                  <span className={`text-lg font-bold ${hasValues?(netReal>=0?'text-[#00c853]':'text-[#e31937]'):'text-zinc-600'}`}>{hasValues?fmt$(netReal):'$0.00'}</span>
                </div>
                {tf.isFunded&&ps<100&&hasValues&&grossPnl>0&&<p className="text-[10px] text-zinc-500 italic text-right">{fmt$(grossPnl-bf)} x {ps}% = {fmt$(netReal)}</p>}
              </div>
                )
              })()}

              {/* Emocion Slider */}
              <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Emocion (1-10)</label><div className="flex items-center gap-3 mt-2"><span className="text-sm grayscale hover:grayscale-0 transition-all cursor-default">😰</span><div className="relative flex-1 flex items-center"><input type="range" min="1" max="10" value={tf.emotion} onChange={e=>setTf(p=>({...p,emotion:Number(e.target.value)}))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e31937] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#e31937]/50 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#e31937] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer" style={{background:`linear-gradient(to right, #e31937 ${(tf.emotion-1)*11.1}%, #27272a 0%)`}}/></div><span className="text-sm">🔥</span><span className="text-sm font-medium w-6 text-center text-white">{tf.emotion}</span></div><p className="text-[10px] text-zinc-500 mt-2 italic text-center">{tf.emotion>7?"Cuidado con el exceso de confianza (Greed)":tf.emotion<4?"Posible miedo o inseguridad":"Estado equilibrado"}</p></div>

              {/* Notas y Tags */}
              <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Notas</label><textarea value={tf.notes} onChange={e=>setTf(p=>({...p,notes:e.target.value}))} placeholder="Que paso en este trade?" rows={3} className="w-full bg-[#1a1a1a] border border-[#333] rounded-md p-3 text-sm text-white resize-none outline-none focus:border-[#e31937] transition-colors"/></div>
              <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Tags (separados por coma)</label><input value={tf.tags} onChange={e=>setTf(p=>({...p,tags:e.target.value}))} placeholder="ej: gap, vwap, momentum" className="w-full bg-[#1a1a1a] border border-[#333] rounded-md h-9 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors"/></div>

              {/* Upload Imagen */}
              <div className="flex flex-col gap-1"><label className="text-zinc-300 text-xs font-medium">Captura de Pantalla</label>{tf.screenshot?<div className="relative mt-1"><img src={tf.screenshot} alt="preview" className="w-full max-h-32 object-cover rounded-lg border border-[#333]"/><button onClick={()=>setTf(p=>({...p,screenshot:''}))} className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-[#e31937] transition-colors"><X size={14}/></button></div>:<label className="flex items-center justify-center gap-2 px-3 py-4 rounded-lg border border-dashed border-[#333] hover:border-[#555] cursor-pointer transition-colors group"><Upload size={16} className="text-zinc-400 group-hover:text-white"/><span className="text-sm text-zinc-400 group-hover:text-white">Subir imagen</span><input type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>3*1024*1024){showToast('Imagen maximo 3MB');return}const compressed=await compressImage(f);setTf(p=>({...p,screenshot:compressed}))}}/></label>}</div>

              {/* Footer Buttons */}
              <div className="flex gap-2 pt-4">
                <button onClick={saveTrade} className="flex-1 bg-[#e31937] hover:bg-[#c41530] text-white font-medium py-2.5 rounded-md transition-colors">{editTrade?'Actualizar Trade':'Guardar Trade'}</button>
                <button onClick={()=>setTradeOpen(false)} className="flex-1 bg-transparent border border-[#333] text-zinc-300 hover:bg-[#1a1a1a] font-medium py-2.5 rounded-md transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>}

        {/* Image Modal */}
        {imgModal&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={()=>setImgModal(null)}><img src={imgModal} alt="screenshot" className="max-w-full max-h-[90vh] rounded-lg object-contain" onClick={e=>e.stopPropagation()}/></div>}

        {(page==='dashboard'||page==='journal'||page==='goals')&&<button onClick={()=>openTrade()} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#e31937] hover:bg-[#c41530] shadow-lg shadow-[#e31937]/30 flex items-center justify-center lg:hidden z-50"><Plus size={24} className="text-white"/></button>}
      </main>
    </div>
  )
}
