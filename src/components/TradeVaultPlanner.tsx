'use client';
import React, { useState } from 'react';

const TradeVaultPlanner = () => {
  // --- ESTADOS (Inputs del Usuario) ---
  const [capital, setCapital] = useState(25000);
  const [riesgoPer, setRiesgoPer] = useState(1);
  const [precioEntrada, setPrecioEntrada] = useState(250.00);
  const [precioStop, setPrecioStop] = useState(249.50);
  const [ratio, setRatio] = useState(2);
  const [comision, setComision] = useState(0.16);

  // --- LÓGICA DE CÁLCULO ---

  // 1. ¿Cuánto dinero arriesgo en total?
  const dineroEnRiesgo = (capital * riesgoPer) / 100;

  // 2. ¿Qué distancia hay entre mi entrada y mi stop?
  const distanciaCentimos = Math.abs(precioEntrada - precioStop);

  // 3. ¿Cuántas acciones puedo comprar sin pasarme de mi riesgo?
  const shares = distanciaCentimos > 0 ? Math.floor(dineroEnRiesgo / distanciaCentimos) : 0;

  // 4. ¿Dónde debería estar mi Take Profit para cumplir el Ratio?
  // Si es LONG (Entrada > Stop), sumamos. Si es SHORT, restamos.
  const esLong = precioEntrada > precioStop;
  const precioTP = esLong
    ? precioEntrada + (distanciaCentimos * ratio)
    : precioEntrada - (distanciaCentimos * ratio);

  // 5. Ganancia y Costos
  const beneficioBruto = shares * (distanciaCentimos * ratio);
  const beneficioNeto = beneficioBruto - comision;
  const costoTotalPosicion = shares * precioEntrada;

  // Risk level color
  const riskPercent = (costoTotalPosicion / capital);
  const riskColor = riskPercent <= 1 ? '#00c853' : riskPercent <= 2 ? '#f59e0b' : riskPercent <= 3 ? '#ff6b00' : '#e31937';

  // Direction badge
  const dirColor = esLong ? '#00c853' : '#e31937';
  const dirLabel = esLong ? 'LONG' : 'SHORT';

  // Projection table ratios
  const ratios = [1, 1.5, 2, 3, 5];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#111] to-[#0a0a0a] border border-[#222] rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-end border-b border-[#222] pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">TRADE<span className="text-[#e31937]">VAULT</span> PLANNER</h1>
            <p className="text-zinc-500 text-sm mt-1">Calculadora de Gestion de Riesgo Profesional</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Riesgo Permitido</p>
            <p className="text-2xl font-mono text-[#f59e0b] font-bold">${dineroEnRiesgo.toFixed(2)}</p>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex items-center gap-3 mt-5">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border`} style={{ borderColor: dirColor + '40', color: dirColor, backgroundColor: dirColor + '15' }}>
            {dirLabel}
          </div>
          <span className="text-zinc-500 text-xs">
            {esLong ? 'Entrada por encima del Stop' : 'Entrada por debajo del Stop'}
          </span>
          <span className="text-zinc-600 text-xs ml-auto">
            Distancia al stop: ${distanciaCentimos.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: CONFIGURACION */}
        <div className="space-y-5">
          {/* 1. Datos de Cuenta */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
            <h3 className="text-[#e31937] text-xs font-bold uppercase tracking-widest">1. Datos de Cuenta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Capital Total ($)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg h-10 px-3 text-white focus:border-[#e31937] outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">% Riesgo por Trade</label>
                <input
                  type="number"
                  step="0.1"
                  value={riesgoPer}
                  onChange={(e) => setRiesgoPer(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg h-10 px-3 text-white focus:border-[#e31937] outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Parametros del Trade */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
            <h3 className="text-[#00d4ff] text-xs font-bold uppercase tracking-widest">2. Parametros del Trade</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Precio de Entrada ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioEntrada}
                  onChange={(e) => setPrecioEntrada(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg h-10 px-3 text-[#00d4ff] font-bold outline-none focus:border-[#00d4ff] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Stop Loss ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioStop}
                  onChange={(e) => setPrecioStop(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#e31937]/30 rounded-lg h-10 px-3 text-[#e31937] font-bold outline-none focus:border-[#e31937] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Salida y Costos */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">3. Salida y Costos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ratio R:R (1:{ratio})</label>
                <input
                  type="number"
                  step="0.5"
                  value={ratio}
                  onChange={(e) => setRatio(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg h-10 px-3 text-white outline-none focus:border-[#f59e0b] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Comision ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={comision}
                  onChange={(e) => setComision(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg h-10 px-3 text-white outline-none focus:border-[#333] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: RESULTADOS VISUALES */}
        <div className="flex flex-col gap-5">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#222] rounded-2xl p-8 text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Tamano de Posicion</span>
            <div className="text-7xl font-black text-white my-4">{shares}</div>
            <span className="bg-[#00d4ff]/10 text-[#00d4ff] px-4 py-1 rounded-full text-xs font-bold">
              ACCIONES (SHARES)
            </span>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-[#222]">
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Target (TP)</p>
                <p className="text-2xl font-bold text-[#00c853]">${precioTP.toFixed(2)}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Profit Neto</p>
                <p className="text-2xl font-bold text-[#00c853]">+${beneficioNeto.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Capital & Leverage Bar */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Capital Requerido (Leverage):</span>
              <span className="text-sm font-mono font-bold text-white">${costoTotalPosicion.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#222] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((costoTotalPosicion / (capital * 4)) * 100, 100)}%`,
                  backgroundColor: riskColor
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-600 italic">
                * Esta posicion utiliza {riskPercent.toFixed(1)}x de tu capital total
              </span>
              <span className="font-bold" style={{ color: riskColor }}>
                {riskPercent <= 1 ? 'Bajo riesgo' : riskPercent <= 2 ? 'Riesgo moderado' : riskPercent <= 3 ? 'Alto riesgo' : 'Riesgo extremo'}
              </span>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
              <p className="text-[9px] text-zinc-500 uppercase font-bold">Riesgo Max</p>
              <p className="text-lg font-bold text-[#f59e0b] mt-1">${dineroEnRiesgo.toFixed(0)}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
              <p className="text-[9px] text-zinc-500 uppercase font-bold">Beneficio Bruto</p>
              <p className="text-lg font-bold text-[#00c853] mt-1">${beneficioBruto.toFixed(0)}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
              <p className="text-[9px] text-zinc-500 uppercase font-bold">Comision</p>
              <p className="text-lg font-bold text-zinc-400 mt-1">${comision.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proyecciones R:R Table */}
      <div className="mt-6 bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#222]">
          <h3 className="font-semibold text-white text-sm">Proyecciones R:R</h3>
          <p className="text-xs text-zinc-500 mt-1">Escenarios con diferentes ratios riesgo/beneficio</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-zinc-400">
                <th className="text-left py-3 px-5 text-xs font-semibold">Ratio</th>
                <th className="text-right py-3 px-5 text-xs font-semibold">Precio Target</th>
                <th className="text-right py-3 px-5 text-xs font-semibold">Profit Bruto</th>
                <th className="text-right py-3 px-5 text-xs font-semibold">Profit Neto</th>
                <th className="text-center py-3 px-5 text-xs font-semibold">R:R Visual</th>
              </tr>
            </thead>
            <tbody>
              {ratios.map(r => {
                const targetPrice = esLong
                  ? precioEntrada + (distanciaCentimos * r)
                  : precioEntrada - (distanciaCentimos * r);
                const profit = dineroEnRiesgo * r;
                const netProfit = profit - comision;
                const barWidth = Math.min((r / 5) * 100, 100);
                return (
                  <tr key={r} className={`border-b border-[#222]/50 hover:bg-[#1a1a1a] transition-colors ${r === ratio ? 'bg-[#e31937]/5' : ''}`}>
                    <td className="py-3 px-5 font-bold text-[#00d4ff]">1:{r}</td>
                    <td className="text-right py-3 px-5 font-mono text-[#00c853]">${targetPrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-5 font-mono text-white">+${profit.toFixed(2)}</td>
                    <td className="text-right py-3 px-5 font-mono text-[#00c853]">+${netProfit.toFixed(2)}</td>
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
    </div>
  );
};

export default TradeVaultPlanner;
