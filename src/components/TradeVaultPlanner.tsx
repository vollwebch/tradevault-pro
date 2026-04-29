'use client';
import React, { useState } from 'react';

const TradeVaultSuperCalculator = () => {
  // --- ESTADOS ---
  const [capital, setCapital] = useState("25000");
  const [riesgoPer, setRiesgoPer] = useState("1");
  const [precioEntrada, setPrecioEntrada] = useState("250.00");
  const [precioStop, setPrecioStop] = useState("249.50");
  const [ratio, setRatio] = useState("2");
  const [comision, setComision] = useState("0");

  // Estados para Fondeo
  const [esFondeo, setEsFondeo] = useState(false);
  const [profitSplit, setProfitSplit] = useState("80");

  // Estado para Dirección
  const [direccion, setDireccion] = useState("LONG");

  // --- FUNCIÓN PARA LIMPIAR INPUTS (Punto por Coma) ---
  const cleanNum = (val: string): number => {
    if (typeof val !== "string") return val;
    const sanitized = val.replace(',', '.');
    return parseFloat(sanitized) || 0;
  };

  // --- LÓGICA DE CÁLCULO ---
  const cap = cleanNum(capital);
  const rPer = cleanNum(riesgoPer);
  const pEntrada = cleanNum(precioEntrada);
  const pStop = cleanNum(precioStop);
  const rat = cleanNum(ratio);
  const com = cleanNum(comision);
  const split = cleanNum(profitSplit);

  const dineroEnRiesgo = (cap * rPer) / 100;
  const distanciaPrecio = Math.abs(pEntrada - pStop);

  // Cálculo de Acciones
  const shares = distanciaPrecio > 0 ? Math.floor(dineroEnRiesgo / distanciaPrecio) : 0;

  // Cálculo de Target según dirección
  const precioTP = direccion === "LONG"
    ? pEntrada + (distanciaPrecio * rat)
    : pEntrada - (distanciaPrecio * rat);

  // Beneficios
  const beneficioBruto = shares * (distanciaPrecio * rat);
  const beneficioTrasComision = beneficioBruto - com;

  // Cálculo de Fondeo (Si está activo)
  const beneficioFinal = esFondeo
    ? (beneficioTrasComision * split) / 100
    : beneficioTrasComision;

  const costoPosicion = shares * pEntrada;

  // Proyecciones R:R
  const ratios = [1, 1.5, 2, 3, 5];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#0a0a0a] border border-[#222] rounded-3xl text-white shadow-2xl font-sans">

      {/* HEADER CON SELECTOR DE DIRECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">TRADEVAULT <span className="text-[#e31937]">ULTIMATE</span></h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Calculadora Multidireccional &amp; Prop Firm</p>
        </div>

        <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
          <button
            onClick={() => setDireccion("LONG")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${direccion === "LONG" ? "bg-[#00c853] text-black" : "text-zinc-500 hover:text-white"}`}
          >
            COMPRA (LONG)
          </button>
          <button
            onClick={() => setDireccion("SHORT")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${direccion === "SHORT" ? "bg-[#e31937] text-white" : "text-zinc-500 hover:text-white"}`}
          >
            VENTA (SHORT)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA 1: CONFIGURACIÓN BÁSICA */}
        <div className="space-y-6">
          <div className="bg-[#111]/50 p-4 rounded-2xl border border-[#222]">
            <h3 className="text-zinc-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Configuracion de Cuenta</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">CAPITAL DISPONIBLE</label>
                <input type="text" value={capital} onChange={(e) => setCapital(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:border-zinc-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">% RIESGO POR OPERACION</label>
                <input type="text" value={riesgoPer} onChange={(e) => setRiesgoPer(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:border-[#f59e0b] outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#111]/50 p-4 rounded-2xl border border-[#222]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Modo Cuenta Fondeo</h3>
              <input type="checkbox" checked={esFondeo} onChange={() => setEsFondeo(!esFondeo)} className="accent-[#e31937] w-4 h-4 cursor-pointer" />
            </div>
            {esFondeo && (
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">TU PORCENTAJE (PROFIT SPLIT %)</label>
                <input type="text" value={profitSplit} onChange={(e) => setProfitSplit(e.target.value)} placeholder="Ej: 80" className="w-full bg-[#0a0a0a] border border-[#e31937]/30 rounded-lg h-10 px-3 text-sm text-white outline-none focus:border-[#e31937] transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: PARÁMETROS DEL TRADE */}
        <div className="space-y-6">
          <div className="bg-[#111]/50 p-4 rounded-2xl border border-[#222] h-full">
            <h3 className="text-zinc-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Ejecucion de Mercado</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">PRECIO DE ENTRADA</label>
                <input type="text" value={precioEntrada} onChange={(e) => setPrecioEntrada(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-12 px-4 text-lg font-mono text-[#00d4ff] outline-none focus:border-[#00d4ff] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1 uppercase">Stop Loss ({direccion === "LONG" ? "Abajo" : "Arriba"})</label>
                <input type="text" value={precioStop} onChange={(e) => setPrecioStop(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-12 px-4 text-lg font-mono text-[#e31937] outline-none focus:border-[#e31937] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1 uppercase">Ratio R:R</label>
                  <input type="text" value={ratio} onChange={(e) => setRatio(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-10 px-3 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1 uppercase">Comision $</label>
                  <input type="text" value={comision} onChange={(e) => setComision(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg h-10 px-3 text-sm text-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: RESULTADOS */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333] rounded-3xl p-6 text-center flex flex-col justify-center h-full">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Acciones a Comprar</span>
            <div className="text-7xl font-black my-2 tabular-nums">{shares}</div>
            <div className="flex justify-center gap-2 mb-6">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-[10px] font-mono">RIESGO: ${dineroEnRiesgo.toFixed(2)}</span>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Target (TP)</span>
                <span className="text-lg font-bold text-[#00c853]">${precioTP.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Beneficio Real {esFondeo && `(${split}%)`}</span>
                <span className="text-lg font-bold text-[#00c853]">+${beneficioFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PROYECCIONES R:R */}
      <div className="mt-8 bg-[#111]/50 border border-[#222] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#222]">
          <h3 className="font-semibold text-white text-sm">Proyecciones R:R</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Escenarios con diferentes ratios riesgo/beneficio{esFondeo ? ` (Profit Split ${split}%)` : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-zinc-400">
                <th className="text-left py-3 px-5 text-xs font-semibold">Ratio</th>
                <th className="text-right py-3 px-5 text-xs font-semibold">Precio Target</th>
                <th className="text-right py-3 px-5 text-xs font-semibold">Profit Bruto</th>
                {esFondeo && <th className="text-right py-3 px-5 text-xs font-semibold">Profit Fondeo</th>}
                <th className="text-center py-3 px-5 text-xs font-semibold">R:R</th>
              </tr>
            </thead>
            <tbody>
              {ratios.map(r => {
                const targetPrice = direccion === "LONG"
                  ? pEntrada + (distanciaPrecio * r)
                  : pEntrada - (distanciaPrecio * r);
                const profit = dineroEnRiesgo * r;
                const netProfit = profit - com;
                const finalProfit = esFondeo ? (netProfit * split) / 100 : netProfit;
                const barWidth = Math.min((r / 5) * 100, 100);
                return (
                  <tr key={r} className={`border-b border-[#222]/50 hover:bg-[#1a1a1a] transition-colors ${r === rat ? 'bg-[#e31937]/5' : ''}`}>
                    <td className="py-3 px-5 font-bold text-[#00d4ff]">1:{r}</td>
                    <td className="text-right py-3 px-5 font-mono text-[#00c853]">${targetPrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-5 font-mono text-white">+${profit.toFixed(2)}</td>
                    {esFondeo && <td className="text-right py-3 px-5 font-mono text-[#f59e0b]">+${finalProfit.toFixed(2)}</td>}
                    <td className="py-3 px-5">
                      <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden max-w-[120px] mx-auto">
                        <div
                          className="h-full bg-gradient-to-r from-[#f59e0b] to-[#00c853] rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER: ADVERTENCIA DE APALANCAMIENTO */}
      <div className="mt-6 p-4 bg-[#e31937]/5 border border-[#e31937]/20 rounded-xl flex items-center justify-between">
        <p className="text-[10px] text-zinc-400">
          Nota: Esta operacion requiere un poder de compra de <span className="text-white font-bold">${costoPosicion.toLocaleString()}</span>.
          Asegurate de que tu cuenta permite un apalancamiento de {(costoPosicion / cap).toFixed(1)}x.
        </p>
      </div>
    </div>
  );
};

export default TradeVaultSuperCalculator;
