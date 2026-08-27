export interface WebAuthSession {
  authenticated: boolean
  expiresAt: number | null
  csrfToken?: string | null
}

export function useWebAuth() {
  const session = useState<WebAuthSession>('web-auth-session', () => ({
    authenticated: false,
    expiresAt: null,
    csrfToken: null,
  }))
  const loading = useState<boolean>('web-auth-loading', () => false)

  async function refresh() {
    loading.value = true
    try {
      session.value = await $fetch<WebAuthSession>('/api/auth/session', {
        credentials: 'include',
      })
    } catch {
      session.value = {
        authenticated: false,
        expiresAt: null,
        csrfToken: null,
      }
    } finally {
      loading.value = false
    }
    return session.value
  }

  function login(returnTo = '/') {
    if (typeof window === 'undefined') return
    window.location.assign(
      `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
    )
  }

  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: session.value.csrfToken
        ? { 'X-CSRF-Token': session.value.csrfToken }
        : undefined,
    })
    session.value = {
      authenticated: false,
      expiresAt: null,
      csrfToken: null,
    }
    await navigateTo('/login')
  }

  return { session, loading, refresh, login, logout }
}
