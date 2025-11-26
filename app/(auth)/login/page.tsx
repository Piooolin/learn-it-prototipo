'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        setLoading(false)
        return
      }

      // Hacer login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Redirigir a tutores
        window.location.href = '/tutors'
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos')
      } else {
        setError(err.message || 'Error al iniciar sesión')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo y título */}
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/images/logo.png" 
                alt="Learn It Logo"
                className="w-12 h-12 object-contain bg-white p-1 rounded-lg shadow-sm"
              />
              <span className="text-2xl font-bold" style={{ color: '#1c2444' }}>Learn It</span>
            </Link>
            <h2 className="text-center text-3xl font-bold mb-2" style={{ color: '#1c2444' }}>
              Iniciar sesión
            </h2>
            <p className="text-center text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#ec6c0c' }}>
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1c2444' }}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="tu@ejemplo.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#1c2444' }}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Tu contraseña"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="border-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', borderColor: '#f04828', color: '#991b1b' }}>
                {error}
              </div>
            )}

            {/* Botón de submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                style={{ backgroundColor: '#ec6c0c' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>

            {/* Link a inicio */}
            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
