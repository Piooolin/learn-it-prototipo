'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Star, Clock, DollarSign } from 'lucide-react'

interface Tutor {
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
  } | null
}

export default function TutorsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('all')

  const faculties = [
    'Todas',
    'Ingeniería',
    'Economía',
    'Administración',
    'Derecho',
    'Medicina',
    'Arquitectura',
  ]

  useEffect(() => {
    checkUser()
    fetchTutors()
  }, [])

  useEffect(() => {
    filterTutors()
  }, [searchTerm, selectedFaculty, tutors])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    }
  }

  async function fetchTutors() {
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
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (error) throw error

      console.log('Tutores cargados:', data)
      
      // Transformar los datos para que profiles sea un objeto en lugar de array
      const transformedData = data?.map((tutor: any) => ({
        ...tutor,
        profiles: Array.isArray(tutor.profiles) ? tutor.profiles[0] : tutor.profiles
      })) || []

      setTutors(transformedData)
      setFilteredTutors(transformedData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tutors:', error)
      setLoading(false)
    }
  }


  function filterTutors() {
    let filtered = [...tutors]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filtrar por facultad
    if (selectedFaculty !== 'all') {
      filtered = filtered.filter(tutor =>
        tutor.specializations.includes(selectedFaculty)
      )
    }

    setFilteredTutors(filtered)
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
          <p className="text-white font-medium">Cargando tutores...</p>
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
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-xl"
                    style={{ backgroundColor: '#ec6c0c' }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#1c2444' }}>
            Encuentra tu tutor ideal
          </h1>
          <p className="text-xl text-gray-600">
            Conecta con tutores universitarios verificados en diversas especialidades
          </p>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-2 transition-all"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Filtro por Facultad */}
            <div>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-2 transition-all bg-white"
                style={{ color: '#1c2444' }}
                onFocus={(e) => e.target.style.borderColor = '#ec6c0c'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="all">Todas las facultades</option>
                {faculties.slice(1).map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-4 text-sm font-medium" style={{ color: '#1c2444' }}>
            Mostrando {filteredTutors.length} de {tutors.length} tutores
          </div>
        </div>

        {/* Lista de Tutores */}
        {filteredTutors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-xl mb-6">
              No se encontraron tutores con esos criterios
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFaculty('all')
              }}
              className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#ec6c0c' }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border-2 border-transparent hover:border-opacity-50 hover:-translate-y-1"
                style={{ borderColor: '#ec6c0c' }}
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #ec6c0c 0%, #f04828 100%)' }}>
                    {tutor.profiles?.full_name.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#1c2444' }}>
                      {tutor.profiles?.full_name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tutor.profiles?.university || 'Sin universidad'}
                    </p>
                  </div>
                </div>


                {/* Rating y Sesiones */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-current" style={{ color: '#ec6c0c' }} />
                    <span className="text-sm font-bold" style={{ color: '#1c2444' }}>
                      {tutor.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {tutor.total_sessions} sesiones
                  </div>
                </div>

                {/* Especialidades */}
                <div className="mb-5">
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: '#fef3e9', color: '#ec6c0c' }}
                      >
                        {spec}
                      </span>
                    ))}
                    {tutor.specializations.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        +{tutor.specializations.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                  {tutor.description}
                </p>

                {/* Precio y Botón */}
                <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">S/</span>
                    <span className="text-2xl font-bold" style={{ color: '#1c2444' }}>
                      {tutor.hourly_rate}
                    </span>
                    <span className="text-sm text-gray-600">/hora</span>
                  </div>
                  <Link
                    href={`/tutors/${tutor.id}`}
                    className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md group-hover:shadow-lg transform group-hover:scale-105"
                    style={{ backgroundColor: '#ec6c0c' }}
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

