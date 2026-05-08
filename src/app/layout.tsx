import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EstudiaAI — Convierte tus apuntes en esquemas y tests en segundos',
  description: 'La herramienta de IA para estudiantes españoles. Pega tus apuntes y obtén un esquema jerárquico, resumen de puntos clave y 10 preguntas de repaso automáticamente.',
  keywords: ['estudiar', 'apuntes', 'esquemas', 'test', 'IA', 'inteligencia artificial', 'estudiantes', 'bachillerato', 'universidad', 'selectividad', 'oposiciones'],
  authors: [{ name: 'EstudiaAI' }],
  openGraph: {
    title: 'EstudiaAI — Estudia más rápido con IA',
    description: 'Convierte tus apuntes en esquemas y tests automáticamente',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstudiaAI',
    description: 'Convierte tus apuntes en esquemas y tests en segundos con IA',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
