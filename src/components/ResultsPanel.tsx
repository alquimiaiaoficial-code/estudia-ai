'use client'

import { useState } from 'react'
import { AnalysisResult, TestQuestion } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ResultsPanelProps {
  result: AnalysisResult
  originalText: string
}

type Tab = 'esquema' | 'resumen' | 'test'

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('esquema')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)
  const [copied, setCopied] = useState(false)

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'esquema', label: 'Esquema', emoji: '🗂️' },
    { id: 'resumen', label: 'Resumen', emoji: '📝' },
    { id: 'test', label: 'Test (10 preguntas)', emoji: '🎯' },
  ]

  const handleCopy = async () => {
    let content = ''
    if (activeTab === 'esquema') content = result.esquema
    if (activeTab === 'resumen') content = result.resumen.map((p, i) => `${i + 1}. ${p}`).join('\n')
    if (activeTab === 'test') {
      content = result.test.map((q, i) =>
        `${i + 1}. ${q.pregunta}\nA) ${q.opciones.A}\nB) ${q.opciones.B}\nC) ${q.opciones.C}\nD) ${q.opciones.D}\nRespuesta: ${q.respuesta_correcta}\n${q.explicacion}`
      ).join('\n\n')
    }

    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const score = showAnswers
    ? Object.entries(selectedAnswers).filter(([i, a]) => a === result.test[parseInt(i)].respuesta_correcta).length
    : null

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all',
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700 bg-brand-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="min-h-64">
        {activeTab === 'esquema' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Esquema jerárquico</h3>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 rounded-xl p-4">
              {result.esquema}
            </pre>
          </div>
        )}

        {activeTab === 'resumen' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Puntos clave</h3>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </Button>
            </div>
            <ol className="space-y-3">
              {result.resumen.map((punto, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{punto}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Test de repaso</h3>
              <div className="flex gap-2">
                {!showAnswers && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAnswers(true)}
                    disabled={Object.keys(selectedAnswers).length < result.test.length}
                  >
                    Ver corrección
                  </Button>
                )}
                {showAnswers && score !== null && (
                  <Badge variant={score >= 7 ? 'success' : score >= 5 ? 'warning' : 'default'}>
                    {score}/10 respuestas correctas
                  </Badge>
                )}
              </div>
            </div>

            {result.test.map((question, i) => (
              <QuestionCard
                key={i}
                question={question}
                index={i}
                selected={selectedAnswers[i]}
                showAnswer={showAnswers}
                onSelect={(answer) => {
                  if (!showAnswers) {
                    setSelectedAnswers(prev => ({ ...prev, [i]: answer }))
                  }
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function QuestionCard({
  question,
  index,
  selected,
  showAnswer,
  onSelect,
}: {
  question: TestQuestion
  index: number
  selected?: string
  showAnswer: boolean
  onSelect: (answer: string) => void
}) {
  const options = ['A', 'B', 'C', 'D'] as const

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800">
        <span className="text-brand-600">{index + 1}.</span> {question.pregunta}
      </p>
      <div className="grid gap-2">
        {options.map(opt => {
          const isSelected = selected === opt
          const isCorrect = question.respuesta_correcta === opt
          const isWrong = showAnswer && isSelected && !isCorrect

          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                !showAnswer && !isSelected && 'border-gray-200 hover:border-brand-300 hover:bg-brand-50',
                !showAnswer && isSelected && 'border-brand-400 bg-brand-50 text-brand-800',
                showAnswer && isCorrect && 'border-green-400 bg-green-50 text-green-800 font-medium',
                isWrong && 'border-red-300 bg-red-50 text-red-700',
                showAnswer && !isCorrect && !isWrong && 'border-gray-100 text-gray-400',
              )}
            >
              <span className="font-semibold mr-2">{opt})</span>
              {question.opciones[opt]}
            </button>
          )
        })}
      </div>
      {showAnswer && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5">
          <p className="text-xs text-green-800">
            <span className="font-semibold">Explicación:</span> {question.explicacion}
          </p>
        </div>
      )}
    </div>
  )
}
