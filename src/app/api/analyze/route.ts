import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, ApiResponse } from '@/types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Llama 3.3 70B — excelente en español, soporta JSON mode, 14.400 req/día gratis
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `Eres un experto pedagogo español especializado en crear material de estudio eficaz para estudiantes de ESO, Bachillerato, Universidad y Oposiciones.

Tu tarea es analizar los apuntes del estudiante y generar tres elementos de alta calidad educativa.

DEBES responder EXCLUSIVAMENTE con un objeto JSON válido con esta estructura EXACTA:

{
  "esquema": "string con esquema jerárquico numerado (1. 1.1 1.1.1...) separado por saltos de línea \\n",
  "resumen": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "test": [
    {
      "pregunta": "¿texto?",
      "opciones": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "respuesta_correcta": "A",
      "explicacion": "breve explicación"
    }
  ]
}

REGLAS ESTRICTAS DE CONTENIDO:
- ESQUEMA: Jerárquico, numerado, máximo 30 puntos, lógicamente ordenado
- RESUMEN: Array con EXACTAMENTE entre 5 y 7 strings. Cada punto autocontenido y claro
- TEST: Array con EXACTAMENTE 10 preguntas. Dificultad variada: 3 fáciles, 4 medias, 3 difíciles. Todas las opciones plausibles, ninguna respuesta obvia
- respuesta_correcta debe ser SIEMPRE una de: "A", "B", "C" o "D"
- Escribe siempre en español de España
- NO incluyas markdown, NO uses bloques de código, NO añadas texto antes o después del JSON
- El JSON debe ser parseable directamente con JSON.parse()`

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor. Contacta con soporte.' },
        { status: 500 }
      )
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analiza estos apuntes y genera el esquema, resumen y test según las instrucciones. Devuelve SOLO JSON válido:\n\n${trimmed}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 8192,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error('Respuesta vacía de la IA')
    }

    let parsed: AnalysisResult
    try {
      parsed = JSON.parse(rawContent) as AnalysisResult
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
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
    const lower = message.toLowerCase()

    if (lower.includes('api key') || lower.includes('api_key') || lower.includes('authentication') || lower.includes('unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor. Contacta con soporte.' },
        { status: 500 }
      )
    }

    if (lower.includes('rate') || lower.includes('quota') || lower.includes('limit')) {
      return NextResponse.json(
        { success: false, error: 'Límite de uso temporal alcanzado. Inténtalo de nuevo en unos minutos.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Error al analizar los apuntes: ${message}` },
      { status: 500 }
    )
  }
}
