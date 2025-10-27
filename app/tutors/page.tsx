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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando tutores...</p>
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
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encuentra tu tutor ideal
          </h1>
          <p className="text-gray-600">
            Conecta con tutores universitarios verificados en diversas especialidades
          </p>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por Facultad */}
            <div>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredTutors.length} de {tutors.length} tutores
          </div>
        </div>

        {/* Lista de Tutores */}
        {filteredTutors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No se encontraron tutores con esos criterios
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFaculty('all')
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {tutor.profiles?.full_name.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {tutor.profiles?.full_name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tutor.profiles?.university || 'Sin universidad'}
                    </p>
                  </div>
                </div>


                {/* Rating y Sesiones */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {tutor.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {tutor.total_sessions} sesiones
                  </div>
                </div>

                {/* Especialidades */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {tutor.specializations.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{tutor.specializations.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {tutor.description}
                </p>

                {/* Precio y Botón */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-xl font-bold text-gray-900">
                      {tutor.hourly_rate}
                    </span>
                    <span className="text-sm text-gray-600">/hora</span>
                  </div>
                  <Link
                    href={`/tutors/${tutor.id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

