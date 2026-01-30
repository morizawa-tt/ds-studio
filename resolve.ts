import type { FlatTokenMap, FlatToken } from './types'
import type { ResolveEnv } from './tokens'
import { parseReference } from './utils'
import { getOverride } from './tokens'

export interface ResolveInput {
  maps: { L1: FlatTokenMap, L2: FlatTokenMap, L3: FlatTokenMap, L4: FlatTokenMap }
  env: ResolveEnv
}

function lookupToken(path: string, input: ResolveInput): { tok: FlatToken, layer: FlatToken['layer'] } | null {
  // priority: overrides handled outside, lookup by maps in L4->L3->L2->L1
  const order: FlatToken['layer'][] = ['L4','L3','L2','L1']
  for (const layer of order) {
    const map = input.maps[layer]
    const t = map.get(path)
    if (t) return { tok: t, layer }
  }
  return null
}

export function resolveToken(path: string, input: ResolveInput, stack: string[] = []): any {
  if (stack.includes(path)) {
    // circular reference guard
    return `{CYCLE:${path}}`
  }
  const found = lookupToken(path, input)
  if (!found) return `{MISSING:${path}}`
  const { tok, layer } = found

  // override?
  const ov = getOverride(input.env, layer, path)
  const raw = ov !== undefined ? ov : tok.raw

  const ref = parseReference(raw)
  if (ref) {
    return resolveToken(ref, input, [...stack, path])
  }
  return raw
}

export function resolveAll(input: ResolveInput) {
  // mutate maps to include resolved
  const order: FlatToken['layer'][] = ['L1','L2','L3','L4']
  for (const layer of order) {
    const map = input.maps[layer]
    for (const t of map.values()) {
      t.resolved = resolveToken(t.path, input)
    }
  }
}
