import { GoogleGenAI, Type } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, ApiResponse } from '@/types'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `Eres un experto pedagogo español especializado en crear material de estudio eficaz para estudiantes de ESO, Bachillerato, Universidad y Oposiciones. Tu tarea es analizar los apuntes del estudiante y generar tres elementos de alta calidad educativa.

REGLAS DE CONTENIDO:
- ESQUEMA: Jerárquico, numerado (1. 1.1 1.1.1...), completo, máximo 30 puntos, ordenado lógicamente, separado por saltos de línea \\n
- RESUMEN: Exactamente entre 5 y 7 puntos clave. Cada punto autocontenido y claro
- TEST: Exactamente 10 preguntas. Dificultad variada (3 fáciles, 4 medias, 3 difíciles). Todas las opciones plausibles. Ninguna respuesta obvia sin leer el material
- Escribe siempre en español de España
- Usa los nombres exactos de claves: esquema, resumen, test, pregunta, opciones, A, B, C, D, respuesta_correcta, explicacion`

// JSON Schema for structured output — Gemini guarantees this shape
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    esquema: {
      type: Type.STRING,
      description: 'Esquema jerárquico numerado completo, separado por \\n',
    },
    resumen: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Entre 5 y 7 puntos clave',
      minItems: '5',
      maxItems: '7',
    },
    test: {
      type: Type.ARRAY,
      minItems: '10',
      maxItems: '10',
      items: {
        type: Type.OBJECT,
        properties: {
          pregunta: { type: Type.STRING },
          opciones: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
            },
            required: ['A', 'B', 'C', 'D'],
            propertyOrdering: ['A', 'B', 'C', 'D'],
          },
          respuesta_correcta: {
            type: Type.STRING,
            enum: ['A', 'B', 'C', 'D'],
          },
          explicacion: { type: Type.STRING },
        },
        required: ['pregunta', 'opciones', 'respuesta_correcta', 'explicacion'],
        propertyOrdering: ['pregunta', 'opciones', 'respuesta_correcta', 'explicacion'],
      },
    },
  },
  required: ['esquema', 'resumen', 'test'],
  propertyOrdering: ['esquema', 'resumen', 'test'],
}

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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor. Contacta con soporte.' },
        { status: 500 }
      )
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Analiza estos apuntes y genera el esquema, resumen y test según las instrucciones:\n\n${trimmed}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    })

    const rawText = response.text
    if (!rawText) {
      throw new Error('Respuesta vacía de la IA')
    }

    let parsed: AnalysisResult
    try {
      parsed = JSON.parse(rawText) as AnalysisResult
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
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

    if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('api_key')) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor. Contacta con soporte.' },
        { status: 500 }
      )
    }

    if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
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
