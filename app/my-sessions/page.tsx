'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Calendar, Clock, DollarSign, User, MessageSquare } from 'lucide-react'

interface Session {
  id: string
  scheduled_at: string
  duration_minutes: number
  total_price: number
  status: string
  subject: string
  notes: string | null
  tutors: {
    id: string
    profiles: {
      full_name: string
      university: string
    }
  }
}

export default function MySessionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }
    setUser(session.user)
    fetchSessions(session.user.id)
  }

  async function fetchSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          total_price,
          status,
          subject,
          notes,
          tutors!inner (
            id,
            profiles!inner (
              full_name,
              university
            )
          )
        `)
        .eq('student_id', userId)
        .order('scheduled_at', { ascending: false })

      if (error) throw error

      console.log('Sesiones cargadas:', data)
      
      // Transformar los datos para que tutors y profiles sean objetos
      const transformedData = data?.map((session: any) => ({
        ...session,
        tutors: {
          id: Array.isArray(session.tutors) ? session.tutors[0]?.id : session.tutors?.id,
          profiles: Array.isArray(session.tutors) 
            ? (Array.isArray(session.tutors[0]?.profiles) 
                ? session.tutors[0].profiles[0] 
                : session.tutors[0]?.profiles)
            : (Array.isArray(session.tutors?.profiles)
                ? session.tutors.profiles[0]
                : session.tutors?.profiles)
        }
      })) || []

      setSessions(transformedData)
      setLoading(false)

    } catch (error) {
      console.error('Error fetching sessions:', error)
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#d1fae5', color: '#065f46' }
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' }
      case 'completed':
        return { backgroundColor: '#dbeafe', color: '#1e40af' }
      case 'cancelled':
        return { backgroundColor: '#fee2e2', color: '#991b1b' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' }
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendiente'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ec6c0c' }}></div>
          <p className="text-white font-medium">Cargando sesiones...</p>
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
              <Link
                href="/tutors"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                Buscar tutores
              </Link>
              {user && (
                <>
                  <span className="text-sm text-gray-400">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:bg-red-600"
                    style={{ backgroundColor: '#f04828' }}
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#1c2444' }}>
            Mis Sesiones
          </h1>
          <p className="text-xl text-gray-600">
            Todas tus sesiones agendadas con tutores
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <Calendar className="w-20 h-20 mx-auto mb-6" style={{ color: '#ec6c0c' }} />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1c2444' }}>
              No tienes sesiones agendadas
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Busca un tutor y agenda tu primera sesión
            </p>
            <Link
              href="/tutors"
              className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#ec6c0c' }}
            >
              Buscar tutores
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #ec6c0c 0%, #f04828 100%)' }}>
                      {session.tutors.profiles.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2" style={{ color: '#1c2444' }}>
                        {session.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{session.tutors.profiles.full_name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{session.tutors.profiles.university}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-4 py-2 text-sm font-bold rounded-xl shadow-sm whitespace-nowrap"
                    style={getStatusColor(session.status)}
                  >
                    {getStatusText(session.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    <Calendar className="w-5 h-5" style={{ color: '#ec6c0c' }} />
                    <span className="font-medium">{formatDate(session.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    <Clock className="w-5 h-5" style={{ color: '#ec6c0c' }} />
                    <span className="font-medium">
                      {formatTime(session.scheduled_at)} ({session.duration_minutes} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                    <DollarSign className="w-5 h-5" style={{ color: '#ec6c0c' }} />
                    <span className="font-bold" style={{ color: '#1c2444' }}>S/ {session.total_price}</span>
                  </div>
                </div>

                {session.notes && (
                  <div className="rounded-xl p-4 mb-5 border-2" style={{ backgroundColor: '#fef3e9', borderColor: '#ec6c0c' }}>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ec6c0c' }} />
                      <div>
                        <p className="text-sm font-bold mb-2" style={{ color: '#1c2444' }}>
                          Notas:
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{session.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t-2 border-gray-100">
                  <Link
                    href={`/tutors/${session.tutors.id}`}
                    className="text-sm font-bold hover:underline"
                    style={{ color: '#ec6c0c' }}
                  >
                    Ver perfil del tutor →
                  </Link>
                  {session.status === 'pending' && (
                    <button
                      className="px-5 py-2 text-sm text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                      style={{ backgroundColor: '#f04828' }}
                      onClick={() => {
                        if (
                          confirm('¿Estás seguro de que quieres cancelar esta sesión?')
                        ) {
                          alert('Funcionalidad de cancelar próximamente')
                        }
                      }}
                    >
                      Cancelar sesión
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
