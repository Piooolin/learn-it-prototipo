'use client'

import { useEffect, useState } from 'react'

interface CulqiCheckoutProps {
  amount: number
  description: string
  onSuccess: (token: string) => void
  onError: (error: any) => void
}

export default function CulqiCheckout({ amount, description, onSuccess, onError }: CulqiCheckoutProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  
  useEffect(() => {
    // Cargar script de Culqi
    const script = document.createElement('script')
    script.src = 'https://checkout.culqi.com/js/v4'
    script.async = true
    
    script.onload = () => {
      console.log('Script de Culqi cargado')
      
      // Configurar Culqi después de que el script cargue
      setTimeout(() => {
        // @ts-ignore
        if (window.Culqi) {
          // @ts-ignore
          window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
          
          console.log('Culqi configurado')
          setScriptLoaded(true)
        }
      }, 300)
    }
    
    script.onerror = () => {
      console.error('Error al cargar Culqi')
    }
    
    document.body.appendChild(script)
    
    // Definir la función global culqi
    // @ts-ignore
    window.culqi = function() {
      // @ts-ignore
      if (window.Culqi.token) {
        // @ts-ignore
        const token = window.Culqi.token.id
        console.log('Token recibido:', token)
        onSuccess(token)
      // @ts-ignore
      } else if (window.Culqi.error) {
        // @ts-ignore
        console.error('Error:', window.Culqi.error)
        // @ts-ignore
        onError(window.Culqi.error)
      }
    }
    
    return () => {
      const scriptElement = document.querySelector('script[src="https://checkout.culqi.com/js/v4"]')
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [])

  const handlePayment = () => {
    console.log('Intentando abrir Culqi')
    
    if (!scriptLoaded) {
      alert('Espera un momento, el sistema de pagos se está cargando...')
      return
    }
    
    try {
      // @ts-ignore
      if (window.Culqi && window.Culqi.open) {
        // Configurar datos del pago
        // @ts-ignore
        window.Culqi.settings({
          title: 'Learn It',
          currency: 'PEN',
          description: description,
          amount: amount * 100, // Culqi usa centavos
        })
        
        console.log('Abriendo modal de pago')
        // @ts-ignore
        window.Culqi.open()
      } else {
        console.error('Culqi no disponible')
        alert('Error: Sistema de pagos no disponible. Recarga la página.')
      }
    } catch (error) {
      console.error('Error al abrir Culqi:', error)
      alert('Error al abrir el formulario de pago')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={!scriptLoaded}
        className="w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#ec6c0c' }}
      >
        {scriptLoaded ? 'Pagar con Tarjeta' : 'Cargando...'}
      </button>
    </div>
  )
}
