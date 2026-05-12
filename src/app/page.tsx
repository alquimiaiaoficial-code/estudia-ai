import { Analyzer } from '@/components/Analyzer'
import { PricingButton } from '@/components/PricingButton'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-xl text-gray-900">EstudiaAI</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#herramienta" className="hover:text-gray-900 transition-colors">Herramienta</a>
            <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Precios</a>
          </nav>
          <a
            href="#pricing"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Acceso ilimitado →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>✨</span>
            <span>Usado por estudiantes de más de 50 universidades españolas</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            5 páginas de apuntes.<br />
            <span className="text-brand-600">Esquema listo en 30 segundos.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Pega tus apuntes y EstudiaAI los convierte automáticamente en un esquema jerárquico, un resumen de los puntos clave y 10 preguntas tipo test. Sin registrarte. Sin complicaciones.
          </p>
          <a
            href="#herramienta"
            className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-xl px-8 py-4 text-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm hover:shadow-md"
          >
            Probar gratis ahora
            <span>→</span>
          </a>
          <p className="text-sm text-gray-400 mt-3">3 análisis gratuitos · Sin tarjeta de crédito</p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Cómo funciona</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              emoji: '📋',
              title: 'Pega tus apuntes',
              desc: 'Copia el texto de tus apuntes, ya sea de Word, PDF, o lo que tengas. Sin formato especial.',
            },
            {
              step: '2',
              emoji: '🤖',
              title: 'La IA los analiza',
              desc: 'Nuestro modelo de IA lee, comprende y estructura tu material en segundos.',
            },
            {
              step: '3',
              emoji: '🎯',
              title: 'Estudia más eficiente',
              desc: 'Recibes el esquema, el resumen y el test. Cópialos o úsalos directamente aquí.',
            },
          ].map(({ step, emoji, title, desc }) => (
            <div key={step} className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold mx-auto">
                {emoji}
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Herramienta */}
      <section id="herramienta" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pruébalo ahora</h2>
            <p className="text-gray-600">Tienes 3 análisis gratuitos. Sin registrarte.</p>
          </div>
          <Analyzer />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Precios sencillos</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-bold text-gray-900 text-xl mb-1">Gratuito</h3>
            <p className="text-3xl font-extrabold text-gray-900 mb-4">0€</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {['3 análisis completos', 'Esquema + resumen + test', 'Sin registro'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-green-500">✓</span>{f}</li>
              ))}
            </ul>
            <a
              href="#herramienta"
              className="block text-center border-2 border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors"
            >
              Empezar gratis
            </a>
          </div>

          {/* Paid */}
          <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              MÁS POPULAR
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-1">Acceso ilimitado</h3>
            <p className="text-3xl font-extrabold text-gray-900 mb-4">4,99€ <span className="text-base font-normal text-gray-500">pago único</span></p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {['Análisis ilimitados para siempre', 'Esquema + resumen + test', 'Exportar a PDF', 'Acceso a nuevas funciones'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-brand-600">✓</span>{f}</li>
              ))}
            </ul>
            <PricingButton />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
              {
                q: '¿Funciona con cualquier asignatura?',
                a: 'Sí. Historia, Biología, Derecho, Economía, Matemáticas, Literatura... Cualquier tema con contenido textual funciona bien.',
              },
              {
                q: '¿Qué pasa cuando se me acaban los 3 gratuitos?',
                a: 'Puedes obtener acceso ilimitado por 4,99€ de pago único. Sin suscripción, sin cargos mensuales.',
              },
              {
                q: '¿Mis apuntes son privados?',
                a: 'Tus apuntes se procesan para generar el análisis y no se almacenan en ningún servidor. Desaparecen tras el análisis.',
              },
              {
                q: '¿Cuánto texto puedo analizar de una vez?',
                a: 'Hasta 20.000 caracteres por análisis, equivalente a unas 4.000 palabras. Si tienes más, divídelo en partes.',
              },
              {
                q: '¿Funciona en móvil?',
                a: 'Sí, la herramienta está optimizada para móvil. Puedes pegar texto directamente desde cualquier app.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2025 EstudiaAI · Hecho con IA para estudiantes</p>
        </div>
      </footer>
    </main>
  )
}
