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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tutor no encontrado</p>
          <Link href="/tutors" className="text-blue-600 hover:text-blue-700">
            Volver a la lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                LI
              </div>
              <span className="font-bold text-xl text-gray-900">Learn It</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/tutors"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Buscar tutores
                  </Link>
                  <Link
                    href="/my-sessions"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Mis sesiones
                  </Link>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
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
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>

        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {tutor.profiles?.full_name.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tutor.profiles?.full_name || 'Sin nombre'}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {tutor.profiles?.university || 'Sin universidad'}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{tutor.rating}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{tutor.total_sessions} sesiones completadas</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-2">
                <DollarSign className="w-6 h-6 text-gray-600" />
                <span className="text-3xl font-bold text-gray-900">{tutor.hourly_rate}</span>
                <span className="text-gray-600">/hora</span>
              </div>
              <button
                onClick={handleBookSession}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Agendar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {tutor.specializations.map((spec, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acerca de mí</h2>
          <p className="text-gray-700 leading-relaxed">{tutor.description}</p>
        </div>

        {/* Idiomas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <Languages className="w-5 h-5 inline mr-2" />
            Idiomas
          </h2>
          <div className="flex gap-3">
            {tutor.languages.map((lang, index) => (
              <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
