'use client'

import Link from 'next/link'
import { Users, Clock, TrendingUp, CheckCircle, Star, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                LI
              </div>
              <span className="font-bold text-xl text-gray-900">Learn It</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Registrarse Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Conecta con los mejores<br />tutores universitarios
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Learn It facilita la conexión entre estudiantes y tutores académicos expertos. 
            Asesorías personalizadas, pagos seguros y disponibilidad flexible.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup?role=student"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Soy Estudiante
            </Link>
            <Link
              href="/signup?role=tutor"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg rounded-lg hover:border-gray-400 font-semibold transition-colors"
            >
              Soy Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            ¿Por qué Learn It?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Tutores Verificados',
                desc: 'Todos nuestros tutores son estudiantes o docentes universitarios verificados.',
              },
              {
                icon: Clock,
                title: 'Disponibilidad Flexible',
                desc: 'Programa tus sesiones según tu horario y disponibilidad.',
              },
              {
                icon: TrendingUp,
                title: 'Mejora Comprobada',
                desc: 'Mejoras significativas en calificaciones académicas.',
              },
              {
                icon: CheckCircle,
                title: 'Pagos Seguros',
                desc: 'Transacciones 100% seguras con Culqi.',
              },
              {
                icon: Star,
                title: 'Reseñas Verificadas',
                desc: 'Lee opiniones reales de otros estudiantes.',
              },
              {
                icon: Shield,
                title: 'Soporte 24/7',
                desc: 'Estamos disponibles para ayudarte cuando lo necesites.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8">
            Únete a cientos de estudiantes que ya mejoraron con Learn It
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 font-semibold transition-colors"
          >
            Registrarse Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              LI
            </div>
            <span className="font-bold text-lg">Learn It</span>
          </div>
          <p className="text-gray-400">&copy; 2025 Learn It. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
