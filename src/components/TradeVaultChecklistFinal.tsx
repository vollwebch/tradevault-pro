import React, { useState, useEffect } from 'react';

const TradeVaultChecklistFinal = () => {
  // 1. Cargar datos guardados (Racha y Tareas)
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tv_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, text: "Verificar soporte clave en:", detail: "371.50", completed: false },
      { id: 2, text: "Verificar resistencia clave en:", detail: "378.20", completed: false },
      { id: 3, text: "Analizar pre-market price action", detail: "", completed: false },
      { id: 4, text: "Confirmar noticias de Tesla", detail: "Ninguna", completed: false }
    ];
  });

  const [streak, setStreak] = useState(() => {
    return Number(localStorage.getItem('tv_streak')) || 0;
  });

  const [isPerfectDay, setIsPerfectDay] = useState(false);
  const [sesionConfirmada, setSesionConfirmada] = useState(() => {
    // Guardamos si ya confirmó hoy para que no sume racha infinitamente
    const lastConfirm = localStorage.getItem('tv_last_confirm');
    const today = new Date().toLocaleDateString();
    return lastConfirm === today;
  });

  // 2. Guardar automáticamente cuando algo cambie
  useEffect(() => {
    localStorage.setItem('tv_tasks', JSON.stringify(tasks));
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    setIsPerfectDay(allDone);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tv_streak', streak);
  }, [streak]);

  // 3. Funciones de lógica
  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateText = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), text: "Nuevo objetivo...", detail: "", completed: false }]);
    setSesionConfirmada(false);
  };

  const deselectAll = () => {
    setTasks(tasks.map(t => ({ ...t, completed: false })));
    setSesionConfirmada(false);
  };

  const deleteAll = () => {
    if (tasks.length === 0) return;
    setTasks([]);
    setSesionConfirmada(false);
  };

  const confirmarRacha = () => {
    if (isPerfectDay && !sesionConfirmada) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSesionConfirmada(true);
      localStorage.setItem('tv_last_confirm', new Date().toLocaleDateString());
    }
  };

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER & STREAK WIDGET */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              TRADE<span className="text-[#e31937]">VAULT</span> <span className="text-zinc-600">Ritual</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">La disciplina paga, la emoción cuesta dinero.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-700 ${isPerfectDay ? 'bg-[#00c853]/10 border-[#00c853]/50 shadow-[0_0_20px_rgba(0,200,83,0.15)]' : 'bg-[#111] border-[#222]'}`}>
              <span className={`text-3xl transition-transform ${isPerfectDay ? 'scale-125 animate-bounce' : 'grayscale opacity-30'}`}>🔥</span>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Racha Actual</p>
                <p className="text-2xl font-black leading-none">{streak} DÍAS</p>
              </div>
            </div>
          </div>
        </div>

        {/* CARDS DE ESTADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Fecha de Sesión</p>
            <p className="text-lg font-semibold capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Progreso Total</p>
              <p className="text-lg font-semibold">{tasks.filter(t => t.completed).length} de {tasks.length} tareas</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#333] flex items-center justify-center relative">
               <span className="text-xs font-bold">{Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-[#222] flex justify-between items-center bg-[#1a1a1a]/40">
            <h3 className="font-bold text-xl">Checklist Pre-Market</h3>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={deselectAll}
                className="text-[10px] font-bold bg-[#333] hover:bg-[#444] text-zinc-300 px-3 py-2 rounded-xl transition-all active:scale-95"
              >
                ✖ DESELECCIONAR TODO
              </button>
              <button
                onClick={deleteAll}
                className="text-[10px] font-bold bg-[#e31937] hover:bg-[#c41530] text-white px-3 py-2 rounded-xl transition-all active:scale-95"
              >
                🗑 BORRAR TODO
              </button>
              <button
                onClick={addTask}
                className="text-[10px] font-bold bg-[#e31937] hover:bg-[#c41530] text-white px-3 py-2 rounded-xl transition-all shadow-lg active:scale-95"
              >
                + AÑADIR OBJETIVO
              </button>
            </div>
          </div>

          <div className="p-8 space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-[#0a0a0a] border-[#00c853]/30' : 'bg-[#0a0a0a] border-[#222] hover:border-[#333]'}`}
              >
                <div className="flex items-center gap-4 flex-1 w-full">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-6 h-6 accent-[#00c853] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateText(task.id, 'text', e.target.value)}
                    className={`bg-transparent border-none outline-none text-sm font-medium flex-1 ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}
                  />
                </div>

                <input
                  type="text"
                  value={task.detail}
                  onChange={(e) => updateText(task.id, 'detail', e.target.value)}
                  placeholder="Escribe nivel..."
                  className="bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-xs text-[#00d4ff] font-mono outline-none focus:border-[#00d4ff] w-full md:w-48 text-right"
                />
              </div>
            ))}

            {/* BOTÓN DINÁMICO */}
            <button
              onClick={confirmarRacha}
              disabled={!isPerfectDay || sesionConfirmada}
              className={`w-full py-5 rounded-2xl font-black text-sm transition-all duration-500 shadow-xl mt-6 border-b-4 ${
                sesionConfirmada
                  ? 'bg-zinc-800 border-zinc-900 text-zinc-500 cursor-default'
                  : isPerfectDay
                    ? 'bg-[#00c853] border-[#00a344] text-black hover:scale-[1.01] active:translate-y-1 active:border-b-0'
                    : 'bg-[#e31937] border-[#b3142c] text-white opacity-40 cursor-not-allowed'
              }`}
            >
              {sesionConfirmada
                ? 'MAÑANA MÁS. ¡BUENA SESIÓN! ✓'
                : isPerfectDay
                  ? 'CONFIRMAR DÍA PERFECTO Y SUBIR RACHA 🚀'
                  : 'MARCA TODOS LOS PUNTOS PARA SUBIR RACHA'}
            </button>
          </div>
        </div>

        {/* NOTA DINÁMICA */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-600 italic">
            * Los datos se guardan automáticamente en tu navegador.
          </p>
        </div>
      </div>
    </main>
  );
};

export default TradeVaultChecklistFinal;
