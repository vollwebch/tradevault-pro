'use client';
import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Save } from 'lucide-react';

const DynamicChecklist = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Soporte clave en Pre-market", detail: "Ej: 245.50", completed: false },
    { id: 2, text: "Resistencia principal", detail: "Ej: 252.10", completed: false },
    { id: 3, text: "Sentimiento SPY (Bull/Bear)", detail: "", completed: false }
  ]);

  const [streak, setStreak] = useState(5);

  const addTask = () => {
    const newTask = { id: Date.now(), text: "Nueva tarea...", detail: "", completed: false };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateTask = (id: number, field: string, value: string | boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold italic tracking-tighter">PRE-MARKET <span className="text-[#e31937]">RITUAL</span></h1>
          <p className="text-zinc-500 text-sm">Define tus niveles y confirma tu plan</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111] border border-[#222] px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Progreso</p>
            <p className="text-lg font-mono">{completedCount}/{tasks.length}</p>
          </div>
          <div className="bg-[#111] border border-[#222] px-4 py-2 rounded-xl text-center text-[#f59e0b]">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Racha</p>
            <p className="text-lg font-mono">{streak}</p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE TAREAS */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#1a1a1a]/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Items de Verificacion</h2>
          <button
            onClick={addTask}
            className="flex items-center gap-2 bg-[#e31937] hover:bg-[#c41530] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
          >
            <Plus size={14} /> ANADIR PASO
          </button>
        </div>

        <div className="p-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex flex-col md:flex-row gap-3 p-3 rounded-xl border transition-all ${
                task.completed ? 'bg-[#00c853]/5 border-[#00c853]/20' : 'bg-[#0a0a0a] border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => updateTask(task.id, 'completed', e.target.checked)}
                  className="w-5 h-5 accent-[#00c853] cursor-pointer"
                />
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateTask(task.id, 'text', e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm w-full font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}
                  placeholder="Titulo de la tarea..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={task.detail}
                  onChange={(e) => updateTask(task.id, 'detail', e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-1 text-xs text-[#00d4ff] focus:border-[#00d4ff] outline-none md:w-48"
                  placeholder="Valor o nota..."
                />
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-zinc-600 hover:text-[#e31937] transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-10 text-zinc-600">
              <p>No hay tareas. Anade una para empezar tu ritual.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1a1a1a]/30 border-t border-[#222] flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setStreak(s => s + 1)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> GUARDAR RUTINA
          </button>
          <button
            onClick={() => {
              if(window.confirm("Restablecer checklist?")) {
                setTasks([
                  { id: Date.now(), text: "Verificar Soporte de Pre-market", detail: "", completed: false },
                  { id: Date.now()+1, text: "Verificar Resistencia de Pre-market", detail: "", completed: false },
                  { id: Date.now()+2, text: "Plan de Trade (Escenario A y B)", detail: "", completed: false }
                ]);
                setStreak(0);
              }
            }}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> EJEMPLO / RESET
          </button>
        </div>
      </div>

      {/* NOTA EDUCATIVA */}
      <div className="bg-[#e31937]/5 border border-[#e31937]/20 p-4 rounded-xl">
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          <span className="text-[#e31937] font-bold">PRO TIP:</span> Un trader sin plan es un trader sin capital. Escribe tus niveles exactos en los cuadros azules antes de que suene la campana. Si el precio no llega a tu nivel, <span className="text-white">no hay trade</span>.
        </p>
      </div>
    </div>
  );
};

export default DynamicChecklist;
