import { describe, it, expect } from 'vitest'
import { suggestCategory } from './CategoryService'

describe('suggestCategory', () => {
  it('suggests Kodinhoito for cleaning keywords', () => {
    expect(suggestCategory('nuohous')).toBe('Kodinhoito')
    expect(suggestCategory('Ikkunoiden pesu')).toBe('Kodinhoito')
    expect(suggestCategory('IMUROINTI')).toBe('Kodinhoito')
  })

  it('suggests Piha for garden keywords', () => {
    expect(suggestCategory('haravointi')).toBe('Piha')
    expect(suggestCategory('nurmikon leikkaus')).toBe('Piha')
  })

  it('suggests Ajoneuvot for vehicle keywords', () => {
    expect(suggestCategory('katsastus')).toBe('Ajoneuvot')
    expect(suggestCategory('rengasvaihto')).toBe('Ajoneuvot')
  })

  it('suggests Talous for finance keywords', () => {
    expect(suggestCategory('verot')).toBe('Talous')
    expect(suggestCategory('vakuutus')).toBe('Talous')
  })

  it('suggests Terveys for health keywords', () => {
    expect(suggestCategory('lääkäri')).toBe('Terveys')
    expect(suggestCategory('hammaslääkäri')).toBe('Terveys')
  })

  it('returns null for unknown keywords', () => {
    expect(suggestCategory('jotain muuta')).toBeNull()
    expect(suggestCategory('')).toBeNull()
  })
})
