'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react'
import CulqiCheckout from '@/app/components/CulqiCheckout'

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
  const [showPayment, setShowPayment] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

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

      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single()

      if (error) throw error

      setSessionId(data.id)
      setShowPayment(true)
      setSubmitting(false)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Error al agendar la sesión')
      setSubmitting(false)
    }
  }

  async function handlePaymentSuccess(token: string) {
    try {
      const response = await fetch('/api/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount: tutor?.hourly_rate || 0,
          email: user.email,
          description: `Sesión con ${tutor?.profiles?.full_name}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await supabase
          .from('sessions')
          .update({ status: 'confirmed' })
          .eq('id', sessionId)

        setSuccess(true)
        setTimeout(() => router.push('/my-sessions'), 2000)
      } else {
        alert('Error al procesar el pago: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago')
    }
  }

  function handlePaymentError(error: any) {
    alert('Error al procesar el pago. Intenta de nuevo.')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ec6c0c' }}></div>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Link href="/tutors" className="px-6 py-3 text-white rounded-xl font-semibold" style={{ backgroundColor: '#ec6c0c' }}>
          Volver a tutores
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c2444 0%, #0d1117 100%)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#10b981' }} />
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#1c2444' }}>
            ¡Pago exitoso!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Tu sesión ha sido confirmada y pagada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(28, 36, 68, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Learn It" className="w-12 h-12 object-contain bg-white p-1.5 rounded-lg" />
            <span className="text-white font-bold text-xl">Learn It</span>
          </Link>
          {user && (
            <button onClick={handleLogout} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: '#f04828' }}>
              Cerrar sesión
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href={`/tutors/${tutorId}`} className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-white px-4 py-2 rounded-lg transition-all" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ec6c0c'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563' }}>
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1c2444' }}>
            {showPayment ? 'Procesar Pago' : 'Agendar sesión'}
          </h1>
          <p className="text-gray-600 mb-8">con {tutor.profiles?.full_name}</p>

          {!showPayment ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                  <Calendar className="w-5 h-5 inline mr-2" style={{ color: '#ec6c0c' }} />
                  Fecha
                </label>
                <input type="date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl" onFocus={(e) => e.target.style.borderColor = '#ec6c0c'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                  <Clock className="w-5 h-5 inline mr-2" style={{ color: '#ec6c0c' }} />
                  Hora
                </label>
                <select required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white" onFocus={(e) => e.target.style.borderColor = '#ec6c0c'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'}>
                  <option value="">Selecciona una hora</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#1c2444' }}>
                  Notas (opcional)
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl" placeholder="¿Qué temas quieres repasar?" onFocus={(e) => e.target.style.borderColor = '#ec6c0c'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50" style={{ backgroundColor: '#ec6c0c' }}>
                {submitting ? 'Agendando...' : 'Continuar al Pago'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 border-2" style={{ backgroundColor: '#fef3e9', borderColor: '#ec6c0c' }}>
                <h3 className="font-bold text-xl mb-4" style={{ color: '#1c2444' }}>Resumen</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Tutor:</span>
                    <span className="font-bold" style={{ color: '#1c2444' }}>{tutor.profiles?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Fecha:</span>
                    <span className="font-bold" style={{ color: '#1c2444' }}>{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Hora:</span>
                    <span className="font-bold" style={{ color: '#1c2444' }}>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-orange-200">
                    <span className="font-bold text-lg" style={{ color: '#1c2444' }}>Total:</span>
                    <span className="text-2xl font-bold" style={{ color: '#ec6c0c' }}>S/ {tutor.hourly_rate}</span>
                  </div>
                </div>
              </div>

              <CulqiCheckout
                amount={tutor.hourly_rate}
                description={`Sesión con ${tutor.profiles?.full_name}`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />

              <p className="text-sm text-gray-500 text-center">
                Pago seguro procesado por Culqi
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
