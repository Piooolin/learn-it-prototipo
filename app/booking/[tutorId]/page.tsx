'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react'

interface TutorProfile {
  id: string
  hourly_rate: number
  profiles: {
    full_name: string
    university: string
  }
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const tutorId = params.tutorId as string

  const [user, setUser] = useState<any>(null)
  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  useEffect(() => {
    checkUser()
    fetchTutor()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }
    setUser(session.user)
  }

  async function fetchTutor() {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select(`
          id,
          hourly_rate,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user || !selectedDate || !selectedTime) {
      alert('Por favor completa todos los campos')
      return
    }

    setSubmitting(true)

    try {
      const sessionData = {
        student_id: user.id,
        tutor_id: tutorId,
        subject: 'Sesión de tutoría',
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        duration_minutes: 60,
        total_price: tutor?.hourly_rate || 0,
        status: 'pending',
        notes: notes || '',
      }

      console.log('Intentando insertar sesión:', sessionData)

      const { error } = await supabase
        .from('sessions')
        .insert([sessionData])

      if (error) {
        console.error('Error de Supabase:', error)
        throw error
      }

      console.log('✅ Sesión creada exitosamente')

      setSuccess(true)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/tutors')
      }, 2000)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Error al agendar la sesión. Por favor intenta de nuevo.')
      setSubmitting(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Sesión agendada con éxito!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu sesión con {tutor.profiles?.full_name} ha sido confirmada.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a tus sesiones...
          </p>
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
              {user && (
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
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/tutors/${tutorId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar sesión
          </h1>
          <p className="text-gray-600 mb-8">
            con {tutor.profiles?.full_name || 'Tutor'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Seleccionar Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Hora
              </label>
              <select
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Selecciona una hora</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="¿Qué temas te gustaría repasar en esta sesión?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tutor:</span>
                  <span className="font-medium">{tutor.profiles?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">1 hora</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-900 font-bold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${tutor.hourly_rate}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Agendando...
                </span>
              ) : (
                'Confirmar y Agendar'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            El pago se realizará después de confirmar la sesión
          </p>
        </div>
      </main>
    </div>
  )
}
