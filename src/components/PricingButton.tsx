'use client'

export function PricingButton() {
  return (
    <button
      className="w-full bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-700 transition-colors"
      onClick={() => alert('Integración de pago próximamente')}
    >
      Obtener acceso ilimitado
    </button>
  )
}
