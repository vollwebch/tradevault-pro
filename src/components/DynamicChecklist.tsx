'use client';
import React, { useState } from 'react';

const ChecklistConfigurable = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Verificar soporte clave en:", detail: "245.50", completed: false },
    { id: 2, text: "Verificar resistencia clave en:", detail: "252.10", completed: false },
    { id: 3, text: "Noticias Tesla overnight", detail: "Ninguna", completed: false },
    { id: 4, text: "Sesgo del mercado (SPY)", detail: "Bullish", completed: false }
  ]);

  const [notes, setNotes] = useState('');

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), text: "Nuevo item...", detail: "", completed: false }]);
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
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()} de ${monthNames[today.getMonth()]} de ${today.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Checklist Pre-Market</h1>
          <p className="text-zinc-400 text-sm mt-1">Ritual manual: escribe tus niveles y marca tus pasos</p>
        </div>
        <button
          onClick={addTask}
          className="bg-[#e31937] hover:bg-[#c41530] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
        >
          + ANADIR ITEM
        </button>
      </div>

      {/* RESUMEN CARDS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="rounded-xl border py-5 px-6 bg-[#111] border-[#222] flex-1">
          <p className="text-xs text-zinc-500">Hoy</p>
          <p className="font-semibold capitalize text-sm">{dateStr}</p>
        </div>
        <div className="rounded-xl border py-5 px-6 bg-[#111] border-[#222] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#e31937]/15 flex items-center justify-center text-[#e31937] font-bold text-lg">
            {completedCount}
          </div>
          <div>
            <p className="text-xs text-zinc-500">Completado</p>
            <p className="text-sm">{completedCount}/{tasks.length} items</p>
          </div>
        </div>
      </div>

      {/* CHECKLIST */}
      <div className="rounded-xl border bg-[#111] border-[#222]">
        <div className="px-6 pt-5 pb-3">
          <h2 className="font-semibold text-lg">Checklist de Hoy</h2>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`group flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border transition-colors ${task.completed ? 'bg-[#00c853]/5 border-[#00c853]/20' : 'bg-[#0a0a0a] border-[#222] hover:border-[#333]'}`}>
              <div className="flex items-center gap-3 flex-1 w-full">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="accent-[#e31937] w-5 h-5 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateText(task.id, 'text', e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm flex-1 ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300 focus:text-white'}`}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={task.detail}
                  onChange={(e) => updateText(task.id, 'detail', e.target.value)}
                  placeholder="Escribe nivel..."
                  className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-1 text-xs text-[#f59e0b] font-mono outline-none focus:border-[#f59e0b] w-full sm:w-32"
                />
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-zinc-600 hover:text-[#e31937] transition-colors p-1 opacity-0 sm:group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-zinc-600">
              <p>No hay items. Haz clic en "Anadir Item" para empezar.</p>
            </div>
          )}

          {/* NOTAS */}
          <div className="mt-6">
            <label className="text-zinc-300 text-sm font-medium block mb-1">Notas del dia</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:border-[#e31937] outline-none resize-none"
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <button className="w-full bg-[#e31937] hover:bg-[#c41530] text-white font-semibold py-2 rounded-md text-sm transition-all mt-4">
            Guardar Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistConfigurable;
