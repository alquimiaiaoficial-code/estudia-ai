export interface AnalysisResult {
  esquema: string
  resumen: string[]
  test: TestQuestion[]
}

export interface TestQuestion {
  pregunta: string
  opciones: {
    A: string
    B: string
    C: string
    D: string
  }
  respuesta_correcta: 'A' | 'B' | 'C' | 'D'
  explicacion: string
}

export interface UserCredits {
  remaining: number
  isPaid: boolean
  paidToken?: string
}

export type AnalysisStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}
