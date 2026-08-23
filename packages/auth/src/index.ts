export interface AccessTokenSession {
  accessToken: string
  expiresAt: number
}

let current: AccessTokenSession | null = null

export function setSession(session: AccessTokenSession | null): void {
  current = session
}

export async function getAccessToken(): Promise<string | null> {
  if (!current) return null
  const now = Date.now() / 1000
  if (now >= current.expiresAt - 30) return null
  return current.accessToken
}

export function hasActiveSession(): boolean {
  if (!current) return false
  return Date.now() / 1000 < current.expiresAt - 30
}

export function clearSession(): void {
  current = null
}
