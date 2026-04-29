import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, Minus, Save, History, PlusCircle, Trash2, Edit2, XCircle } from 'lucide-react';

const PsicologiaTraderPro = () => {
  // --- ESTADOS ---
  const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem('tv_psico_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados del formulario
  const [preEmocion, setPreEmocion] = useState(5);
  const [postEmocion, setPostEmocion] = useState(5);
  const [confianza, setConfianza] = useState(5);
  const [disciplina, setDisciplina] = useState(5);
  const [calidad, setCalidad] = useState("Normal");
  const [notas, setNotas] = useState("");
  
  // Estado para saber si estamos editando
  const [editandoId, setEditandoId] = useState(null);

  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('tv_psico_logs', JSON.stringify(registros));
  }, [registros]);

  // --- LÓGICA DE REGISTROS ---
  const guardarRegistro = () => {
    if (editandoId) {
      // ACTUALIZAR REGISTRO EXISTENTE
      const actualizados = registros.map(reg => 
        reg.id === editandoId 
          ? { ...reg, pre: preEmocion, post: postEmocion, conf: confianza, disc: disciplina, calidad, notas }
          : reg
      );
      setRegistros(actualizados);
      setEditandoId(null);
    } else {
      // CREAR NUEVO REGISTRO
      const nuevo = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        pre: preEmocion,
        post: postEmocion,
        conf: confianza,
        disc: disciplina,
        calidad,
        notas
      };
      setRegistros([nuevo, ...registros]);
    }
    resetForm();
  };

  const eliminarRegistro = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este registro psicológico?")) {
      setRegistros(registros.filter(reg => reg.id !== id));
      if (editandoId === id) resetForm();
    }
  };

  const cargarParaEditar = (reg) => {
    setEditandoId(reg.id);
    setPreEmocion(reg.pre);
    setPostEmocion(reg.post);
    setConfianza(reg.conf);
    setDisciplina(reg.disc);
    setCalidad(reg.calidad);
    setNotas(reg.notas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditandoId(null);
    setPreEmocion(5);
    setPostEmocion(5);
    setConfianza(5);
    setDisciplina(5);
    setCalidad("Normal");
    setNotas("");
  };

  // --- CÁLCULOS ---
  const mediaPre = registros.length ? (registros.reduce((acc, curr) => acc + curr.pre, 0) / registros.length).toFixed(1) : "0.0";
  const mediaPost = registros.length ? (registros.reduce((acc, curr) => acc + curr.post, 0) / registros.length).toFixed(1) : "0.0";
  const getEmoji = (val) => val >= 8 ? "😎" : val >= 6 ? "😐" : val >= 4 ? "😕" : "😤";

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0a] text-white p-4 md:p-6 font-sans">
      <header className="mb-8 border-b border-[#1a1a1a] pb-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <Brain className="text-[#e31937]" size={28} />
            <div>
                <h1 className="text-2xl font-bold tracking-tighter uppercase">Psicología</h1>
                <p className="text-zinc-500 text-xs">Gestiona tu estado mental</p>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORMULARIO */}
        <div className={`bg-[#111] border rounded-3xl p-6 space-y-6 transition-colors ${editandoId ? 'border-[#f59e0b]/50' : 'border-[#222]'}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {editandoId ? <Edit2 className="text-[#f59e0b]" size={20} /> : <PlusCircle className="text-[#e31937]" size={20} />}
              {editandoId ? "Editando Registro" : "Nuevo Registro"}
            </h3>
            {editandoId && (
              <button onClick={resetForm} className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs font-bold">
                <XCircle size={14} /> CANCELAR
              </button>
            )}
          </div>

          <div className="space-y-5">
            {[
              { label: "Pre-sesión", val: preEmocion, set: setPreEmocion },
              { label: "Post-sesión", val: postEmocion, set: setPostEmocion },
              { label: "Confianza", val: confianza, set: setConfianza },
              { label: "Disciplina", val: disciplina, set: setDisciplina }
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase mb-2">
                  <span>{s.label} {getEmoji(s.val)}</span>
                  <span className="text-white">{s.val}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={s.val} 
                  onChange={(e) => s.set(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#e31937]"
                />
              </div>
            ))}

            <div>
              <label className="text-[10px] text-zinc-500 font-black uppercase block mb-2">Calidad</label>
              <select value={calidad} onChange={(e) => setCalidad(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm outline-none focus:border-[#e31937]">
                <option>Normal</option>
                <option>A++ (Perfecta)</option>
                <option>Rendimiento Bajo</option>
                <option>Reancha / Revenge</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 font-black uppercase block mb-2">Notas</label>
              <textarea 
                value={notas} onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm min-h-[100px] outline-none focus:border-[#e31937] resize-none"
                placeholder="¿Qué aprendiste hoy?"
              />
            </div>

            <button 
              onClick={guardarRegistro}
              className={`w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${editandoId ? 'bg-[#f59e0b] text-black hover:bg-[#d98c0a]' : 'bg-[#e31937] text-white hover:bg-[#c41530]'}`}
            >
              <Save size={18} /> {editandoId ? "ACTUALIZAR REGISTRO" : "GUARDAR REGISTRO"}
            </button>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-400"><History size={20}/> Historial</h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {registros.length === 0 && <p className="text-zinc-600 text-sm italic">No hay registros aún.</p>}
            {registros.map((reg) => (
              <div key={reg.id} className="p-4 rounded-2xl bg-[#111] border border-[#222] space-y-4 group relative hover:border-zinc-500 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{reg.fecha}</span>
                    <h4 className="text-sm font-bold text-[#e31937]">{reg.calidad}</h4>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => cargarParaEditar(reg)} className="p-2 bg-zinc-800 rounded-lg hover:text-[#f59e0b]"><Edit2 size={14}/></button>
                    <button onClick={() => eliminarRegistro(reg.id)} className="p-2 bg-zinc-800 rounded-lg hover:text-[#e31937]"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[9px] text-zinc-600 font-black uppercase">Emoción (Pre/Post)</p>
                      <div className="flex gap-1 h-1.5 rounded-full bg-[#222] overflow-hidden">
                        <div className="bg-[#f59e0b]" style={{ width: `${reg.pre * 10}%` }}></div>
                        <div className="bg-[#00d4ff]" style={{ width: `${reg.post * 10}%` }}></div>
                      </div>
                   </div>
                   <div className="flex justify-around text-center">
                      <div><p className="text-[8px] text-zinc-600 font-black uppercase">Conf</p><p className="text-xs font-bold">{reg.conf}</p></div>
                      <div><p className="text-[8px] text-zinc-600 font-black uppercase">Disc</p><p className="text-xs font-bold">{reg.disc}</p></div>
                   </div>
                </div>

                {reg.notas && <p className="text-[11px] text-zinc-400 bg-[#0a0a0a] p-3 rounded-xl border border-[#222]">"{reg.notas}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PsicologiaTraderPro;
