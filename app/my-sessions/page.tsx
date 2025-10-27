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
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <Link
                href="/tutors"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Buscar tutores
              </Link>
              {user && (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Sesiones
          </h1>
          <p className="text-gray-600">
            Todas tus sesiones agendadas con tutores
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No tienes sesiones agendadas
            </h2>
            <p className="text-gray-600 mb-6">
              Busca un tutor y agenda tu primera sesión
            </p>
            <Link
              href="/tutors"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar tutores
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {session.tutors.profiles.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {session.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <User className="w-4 h-4" />
                        <span>{session.tutors.profiles.full_name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{session.tutors.profiles.university}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      session.status
                    )}`}
                  >
                    {getStatusText(session.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(session.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(session.scheduled_at)} ({session.duration_minutes} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">${session.total_price}</span>
                  </div>
                </div>

                {session.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Notas:
                        </p>
                        <p className="text-sm text-gray-600">{session.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Link
                    href={`/tutors/${session.tutors.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver perfil del tutor
                  </Link>
                  {session.status === 'pending' && (
                    <button
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      onClick={() => {
                        if (
                          confirm('¿Estás seguro de que quieres cancelar esta sesión?')
                        ) {
                          // Aquí iría la lógica para cancelar
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
