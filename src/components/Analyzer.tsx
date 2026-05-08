'use client'

import { useState, useCallback } from 'react'
import { AnalysisResult, AnalysisStatus } from '@/types'
import { getCredits, decrementCredit, hasCredits } from '@/lib/credits'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ResultsPanel } from '@/components/ResultsPanel'
import { CreditsDisplay } from '@/components/CreditsDisplay'

const MAX_CHARS = 20000
const MIN_CHARS = 100

const DEMO_TEXT = `La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias convierten la energía lumínica en energía química almacenada en forma de glucosa. Este proceso ocurre principalmente en los cloroplastos, orgánulos celulares que contienen clorofila, el pigmento verde responsable de captar la luz solar.

El proceso se divide en dos fases principales: la fase luminosa y el ciclo de Calvin. En la fase luminosa, que ocurre en las membranas tilacoidales, la energía solar se utiliza para dividir moléculas de agua (fotólisis), liberando oxígeno como subproducto y generando ATP y NADPH. En el ciclo de Calvin, que tiene lugar en el estroma del cloroplasto, el CO2 atmosférico se fija y se reduce utilizando el ATP y NADPH producidos en la fase anterior para sintetizar glucosa.

La ecuación general de la fotosíntesis es: 6CO2 + 6H2O + energía luminosa → C6H12O6 + 6O2. Los factores que afectan la tasa de fotosíntesis incluyen la intensidad luminosa, la concentración de CO2, la temperatura y la disponibilidad de agua y minerales.`

export function Analyzer() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const charCount = text.length
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const isTextValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS

  const analyze = useCallback(async (textToAnalyze: string) => {
    if (!hasCredits()) {
      setError('Has usado todos tus análisis gratuitos. Obtén acceso ilimitado para continuar.')
      return
    }

    setStatus('loading')
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      })

      const data = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Error desconocido')
      }

      decrementCredit()
      setResult(data.data)
      setStatus('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al conectar con el servidor'
      setError(message)
      setStatus('error')
    }
  }, [])

  const handleSubmit = () => {
    if (!isTextValid) return
    analyze(text)
  }

  const handleDemo = () => {
    setText(DEMO_TEXT)
    analyze(DEMO_TEXT)
  }

  const handleReset = () => {
    setText('')
    setResult(null)
    setStatus('idle')
    setError(null)
  }

  const credits = getCredits()

  return (
    <div className="space-y-6">
      <CreditsDisplay credits={credits} />

      {status !== 'success' && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="apuntes" className="block text-sm font-semibold text-gray-700">
                Pega tus apuntes aquí
              </label>
              <span className={`text-xs ${charCount > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount.toLocaleString('es-ES')} / {MAX_CHARS.toLocaleString('es-ES')} caracteres
                {wordCount > 0 && ` · ${wordCount} palabras`}
              </span>
            </div>

            <textarea
              id="apuntes"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega aquí los apuntes del tema que quieres estudiar. Puedes incluir definiciones, conceptos, fechas, fórmulas... cuanto más completos sean los apuntes, mejor será el análisis."
              className="w-full h-64 resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
              disabled={status === 'loading'}
            />

            {charCount > 0 && charCount < MIN_CHARS && (
              <p className="text-xs text-amber-600">
                Necesitas al menos {MIN_CHARS} caracteres para un análisis útil. Añade más contenido.
              </p>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!isTextValid || status === 'loading'}
                loading={status === 'loading'}
                size="lg"
                className="flex-1"
              >
                {status === 'loading' ? 'Analizando apuntes...' : '✨ Analizar apuntes'}
              </Button>

              <Button
                variant="secondary"
                onClick={handleDemo}
                disabled={status === 'loading'}
                size="lg"
              >
                Ver demo
              </Button>
            </div>

            {status === 'loading' && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:150ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:300ms]" />
                  <span>La IA está leyendo y estructurando tus apuntes</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {status === 'success' && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Resultado del análisis</h2>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              ← Nuevo análisis
            </Button>
          </div>
          <ResultsPanel result={result} originalText={text} />
        </div>
      )}
    </div>
  )
}
