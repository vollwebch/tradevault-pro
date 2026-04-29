'use client';
import React, { useState, useEffect } from 'react';

const ChecklistProStreaks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Soporte clave Pre-market en:", detail: "371.50", completed: false },
    { id: 2, text: "Resistencia clave Pre-market en:", detail: "378.20", completed: false },
    { id: 3, text: "Sentimiento SPY / QQQ", detail: "Neutral", completed: false },
    { id: 4, text: "Noticias de impacto (Earnings/Fed)", detail: "Ninguna", completed: false }
  ]);

  const [streak, setStreak] = useState(7);
  const [isPerfectDay, setIsPerfectDay] = useState(false);

  useEffect(() => {
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    setIsPerfectDay(allDone);
  }, [tasks]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), text: "Nuevo objetivo...", detail: "", completed: false }]);
  };

  const updateText = (id: number, field: string, value: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  // Dynamic date
  const today = new Date();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()} de ${monthNames[today.getMonth()]}`;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Checklist Pre-Market</h1>
          <p className="text-zinc-400 text-sm mt-1">Disciplina diaria = Resultados consistentes</p>
        </div>
        <button
          onClick={addTask}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 px-4 rounded-lg border border-[#333] transition-all"
        >
          + ANADIR OBJETIVO
        </button>
      </div>

      {/* CARDS DE RESUMEN */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="rounded-xl border py-5 px-6 bg-[#111] border-[#222] flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Fecha de Sesion</p>
          <p className="font-semibold text-lg">{dateStr}</p>
        </div>

        <div className={`rounded-xl border py-5 px-6 transition-all duration-500 flex items-center gap-4 border-[#222] ${isPerfectDay ? 'bg-[#00c853]/10 border-[#00c853]/30 shadow-[0_0_20px_rgba(0,200,83,0.1)]' : 'bg-[#111]'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${isPerfectDay ? 'bg-[#00c853] text-black scale-110' : 'bg-[#e31937]/15 text-[#e31937]'}`}>
            {isPerfectDay ? '✓' : completedCount}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Estado</p>
            <p className={`text-sm font-bold ${isPerfectDay ? 'text-[#00c853]' : 'text-white'}`}>
              {isPerfectDay ? 'DIA PERFECTO!' : `${completedCount}/${tasks.length} Completado`}
            </p>
          </div>
        </div>

        {/* RACHA */}
        <div className="rounded-xl border py-5 px-6 bg-[#111] border-[#222] flex items-center gap-4 relative overflow-hidden">
          <div className={`text-3xl transition-transform duration-500 ${isPerfectDay ? 'scale-125' : 'grayscale opacity-50'}`}>
            🔥
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Racha Actual</p>
            <p className="text-xl font-black text-[#f59e0b] tracking-tighter">{streak} DIAS</p>
          </div>
          {isPerfectDay && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f59e0b]/5 to-transparent animate-pulse" />}
        </div>
      </div>

      {/* LISTA DE CHECKLIST */}
      <div className="rounded-2xl border bg-[#111] border-[#222] shadow-xl">
        <div className="px-6 py-4 border-b border-[#222] flex justify-between items-center">
          <h2 className="font-semibold text-lg">Ritual de Preparacion</h2>
          {isPerfectDay && (
            <span className="text-[10px] bg-[#00c853]/20 text-[#00c853] px-2 py-1 rounded-md font-bold animate-pulse">
              SISTEMA LISTO PARA OPERAR
            </span>
          )}
        </div>

        <div className="p-6 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                task.completed
                  ? 'bg-[#1a1a1a] border-[#00c853]/30 opacity-80'
                  : 'bg-[#0a0a0a] border-[#222] hover:border-[#444]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 w-full">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="accent-[#00c853] w-6 h-6 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateText(task.id, 'text', e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm flex-1 transition-all ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300 focus:text-white'}`}
                />
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <input
                  type="text"
                  value={task.detail}
                  onChange={(e) => updateText(task.id, 'detail', e.target.value)}
                  placeholder="Valor..."
                  className="bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-[#00d4ff] font-mono outline-none focus:border-[#00d4ff] w-full sm:w-40 text-right"
                />
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-zinc-600 hover:text-[#e31937] transition-colors p-1 opacity-0 sm:group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-[#222]">
            <button
              onClick={() => { if (isPerfectDay) setStreak(s => s + 1); }}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isPerfectDay
                  ? 'bg-[#00c853] text-black hover:bg-[#00e660]'
                  : 'bg-[#e31937] text-white hover:bg-[#c41530]'
              }`}
            >
              {isPerfectDay ? 'CONFIRMAR Y EMPEZAR SESION' : 'GUARDAR CHECKLIST'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistProStreaks;
