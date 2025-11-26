'use client'

import Link from 'next/link'
import { Users, Clock, TrendingUp, CheckCircle, Star, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(28, 36, 68, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/images/logo.png" 
                alt="Learn It Logo"
                className="w-12 h-12 object-contain bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
              />
              <span className="text-white font-bold text-xl tracking-tight">Learn It</span>
            </Link>
            <div className="flex gap-3">
              <Link 
                href="/login"
                className="px-5 py-2 font-medium transition-all rounded-lg hover:bg-white/10"
                style={{ color: '#d1d5db' }}
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/signup"
                className="px-6 py-2 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#ec6c0c' }}
              >
                Registrarse Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-24" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Conecta con los mejores<br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                tutores universitarios
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: '#cbd5e1' }}>
              Learn It facilita la conexión entre estudiantes y tutores académicos expertos.<br className="hidden md:block" />
              <span className="font-medium">Asesorías personalizadas, pagos seguros y disponibilidad flexible.</span>
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup?role=student"
                className="group px-10 py-4 text-white text-lg rounded-xl font-bold transition-all shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105"
                style={{ backgroundColor: '#ec6c0c' }}
              >
                <span className="flex items-center gap-2">
                  Soy Estudiante
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                href="/signup?role=tutor"
                className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg rounded-xl font-bold transition-all hover:bg-white hover:text-gray-900 transform hover:scale-105"
              >
                Soy Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" style={{ background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1c2444' }}>
              ¿Por qué Learn It?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre todas las ventajas de nuestra plataforma educativa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Tutores Verificados',
                desc: 'Todos nuestros tutores son estudiantes o docentes universitarios verificados.',
                color: '#ec6c0c'
              },
              {
                icon: Clock,
                title: 'Disponibilidad Flexible',
                desc: 'Programa tus sesiones según tu horario y disponibilidad.',
                color: '#f04828'
              },
              {
                icon: TrendingUp,
                title: 'Mejora Comprobada',
                desc: 'Mejoras significativas en calificaciones académicas.',
                color: '#ec6c0c'
              },
              {
                icon: CheckCircle,
                title: 'Pagos Seguros',
                desc: 'Transacciones 100% seguras con Culqi.',
                color: '#544828'
              },
              {
                icon: Star,
                title: 'Reseñas Verificadas',
                desc: 'Lee opiniones reales de otros estudiantes.',
                color: '#f04828'
              },
              {
                icon: Shield,
                title: 'Soporte 24/7',
                desc: 'Estamos disponibles para ayudarte cuando lo necesites.',
                color: '#ec6c0c'
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-transparent hover:-translate-y-2"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1c2444' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 text-white" style={{ background: 'linear-gradient(135deg, #ec6c0c 0%, #f04828 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95">
            Únete a cientos de estudiantes que ya mejoraron con Learn It
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-lg rounded-xl font-bold transition-all shadow-2xl hover:shadow-white/50 transform hover:scale-105"
            style={{ color: '#1c2444' }}
          >
            Registrarse Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/images/logo.png" 
                alt="Learn It Logo"
                className="w-10 h-10 object-contain bg-white p-1.5 rounded-lg"
              />
              <span className="text-white font-bold text-xl">Learn It</span>
            </div>
            <p className="text-gray-400 text-center mb-4">
              Conectando estudiantes con los mejores tutores universitarios
            </p>
            <p className="text-gray-500 text-sm">
              &copy; 2025 Learn It. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
