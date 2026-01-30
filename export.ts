import type { FlatTokenMap } from './types'
import { setByPath, nowIso } from './utils'
import type { BrandKey, ModeKey } from './tokens'

type Platform = 'web'|'ios'|'android'

function normalizeColorToHex8(color: string): string {
  // accept #RGB/#RRGGBB/#RRGGBBAA ; output #RRGGBBAA
  let c = color.trim()
  if (!c.startsWith('#')) return c
  c = c.slice(1)
  if (c.length === 3) c = c.split('').map(ch => ch + ch).join('') + 'FF'
  if (c.length === 6) c = c + 'FF'
  if (c.length === 8) return '#' + c.toUpperCase()
  return '#' + c.toUpperCase()
}

function toAndroidHex(color: string): string {
  // #RRGGBBAA -> #AARRGGBB
  const hex8 = normalizeColorToHex8(color).slice(1)
  const rrggbb = hex8.slice(0,6)
  const aa = hex8.slice(6,8)
  return ('#' + aa + rrggbb).toUpperCase()
}

function formatValue(platform: Platform, v: any, type?: string) {
  if (type === 'color' && typeof v === 'string' && v.trim().startsWith('#')) {
    if (platform === 'web') {
      // keep #RRGGBB if opaque
      const hex8 = normalizeColorToHex8(v)
      return hex8.endsWith('FF') ? ('#' + hex8.slice(1,7)) : hex8
    }
    if (platform === 'ios') return normalizeColorToHex8(v)
    if (platform === 'android') return toAndroidHex(v)
  }
  return v
}

export function buildResolvedObject(
  maps: { L1: FlatTokenMap, L2: FlatTokenMap, L3: FlatTokenMap, L4: FlatTokenMap },
  platform: Platform
) {
  const out: any = {}
  const all = new Map<string, { resolved:any, type?: string }>()
  for (const layer of ['L1','L2','L3','L4'] as const) {
    for (const t of maps[layer].values()) {
      all.set(t.path, { resolved: t.resolved, type: t.type })
    }
  }
  for (const [path, info] of all.entries()) {
    setByPath(out, path, formatValue(platform, info.resolved, info.type))
  }
  return out
}

export function buildExportJson(args: {
  brand: BrandKey
  mode: ModeKey
  platform: Platform
  resolvedTokens: any
}) {
  return {
    meta: {
      brand: args.brand,
      mode: args.mode,
      platform: args.platform,
      generatedAt: nowIso(),
      generator: 'DS studio (Vue)',
    },
    tokens: args.resolvedTokens,
  }
}
