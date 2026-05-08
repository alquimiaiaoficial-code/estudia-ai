'use client'

import { UserCredits } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface CreditsDisplayProps {
  credits: UserCredits
}

export function CreditsDisplay({ credits }: CreditsDisplayProps) {
  if (credits.isPaid) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <span>✓</span>
        <span className="font-medium">Acceso ilimitado activo</span>
      </div>
    )
  }

  const color = credits.remaining === 0 ? 'warning' : credits.remaining <= 1 ? 'warning' : 'info'

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Análisis gratuitos restantes:</span>
        <Badge variant={color}>
          {credits.remaining} de 3
        </Badge>
      </div>
      {credits.remaining === 0 && (
        <a
          href="#pricing"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Obtener acceso ilimitado →
        </a>
      )}
    </div>
  )
}
