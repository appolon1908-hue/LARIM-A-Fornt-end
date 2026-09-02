import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appDirectory = dirname(fileURLToPath(import.meta.url))
const applicationRoot = resolve(appDirectory, '..')

function read(relativePath: string): string {
  return readFileSync(resolve(applicationRoot, relativePath), 'utf8')
}

describe('LARIMÍA customer web surface', () => {
  const requiredPages = [
    'index.vue',
    'book.vue',
    'bookings.vue',
    'checkout.vue',
    'membership.vue',
    'safety.vue',
  ]

  it.each(requiredPages)('registers the required %s page', (page) => {
    expect(existsSync(resolve(applicationRoot, 'app/pages', page))).toBe(true)
  })

  it('renders the Nuxt page outlet and links the primary customer journeys', () => {
    const shell = read('app/app.vue')

    expect(shell).toContain('<NuxtPage')
    for (const route of ['/', '/book', '/bookings', '/membership', '/safety']) {
      expect(shell).toContain(`to="${route}"`)
    }
  })

  it('keeps strict TypeScript and a server-configurable API boundary', () => {
    const config = read('nuxt.config.ts')

    expect(config).toContain("process.env.NUXT_PUBLIC_API_BASE_URL")
    expect(config).toContain("typescript: { strict: true }")
    expect(config).toContain("width=device-width, initial-scale=1")
  })

  it('does not put credentials or private provider configuration in Nuxt source', () => {
    const config = read('nuxt.config.ts').toLowerCase()

    for (const prohibited of ['client_secret', 'private_key', 'database_url', 'provider_token']) {
      expect(config).not.toContain(prohibited)
    }
  })
})
