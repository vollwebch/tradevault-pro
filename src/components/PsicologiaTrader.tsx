import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, Minus, Save, History, PlusCircle } from 'lucide-react';

const PsicologiaTrader = () => {
  // --- ESTADOS ---
  const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem('tv_psico_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, fecha: "24 abr 2026", pre: 6, post: 5, conf: 5, disc: 5, calidad: "Normal", notas: "Sesión tranquila." }
    ];
  });

  const [preEmocion, setPreEmocion] = useState(5);
  const [postEmocion, setPostEmocion] = useState(5);
  const [confianza, setConfianza] = useState(5);
  const [disciplina, setDisciplina] = useState(5);
  const [calidad, setCalidad] = useState("Normal");
  const [notas, setNotas] = useState("");

  // --- CÁLCULOS DE DASHBOARD ---
  const mediaPre = registros.length > 0 ? (registros.reduce((acc, curr) => acc + curr.pre, 0) / registros.length).toFixed(1) : "0.0";
  const mediaPost = registros.length > 0 ? (registros.reduce((acc, curr) => acc + curr.post, 0) / registros.length).toFixed(1) : "0.0";
  
  const getEmoji = (val) => {
    const n = Number(val);
    if (n >= 8) return "😎";
    if (n >= 6) return "😐";
    if (n >= 4) return "😕";
    return "😤";
  };

  const getTendencia = () => {
    if (registros.length < 2) return <Minus className="mx-auto" />;
    const ultimo = registros[registros.length - 1].post;
    const penultimo = registros[registros.length - 2].post;
    if (ultimo > penultimo) return <TrendingUp className="mx-auto text-[#00c853]" />;
    if (ultimo < penultimo) return <TrendingDown className="mx-auto text-[#e31937]" />;
    return <Minus className="mx-auto text-zinc-500" />;
  };

  // --- GUARDAR REGISTRO ---
  const guardarRegistro = () => {
    const nuevo = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      pre: preEmocion,
      post: postEmocion,
      conf: confianza,
      disc: disciplina,
      calidad: calidad,
      notas: notas
    };
    const nuevosRegistros = [nuevo, ...registros];
    setRegistros(nuevosRegistros);
    localStorage.setItem('tv_psico_logs', JSON.stringify(nuevosRegistros));
    // Reset inputs
    setNotas("");
  };

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0a] text-white p-4 md:p-6 font-sans">
      <header className="mb-8 flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
         <Brain className="text-[#e31937]" size={28} />
         <div>
            <h1 className="text-2xl font-bold tracking-tighter">PSICOLOGÍA DEL TRADER</h1>
            <p className="text-zinc-500 text-sm">Rastrea tu estado mental y emocional</p>
         </div>
      </header>

      <div className="space-y-6">
        {/* DASHBOARD DE MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Media Pre</p>
            <p className="text-2xl font-bold text-[#f59e0b]">{mediaPre}</p>
            <p className="text-xl mt-1">{getEmoji(mediaPre)}</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Media Post</p>
            <p className="text-2xl font-bold text-[#00d4ff]">{mediaPost}</p>
            <p className="text-xl mt-1">{getEmoji(mediaPost)}</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Registros</p>
            <p className="text-2xl font-bold text-white">{registros.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-widest">Total Logs</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Tendencia</p>
            <div className="text-2xl my-1">{getTendencia()}</div>
            <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-widest">Estado Mental</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORMULARIO DE REGISTRO */}
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <PlusCircle size={20} className="text-[#e31937]" /> Nuevo Registro
            </h3>
            
            <div className="space-y-4">
              {/* SLIDERS PERSONALIZADOS */}
              {[
                { label: `Pre-sesión Emocion`, val: preEmocion, set: setPreEmocion, color: "bg-[#f59e0b]" },
                { label: `Post-sesión Emocion`, val: postEmocion, set: setPostEmocion, color: "bg-[#00d4ff]" },
                { label: `Confianza`, val: confianza, set: setConfianza, color: "bg-white" },
                { label: `Disciplina`, val: disciplina, set: setDisciplina, color: "bg-[#e31937]" }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs text-zinc-400 mb-2 uppercase font-bold">
                    <span>{item.label} ({getEmoji(item.val)})</span>
                    <span className="text-white">{item.val}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={item.val} 
                    onChange={(e) => item.set(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#e31937]"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase block mb-2">Calidad de Sesión</label>
                <select 
                  value={calidad} 
                  onChange={(e) => setCalidad(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-2.5 text-sm outline-none focus:border-[#e31937]"
                >
                  <option>A++ (Perfecta)</option>
                  <option>Normal</option>
                  <option>Bajo Rendimiento</option>
                  <option>Reancha (Revenge Trading)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase block mb-2">Notas / Reflexiones</label>
                <textarea 
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm min-h-[100px] outline-none focus:border-[#e31937] resize-none"
                  placeholder="¿Cómo te sentiste hoy? ¿Qué aprendiste?"
                />
              </div>

              <button 
                onClick={guardarRegistro}
                className="w-full bg-[#e31937] hover:bg-[#c41530] text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Save size={18} /> GUARDAR REGISTRO PSICOLÓGICO
              </button>
            </div>
          </div>

          {/* HISTORIAL DE REGISTROS */}
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 space-y-6">
             <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-400">
               <History size={20} /> Registros Recientes
             </h3>
             <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {registros.map((reg) => (
                  <div key={reg.id} className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#222] space-y-3 hover:border-[#333] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{reg.fecha}</span>
                      <span className="text-[10px] bg-[#e31937]/10 text-[#e31937] px-2 py-1 rounded font-bold uppercase border border-[#e31937]/20">
                        {reg.calidad}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase">
                             <span>Pre/Post</span>
                             <span>{reg.pre} | {reg.post}</span>
                          </div>
                          <div className="flex w-full h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
                             <div className="bg-[#f59e0b] h-full" style={{ width: `${reg.pre * 10}%` }}></div>
                             <div className="bg-[#00d4ff] h-full" style={{ width: `${reg.post * 10}%` }}></div>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <div className="text-center">
                             <p className="text-[8px] text-zinc-600 uppercase font-black">Conf</p>
                             <p className="text-xs font-bold text-white">{reg.conf}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[8px] text-zinc-600 uppercase font-black">Disc</p>
                             <p className="text-xs font-bold text-white">{reg.disc}</p>
                          </div>
                       </div>
                    </div>
                    
                    {reg.notas && (
                      <p className="text-[11px] text-zinc-400 italic bg-[#111] p-2 rounded-lg border border-[#222]">
                        &ldquo;{reg.notas}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PsicologiaTrader;
