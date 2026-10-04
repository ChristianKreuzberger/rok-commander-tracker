// Pure helpers for commander data. No React, no localStorage.

export function normalizeName(name) {
  return name.trim().toLowerCase()
}

export function isMaxed(primary) {
  return (
    primary.stars === 6 &&
    primary.level === 60 &&
    primary.skills.every((s) => s === 5)
  )
}

export function addCommander(list, commander, now = Date.now()) {
  const name = normalizeName(commander.primary.name)
  if (list.some((c) => normalizeName(c.primary.name) === name)) return list
  return [...list, { ...commander, createdAt: now, lastUpdatedAt: now }]
}

export function editCommander(list, updated, now = Date.now()) {
  const name = normalizeName(updated.primary.name)
  return list.map((c) =>
    normalizeName(c.primary.name) === name
      ? { ...updated, lastUpdatedAt: now }
      : c,
  )
}

export function deleteCommander(list, name) {
  const target = normalizeName(name)
  return list.filter((c) => normalizeName(c.primary.name) !== target)
}

// Only skips names already tracked; duplicates inside `incoming` are kept.
export function addManyCommanders(list, incoming) {
  const tracked = new Set(list.map((c) => normalizeName(c.primary.name)))
  return [
    ...list,
    ...incoming.filter((c) => !tracked.has(normalizeName(c.primary.name))),
  ]
}

// 'duplicate' (already tracked) beats 'known' (in the commander database).
export function bulkNameStatus(name, trackedNames, knownNames) {
  const lower = name.toLowerCase()
  if (trackedNames.has(lower)) return 'duplicate'
  if (knownNames.has(lower)) return 'known'
  return 'unknown'
}

export function parseBulkNames(input) {
  return input
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
}

// Entries without a primary name are dropped (and count as skipped by callers).
export function selectImportable(incoming, existing) {
  const existingNames = new Set(
    existing.map((c) => c.primary?.name?.trim().toLowerCase()),
  )
  return incoming.filter(
    (c) => c.primary?.name && !existingNames.has(normalizeName(c.primary.name)),
  )
}

export function parseImport(text, existing) {
  try {
    const parsed = JSON.parse(text)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray(parsed['rok-commanders'])
    ) {
      return { error: 'Invalid file format. Expected a RoK Tracker export.' }
    }
    const incoming = parsed['rok-commanders']
    const toAdd = selectImportable(incoming, existing)
    return {
      added: toAdd.length,
      skipped: incoming.length - toAdd.length,
      toAdd,
      data: parsed,
    }
  } catch {
    return {
      error: 'Could not parse file. Make sure it is a valid JSON export.',
    }
  }
}
