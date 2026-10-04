import { describe, it, expect } from 'vitest'
import {
  normalizeName,
  isMaxed,
  addCommander,
  editCommander,
  deleteCommander,
  addManyCommanders,
  bulkNameStatus,
  parseBulkNames,
  parseImport,
} from './commanders'

const make = (name, overrides = {}) => ({
  primary: {
    name,
    stars: 6,
    level: 60,
    talents: 0,
    skills: [5, 5, 5, 5],
    ...overrides,
  },
  notes: '',
})

const deepFreeze = (list) => {
  list.forEach((c) => {
    Object.freeze(c.primary.skills)
    Object.freeze(c.primary)
    Object.freeze(c)
  })
  return Object.freeze(list)
}

describe('normalizeName', () => {
  it('trims and lowercases', () => {
    expect(normalizeName('  Foo Bar ')).toBe('foo bar')
  })
})

describe('isMaxed', () => {
  it('is true for 6 stars, level 60, all skills 5', () => {
    expect(isMaxed(make('A').primary)).toBe(true)
  })
  it('ignores talents', () => {
    expect(isMaxed(make('A', { talents: 0 }).primary)).toBe(true)
    expect(isMaxed(make('A', { talents: 74 }).primary)).toBe(true)
  })
  it('is false when stars differ', () => {
    expect(isMaxed(make('A', { stars: 5 }).primary)).toBe(false)
  })
  it('is false when level differs', () => {
    expect(isMaxed(make('A', { level: 59 }).primary)).toBe(false)
  })
  it.each([0, 1, 2, 3])('is false when skill %i is below 5', (i) => {
    const skills = [5, 5, 5, 5]
    skills[i] = 4
    expect(isMaxed(make('A', { skills }).primary)).toBe(false)
  })
})

describe('addCommander', () => {
  it('adds with timestamps and does not mutate', () => {
    const list = deepFreeze([make('Foo')])
    const result = addCommander(list, make('Bar'), 1000)
    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ createdAt: 1000, lastUpdatedAt: 1000 })
    expect(list).toHaveLength(1)
  })
  it('returns the same list for a duplicate, ignoring case and whitespace', () => {
    const list = deepFreeze([make('Foo')])
    expect(addCommander(list, make('  fOO '), 1)).toBe(list)
  })
})

describe('editCommander', () => {
  it('updates only the matching entry, keeps createdAt, bumps lastUpdatedAt', () => {
    const list = deepFreeze([
      { ...make('Foo'), createdAt: 1, lastUpdatedAt: 1 },
      { ...make('Bar'), createdAt: 2, lastUpdatedAt: 2 },
    ])
    const updated = {
      ...list[0],
      primary: { ...list[0].primary, level: 40, name: 'foo ' },
    }
    const result = editCommander(list, updated, 99)
    expect(result[0].primary.level).toBe(40)
    expect(result[0]).toMatchObject({ createdAt: 1, lastUpdatedAt: 99 })
    expect(result[1]).toBe(list[1])
  })
})

describe('deleteCommander', () => {
  it('removes by name, ignoring case and whitespace', () => {
    const list = deepFreeze([make('Foo'), make('Bar')])
    const result = deleteCommander(list, '  FOO')
    expect(result.map((c) => c.primary.name)).toEqual(['Bar'])
    expect(list).toHaveLength(2)
  })
  it('leaves the list alone when nothing matches', () => {
    const list = deepFreeze([make('Foo')])
    expect(deleteCommander(list, 'Nope')).toHaveLength(1)
  })
})

describe('addManyCommanders', () => {
  it('skips already tracked names and keeps order', () => {
    const list = deepFreeze([make('Foo')])
    const result = addManyCommanders(list, [
      make('Bar'),
      make(' foo'),
      make('Baz'),
    ])
    expect(result.map((c) => c.primary.name)).toEqual(['Foo', 'Bar', 'Baz'])
  })
  it('does not dedupe within the incoming batch (current behaviour)', () => {
    const result = addManyCommanders([], [make('Bar'), make('bar')])
    expect(result).toHaveLength(2)
  })
})

describe('bulk names', () => {
  const tracked = new Set(['foo'])
  const known = new Set(['foo', 'bar'])
  it('duplicate beats known', () => {
    expect(bulkNameStatus('Foo', tracked, known)).toBe('duplicate')
  })
  it('known is case-insensitive', () => {
    expect(bulkNameStatus('BAR', tracked, known)).toBe('known')
  })
  it('unknown otherwise', () => {
    expect(bulkNameStatus('Qux', tracked, known)).toBe('unknown')
  })
  it('parses comma separated input, trimming and dropping empties', () => {
    expect(parseBulkNames(' a , b,, ,c ,')).toEqual(['a', 'b', 'c'])
  })
})

describe('parseImport', () => {
  const existing = [make('Foo')]
  const text = (obj) => JSON.stringify(obj)

  it('rejects invalid JSON', () => {
    expect(parseImport('{nope', existing).error).toMatch(/Could not parse/)
  })
  it.each([
    ['a number', '5'],
    ['null', 'null'],
    ['missing key', text({})],
    ['non-array key', text({ 'rok-commanders': {} })],
  ])('rejects %s as invalid format', (_label, input) => {
    expect(parseImport(input, existing).error).toMatch(/Invalid file format/)
  })
  it('counts added and skipped (duplicates, missing names)', () => {
    const data = {
      'rok-commanders': [
        make('foo'),
        make('Bar'),
        { primary: {} },
        { notes: 'x' },
        make('Baz'),
      ],
    }
    const result = parseImport(text(data), existing)
    expect(result.error).toBeUndefined()
    expect(result.added).toBe(2)
    expect(result.skipped).toBe(3)
    expect(result.toAdd.map((c) => c.primary.name)).toEqual(['Bar', 'Baz'])
  })
  it('does not dedupe within the file (current behaviour)', () => {
    const result = parseImport(
      text({ 'rok-commanders': [make('Bar'), make('bar')] }),
      existing,
    )
    expect(result.added).toBe(2)
  })
})
