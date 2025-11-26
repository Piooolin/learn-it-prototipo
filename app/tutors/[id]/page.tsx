'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Star, Clock, DollarSign, ArrowLeft, Calendar, Languages } from 'lucide-react'

interface TutorProfile {
  id: string
  hourly_rate: number
  specializations: string[]
  rating: number
  total_sessions: number
  description: string
  languages: string[]
  profiles: {
    full_name: string
    university: string
  }
}

export default function TutorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const tutorId = params.id as string

  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchTutorProfile()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    }
  }

  async function fetchTutorProfile() {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select(`
          id,
          hourly_rate,
          specializations,
          rating,
          total_sessions,
          description,
          languages,
          profiles!inner (
            full_name,
            university
          )
        `)
        .eq('id', tutorId)
        .single()

      if (error) throw error

      const transformedData = {
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      }

      setTutor(transformedData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tutor:', error)
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function handleBookSession() {
    if (!user) {
      router.push('/login')
      return
    }
    router.push(`/booking/${tutorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ec6c0c' }}></div>
          <p className="text-white font-medium">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-600 mb-6 text-lg">Tutor no encontrado</p>
          <Link href="/tutors" className="px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl inline-block" style={{ backgroundColor: '#ec6c0c' }}>
            Volver a la lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/tutors"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Buscar tutores
                  </Link>
                  <Link
                    href="/my-sessions"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Mis sesiones
                  </Link>
                  <span className="text-sm text-gray-400">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:bg-red-600"
                    style={{ backgroundColor: '#f04828' }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    Iniciar sesión
                  </Link>
                  <Link href="/signup" className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-xl" style={{ backgroundColor: '#ec6c0c' }}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Botón volver */}
        <Link
          href="/tutors"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-white px-4 py-2 rounded-lg transition-all mb-8 font-medium hover:shadow-lg"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ec6c0c'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#4b5563'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>

        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #ec6c0c 0%, #f04828 100%)' }}>
              {tutor.profiles?.full_name.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#1c2444' }}>
                {tutor.profiles?.full_name || 'Sin nombre'}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {tutor.profiles?.university || 'Sin universidad'}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-current" style={{ color: '#ec6c0c' }} />
                  <span className="font-bold text-xl" style={{ color: '#1c2444' }}>{tutor.rating}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{tutor.total_sessions} sesiones completadas</span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:text-right">
              <div className="flex items-center gap-1 justify-center lg:justify-end mb-4">
                <span className="text-gray-600">S/</span>
                <span className="text-4xl font-bold" style={{ color: '#1c2444' }}>{tutor.hourly_rate}</span>
                <span className="text-gray-600">/hora</span>
              </div>
              <button
                onClick={handleBookSession}
                className="w-full lg:w-auto px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#ec6c0c' }}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Agendar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-5" style={{ color: '#1c2444' }}>Especialidades</h2>
          <div className="flex flex-wrap gap-3">
            {tutor.specializations.map((spec, index) => (
              <span
                key={index}
                className="px-5 py-2 font-semibold rounded-xl shadow-sm"
                style={{ backgroundColor: '#fef3e9', color: '#ec6c0c' }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-5" style={{ color: '#1c2444' }}>Acerca de mí</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{tutor.description}</p>
        </div>

        {/* Idiomas */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-5" style={{ color: '#1c2444' }}>
            <Languages className="w-6 h-6 inline mr-2" style={{ color: '#ec6c0c' }} />
            Idiomas
          </h2>
          <div className="flex flex-wrap gap-3">
            {tutor.languages.map((lang, index) => (
              <span key={index} className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
