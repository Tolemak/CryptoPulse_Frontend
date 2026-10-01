import { describe, expect, it } from 'vitest'
import { htaccessWithApiOrigin } from '../vite.config'

const template = `Header always set Content-Security-Policy "default-src 'self'; connect-src 'self' https://old.example.com; object-src 'none'"`

describe('htaccessWithApiOrigin', () => {
  it('puts the API origin into connect-src and keeps the other directives', () => {
    expect(htaccessWithApiOrigin(template, 'https://api.example.com/v1/')).toBe(
      `Header always set Content-Security-Policy "default-src 'self'; connect-src 'self' https://api.example.com; object-src 'none'"`,
    )
  })

  it('fails without an API URL', () => {
    expect(() => htaccessWithApiOrigin(template, undefined)).toThrow('VITE_API_BASE_URL')
  })

  it('fails when the template has no connect-src to update', () => {
    expect(() => htaccessWithApiOrigin('Header set X 1', 'https://api.example.com')).toThrow('connect-src')
  })
})
