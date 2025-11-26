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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ec6c0c' }}></div>
          <p className="text-white font-medium">Cargando...</p>
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#10b981' }} />
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#1c2444' }}>
            ¡Sesión agendada con éxito!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Tu sesión con {tutor.profiles?.full_name} ha sido confirmada.
          </p>
          <p className="text-sm font-medium" style={{ color: '#ec6c0c' }}>
            Redirigiendo a tus sesiones...
          </p>
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
              {user && (
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
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/tutors/${tutorId}`}
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
          Volver al perfil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1c2444' }}>
            Agendar sesión
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            con {tutor.profiles?.full_name || 'Tutor'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Fecha */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                <Calendar className="w-5 h-5 inline mr-2" style={{ color: '#ec6c0c' }} />
                Fecha
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Seleccionar Hora */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                <Clock className="w-5 h-5 inline mr-2" style={{ color: '#ec6c0c' }} />
                Hora
              </label>
              <select
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-2 transition-all bg-white"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="¿Qué temas te gustaría repasar en esta sesión?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Resumen */}
            <div className="rounded-2xl p-6 border-2" style={{ backgroundColor: '#fef3e9', borderColor: '#ec6c0c' }}>
              <h3 className="font-bold text-xl mb-4" style={{ color: '#1c2444' }}>Resumen</h3>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Tutor:</span>
                  <span className="font-bold" style={{ color: '#1c2444' }}>{tutor.profiles?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Duración:</span>
                  <span className="font-bold" style={{ color: '#1c2444' }}>1 hora</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-orange-200">
                  <span className="font-bold text-lg" style={{ color: '#1c2444' }}>Total:</span>
                  <span className="text-2xl font-bold" style={{ color: '#ec6c0c' }}>
                    S/ {tutor.hourly_rate}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              style={{ backgroundColor: '#ec6c0c' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Agendando...
                </span>
              ) : (
                'Confirmar y Agendar'
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            El pago se realizará después de confirmar la sesión
          </p>
        </div>
      </main>
    </div>
  )
}
