'use client'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, BookOpen, BarChart3, GraduationCap, Calculator, ClipboardCheck,
  Brain, Timer, Target, Gamepad2, CalendarDays, Grid3X3, BookMarked, FileText,
  Wallet, User, ArrowRight, Zap, TrendingUp, Shield, Award, ChevronDown, Star,
  CheckCircle2, Menu, X, Play, Flame, Trophy
} from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: <LayoutDashboard size={24} />, title: 'Dashboard', desc: 'Vista general de tu rendimiento en tiempo real', color: '#e31937' },
  { icon: <BookOpen size={24} />, title: 'Bitácora', desc: 'Registra y analiza cada trade con detalle', color: '#00d4ff' },
  { icon: <BarChart3 size={24} />, title: 'Analytics', desc: 'Gráficos avanzados de P&L, win rate y más', color: '#00c853' },
  { icon: <GraduationCap size={24} />, title: '15 Cursos', desc: 'De principiante a avanzado en scalping TSLA', color: '#a855f7' },
  { icon: <Calculator size={24} />, title: 'Calculadora', desc: 'Position size y gestión de riesgo precisa', color: '#f59e0b' },
  { icon: <ClipboardCheck size={24} />, title: 'Checklist', desc: 'Pre-market checklist para sesiones perfectas', color: '#ff6b00' },
  { icon: <Brain size={24} />, title: 'Psicología', desc: 'Control emocional y journaling mental', color: '#14b8a6' },
  { icon: <Timer size={24} />, title: 'Temporizador', desc: 'Sesión timer y Pomodoro para trading', color: '#06b6d4' },
  { icon: <Target size={24} />, title: 'Objetivos', desc: 'Define y sigue metas de trading claras', color: '#ef4444' },
  { icon: <Gamepad2 size={24} />, title: 'Simulador', desc: 'Practica sin riesgo con trades simulados', color: '#10b981' },
  { icon: <CalendarDays size={24} />, title: 'Calendario', desc: 'Eventos clave: Earnings, FOMC, CPI, NFP', color: '#f97316' },
  { icon: <Grid3X3 size={24} />, title: 'Heatmap', desc: 'Visualiza tu mejor horario y día de trading', color: '#e31937' },
  { icon: <BookMarked size={24} />, title: 'Playbook', desc: '5 estrategias profesionales paso a paso', color: '#00d4ff' },
  { icon: <FileText size={24} />, title: 'Review Diario', desc: 'Revisión estructurada de cada sesión', color: '#a855f7' },
  { icon: <Wallet size={24} />, title: 'Capital', desc: 'Gestión completa de tu cuenta de trading', color: '#f59e0b' },
  { icon: <User size={24} />, title: 'Perfil', desc: 'Personaliza tu experiencia de trading', color: '#14b8a6' },
]

const STATS = [
  { value: '15', label: 'Módulos de Curso', icon: <GraduationCap size={20} /> },
  { value: '5', label: 'Estrategias Pro', icon: <Trophy size={20} /> },
  { value: '25', label: 'Preguntas de Examen', icon: <Brain size={20} /> },
  { value: '50+', label: 'Eventos del Calendario', icon: <CalendarDays size={20} /> },
]

const TESTIMONIALS = [
  { name: 'Carlos M.', role: 'Prop Trader - 2 años', text: 'TradeVault Pro me ayudó a pasar de 42% a 64% de win rate en 3 meses. El curso de TSLA es oro puro.', rating: 5 },
  { name: 'María L.', role: 'Scalper Day Trader', text: 'La combinación de checklist, psychology tracker y review diario es exactamente lo que necesitaba para ser consistente.', rating: 5 },
  { name: 'Andrés R.', role: 'Prop Trader - 1 año', text: 'Los setups del playbook son increíblemente detallados. VWAP Bounce ahora es mi setup principal con 67% WR.', rating: 5 },
]

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0D1117' }}>
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0D1117]/95 backdrop-blur-md border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ background: '#e31937' }}>T</div>
              <span className="font-bold text-lg text-white">TradeVault <span style={{ color: '#00d4ff' }}>Pro</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Características</a>
              <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">Plataforma</a>
              <a href="#testimonials" className="text-sm text-zinc-400 hover:text-white transition-colors">Testimonios</a>
              <Link href="/dashboard">
                <Button className="text-sm font-medium px-5 py-2 rounded-lg text-white" style={{ background: '#e31937' }} onMouseEnter={e => e.currentTarget.style.background = '#c41530'} onMouseLeave={e => e.currentTarget.style.background = '#e31937'}>
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/dashboard#register">
                <Button variant="outline" className="text-sm font-medium px-5 py-2 rounded-lg border-white/10 text-white hover:bg-white/5">
                  Registrarse
                </Button>
              </Link>
            </div>
            <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-[#161b22] border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-zinc-400 hover:text-white" onClick={() => setMobileMenu(false)}>Características</a>
            <a href="#stats" className="block text-sm text-zinc-400 hover:text-white" onClick={() => setMobileMenu(false)}>Plataforma</a>
            <a href="#testimonials" className="block text-sm text-zinc-400 hover:text-white" onClick={() => setMobileMenu(false)}>Testimonios</a>
            <div className="flex gap-2 pt-2">
              <Link href="/dashboard" className="flex-1"><Button className="w-full text-white" style={{ background: '#e31937' }}>Iniciar Sesión</Button></Link>
              <Link href="/dashboard#register" className="flex-1"><Button variant="outline" className="w-full border-white/10 text-white">Registrarse</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#e31937' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#00d4ff' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-400 mb-8" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <Zap size={14} style={{ color: '#00d4ff' }} />
            <span>Plataforma diseñada para <span style={{ color: '#e31937' }}>prop traders</span> de TSLA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6" style={{ animation: 'fadeInUp 0.8s ease-out 0.1s both' }}>
            Domina el{' '}
            <span className="relative">
              <span style={{ color: '#e31937' }}>Scalping</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M1 5.5C47 2 153 2 199 5.5" stroke="#e31937" strokeWidth="2" strokeLinecap="round" opacity="0.4" /></svg>
            </span>
            <br />
            en{' '}
            <span style={{ color: '#00d4ff' }}>Tesla</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
            16 herramientas profesionales en una plataforma. Cursos, analytics, journaling, simulador y más. Todo lo que necesitas para ser un trader consistente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
            <Link href="/dashboard">
              <Button size="lg" className="text-base font-semibold px-8 py-3 rounded-xl text-white shadow-lg shadow-[#e31937]/25 hover:shadow-[#e31937]/40 transition-all" style={{ background: '#e31937' }} onMouseEnter={e => e.currentTarget.style.background = '#c41530'} onMouseLeave={e => e.currentTarget.style.background = '#e31937'}>
                Iniciar Sesión <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-base font-semibold px-8 py-3 rounded-xl border-white/15 text-white hover:bg-white/5 flex items-center gap-2">
                <Play size={18} /> Ver Plataforma
              </Button>
            </a>
          </div>

          {/* Hero visual - Trading interface mockup */}
          <div className="relative max-w-4xl mx-auto" style={{ animation: 'fadeInUp 1s ease-out 0.4s both' }}>
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50" style={{ background: '#161b22' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-[#e31937]/60" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
                <div className="w-3 h-3 rounded-full bg-[#00c853]/60" />
                <span className="text-xs text-zinc-500 ml-2 font-mono">tradevault-pro.app/dashboard</span>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'P&L Total', value: '+$2,847.50', color: '#00c853' },
                  { label: 'Win Rate', value: '64.2%', color: '#00d4ff' },
                  { label: 'Trades Hoy', value: '5', color: '#ffffff' },
                  { label: 'Profit Factor', value: '2.1', color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-3 sm:p-4" style={{ background: '#0D1117' }}>
                    <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wide">{s.label}</p>
                    <p className="text-lg sm:text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="rounded-xl p-4" style={{ background: '#0D1117' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
                    <span className="text-xs text-zinc-500">Curva de Equity</span>
                  </div>
                  <div className="h-20 sm:h-32 flex items-end gap-[2px]">
                    {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95, 88, 100, 92, 105, 98, 110, 102, 115, 108, 120, 112, 125, 118, 130, 122, 135, 128, 140].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-all duration-500" style={{ height: `${h}%`, background: i >= 28 ? '#00c853' : i >= 15 ? '#00d4ff' : '#333', opacity: 0.6 + (h / 200) }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect under the card */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-3xl" style={{ background: 'linear-gradient(90deg, #e31937, #00d4ff)', opacity: 0.1 }} />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-transform group-hover:scale-110" style={{ background: `${i % 2 === 0 ? '#e31937' : '#00d4ff'}15` }}>
                  <span style={{ color: i % 2 === 0 ? '#e31937' : '#00d4ff' }}>{s.icon}</span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 border-white/10 bg-white/5 text-zinc-300 text-xs px-3 py-1">16 HERRAMIENTAS INTEGRADAS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para <span style={{ color: '#e31937' }}>dominar</span> el trading
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Una plataforma completa diseñada específicamente para traders de Tesla que quieren llevar su juego al siguiente nivel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
                style={{ background: '#161b22' }}
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: `${f.color}15` }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSE HIGHLIGHT ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 border-white/10 bg-white/5 text-zinc-300 text-xs px-3 py-1">CURSO COMPLETO</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                15 Módulos de{' '}
                <span style={{ color: '#e31937' }}>Scalping TSLA</span>
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Desde los fundamentos de Tesla como instrumento de trading hasta estrategias avanzadas de short selling. Cada módulo incluye ejemplos reales, setups probados y exámenes de validación.
              </p>
              <div className="space-y-3">
                {[
                  'Indicadores optimizados para TSLA en 1-min',
                  '5 setups profesionales con win rates verificados',
                  'Gestión de riesgo paso a paso',
                  'Psicología del trader y control emocional',
                  'Examen final de 25 preguntas',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={16} style={{ color: '#00c853' }} />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 p-6 space-y-3" style={{ background: '#161b22' }}>
              <div className="text-center pb-3 border-b border-white/5">
                <p className="text-2xl font-bold text-white">Tu Progreso</p>
                <p className="text-xs text-zinc-500 mt-1">15 módulos • 25 preguntas</p>
              </div>
              {[
                { name: 'Tesla como Instrumento', progress: 100, icon: '⚡' },
                { name: 'Historial de Precios', progress: 100, icon: '📊' },
                { name: 'Indicadores Optimizados', progress: 75, icon: '🎯' },
                { name: 'Setups de Scalping', progress: 40, icon: '🔥' },
                { name: 'Gestión de Riesgo', progress: 0, icon: '🛡️' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#0D1117' }}>
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-300 truncate">{m.name}</p>
                    <div className="w-full h-1.5 rounded-full mt-1.5" style={{ background: '#21262d' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${m.progress}%`, background: m.progress === 100 ? '#00c853' : m.progress > 0 ? '#00d4ff' : '#333' }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">{m.progress}%</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex items-center gap-2 justify-center text-sm">
                  <Star size={16} style={{ color: '#f59e0b' }} />
                  <span className="text-zinc-400">Examen: </span>
                  <span className="font-bold text-white">20/25</span>
                  <span className="text-zinc-500">• 80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 border-white/10 bg-white/5 text-zinc-300 text-xs px-3 py-1">TESTIMONIOS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Lo que dicen nuestros <span style={{ color: '#00d4ff' }}>traders</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Cientos de traders ya están usando TradeVault Pro para mejorar su consistencia y rentabilidad.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-xl p-6 border border-white/5 transition-all hover:border-white/10" style={{ background: '#161b22' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: i === 0 ? '#e31937' : i === 1 ? '#00d4ff' : '#a855f7' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #e31937, #00d4ff)' }} />
          <div className="relative rounded-3xl border border-white/10 p-8 sm:p-12 text-center" style={{ background: '#161b22' }}>
            <Flame size={40} className="mx-auto mb-4" style={{ color: '#e31937' }} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para ser un trader <span style={{ color: '#e31937' }}>consistente</span>?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">
              Únete a cientos de traders que ya usan TradeVault Pro para mejorar su rendimiento. Regístrate gratis y comienza hoy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard#register">
                <Button size="lg" className="text-base font-semibold px-8 py-3 rounded-xl text-white shadow-lg shadow-[#e31937]/25" style={{ background: '#e31937' }}>
                  Crear Cuenta Gratis <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-base font-semibold px-8 py-3 rounded-xl border-white/15 text-white hover:bg-white/5">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
            <p className="text-xs text-zinc-600 mt-6">Sin tarjeta de crédito requerida • Acceso inmediato • Soporte 24/7</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#e31937' }}>T</div>
                <span className="font-bold text-white">TradeVault Pro</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Plataforma profesional de trading para scalpers de TSLA. Diseñada por traders, para traders.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-xs text-zinc-500 hover:text-white transition-colors">Características</a></li>
                <li><a href="#stats" className="text-xs text-zinc-500 hover:text-white transition-colors">Métricas</a></li>
                <li><a href="#testimonials" className="text-xs text-zinc-500 hover:text-white transition-colors">Testimonios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Herramientas</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-zinc-500">Dashboard</span></li>
                <li><span className="text-xs text-zinc-500">Analytics</span></li>
                <li><span className="text-xs text-zinc-500">Simulador</span></li>
                <li><span className="text-xs text-zinc-500">Playbook</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-zinc-500">Términos de Uso</span></li>
                <li><span className="text-xs text-zinc-500">Privacidad</span></li>
                <li><span className="text-xs text-zinc-500">Disclaimer</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">© 2025 TradeVault Pro. Todos los derechos reservados.</p>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <Shield size={12} />
              <span>Hecho con pasión para traders</span>
              <span style={{ color: '#e31937' }}>♥</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── ANIMATIONS ─── */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
