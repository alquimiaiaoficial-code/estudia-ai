import { UserCredits } from '@/types'

const CREDITS_KEY = 'estudiaai_credits'
const PAID_TOKEN_KEY = 'estudiaai_paid_token'
const FREE_CREDITS = 3

export function getCredits(): UserCredits {
  if (typeof window === 'undefined') {
    return { remaining: FREE_CREDITS, isPaid: false }
  }

  const paidToken = localStorage.getItem(PAID_TOKEN_KEY)
  if (paidToken) {
    return { remaining: Infinity, isPaid: true, paidToken }
  }

  const stored = localStorage.getItem(CREDITS_KEY)
  const remaining = stored !== null ? parseInt(stored, 10) : FREE_CREDITS
  return { remaining, isPaid: false }
}

export function decrementCredit(): void {
  if (typeof window === 'undefined') return
  const credits = getCredits()
  if (credits.isPaid) return
  const newRemaining = Math.max(0, credits.remaining - 1)
  localStorage.setItem(CREDITS_KEY, newRemaining.toString())
}

export function activatePaidAccess(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PAID_TOKEN_KEY, token)
}

export function hasCredits(): boolean {
  const credits = getCredits()
  return credits.isPaid || credits.remaining > 0
}
