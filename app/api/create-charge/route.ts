import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, amount, email, description } = await request.json()

    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency_code: 'PEN',
        email: email,
        source_id: token,
        description: description,
      }),
    })

    const data = await response.json()

    if (data.object === 'error') {
      return NextResponse.json(
        { error: data.user_message || 'Error al procesar el pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, charge: data })
  } catch (error: any) {
    console.error('Error en API de pago:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}
