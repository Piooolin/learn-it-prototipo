'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [roleFromUrl, setRoleFromUrl] = useState('student')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roleParam = urlParams.get('role')
    if (roleParam === 'tutor' || roleParam === 'student') {
      setRoleFromUrl(roleParam)
      setRole(roleParam)
    }
  }, [])


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'tutor'>(roleFromUrl as 'student' | 'tutor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password || !fullName) {
        setError('Por favor completa todos los campos')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setLoading(false)
        return
      }

      // Crear usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Crear perfil
        await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
            verified: false,
          },
        ])

        // Si es tutor, crear en tabla tutors
        if (role === 'tutor') {
          await supabase.from('tutors').insert([
            {
              id: authData.user.id,
              hourly_rate: 50.0,
              specializations: [],
              is_active: false,
            },
          ])
        }

        // Login automático
        await supabase.auth.signInWithPassword({ email, password })

        // Mostrar mensaje de éxito
        alert('¡Cuenta creada exitosamente!')
        
        // Ir a la landing page
        window.location.href = '/tutors'
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al crear la cuenta')
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
              Crear una cuenta
            </h2>
            <p className="text-center text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#ec6c0c' }}>
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSignup}>
            {/* Selector de rol */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                Registro como:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    role === 'student'
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={role === 'student' ? { backgroundColor: '#ec6c0c' } : { color: '#374151' }}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tutor')}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    role === 'tutor'
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={role === 'tutor' ? { backgroundColor: '#ec6c0c' } : { color: '#374151' }}
                >
                  Tutor
                </button>
              </div>
            </div>

            {/* Nombre completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-2" style={{ color: '#1c2444' }}>
                Nombre completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Juan Pérez"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
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
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
