import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, ApiResponse } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres un experto pedagogo español especializado en crear material de estudio eficaz para estudiantes de ESO, Bachillerato, Universidad y Oposiciones. Tu tarea es analizar los apuntes del estudiante y generar tres elementos de alta calidad educativa.

INSTRUCCIONES ESTRICTAS:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después
- No uses bloques de código markdown (sin \`\`\`json)
- No añadas comentarios dentro del JSON
- El JSON debe ser parseable directamente con JSON.parse()

ESTRUCTURA JSON OBLIGATORIA:
{
  "esquema": "string con el esquema jerárquico completo usando numeración 1. 1.1 1.1.1 etc., separado por saltos de línea \\n",
  "resumen": ["punto clave 1", "punto clave 2", "punto clave 3", "punto clave 4", "punto clave 5"],
  "test": [
    {
      "pregunta": "¿Texto de la pregunta?",
      "opciones": {
        "A": "Primera opción",
        "B": "Segunda opción",
        "C": "Tercera opción",
        "D": "Cuarta opción"
      },
      "respuesta_correcta": "A",
      "explicacion": "Explicación breve de por qué A es correcta y las demás no"
    }
  ]
}

REGLAS DE CONTENIDO:
- ESQUEMA: Jerárquico, numerado, completo, máximo 30 puntos, ordenado lógicamente
- RESUMEN: Exactamente entre 5 y 7 strings en el array. Cada punto autocontenido y claro
- TEST: Exactamente 10 preguntas. Dificultad variada (3 fáciles, 4 medias, 3 difíciles). Todas las opciones plausibles. Ninguna respuesta obvia sin leer el material
- Escribe siempre en español de España`

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<AnalysisResult>>> {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El texto de los apuntes es obligatorio' },
        { status: 400 }
      )
    }

    const trimmed = text.trim()

    if (trimmed.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Los apuntes son demasiado cortos. Necesitamos al menos 100 caracteres para generar un análisis útil.' },
        { status: 400 }
      )
    }

    if (trimmed.length > 20000) {
      return NextResponse.json(
        { success: false, error: 'Los apuntes son demasiado largos. Máximo 20.000 caracteres (aproximadamente 4.000 palabras).' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analiza estos apuntes y genera el esquema, resumen y test según las instrucciones:\n\n${trimmed}`,
        },
      ],
    })

    const rawContent = message.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Respuesta inesperada de la IA')
    }

    let parsed: AnalysisResult
    try {
      parsed = JSON.parse(rawContent.text) as AnalysisResult
    } catch {
      // Intento de recuperación: buscar JSON en la respuesta
      const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No se pudo parsear la respuesta de la IA')
      }
      parsed = JSON.parse(jsonMatch[0]) as AnalysisResult
    }

    // Validación básica de estructura
    if (!parsed.esquema || !Array.isArray(parsed.resumen) || !Array.isArray(parsed.test)) {
      throw new Error('La respuesta de la IA no tiene la estructura esperada')
    }

    if (parsed.test.length !== 10) {
      throw new Error(`Se esperaban 10 preguntas, se recibieron ${parsed.test.length}`)
    }

    return NextResponse.json({ success: true, data: parsed })

  } catch (error) {
    console.error('Error en /api/analyze:', error)

    const message = error instanceof Error ? error.message : 'Error desconocido'

    if (message.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor. Contacta con soporte.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Error al analizar los apuntes: ${message}` },
      { status: 500 }
    )
  }
}
