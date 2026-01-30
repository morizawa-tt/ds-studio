import rawTokens from '../assets/tokens.json'
import { isTokenLeaf, parseReference, deepClone } from './utils'
import type { FlatToken, FlatTokenMap, TokenLeaf } from './types'

export type BrandKey = 'SA'|'VT'|'UM'|'VTJ'|'PU'|'MM'|'SM'
export type ModeKey = 'light'|'dark'

export interface TokenContext {
  brand: BrandKey
  mode: ModeKey
}

type TokensStudioJSON = any

const TOKENS: TokensStudioJSON = rawTokens as any

function getSetKeyFromOrderPath(orderPath: string): { setId: string, innerKey: string } {
  // e.g. "1. Brands/SA" -> setId="1", innerKey=" Brands/SA"
  const dot = orderPath.indexOf('.')
  if (dot === -1) return { setId: orderPath, innerKey: orderPath }
  const setId = orderPath.slice(0, dot)
  const innerKey = orderPath.slice(dot+1) // keep possible leading space
  return { setId, innerKey }
}

export function getTokenSet(orderPath: string): any {
  const { setId, innerKey } = getSetKeyFromOrderPath(orderPath)
  const group = (TOKENS as any)[setId]
  if (!group) return null
  return group[innerKey] ?? null
}

export function listBrands(): BrandKey[] {
  // from metadata tokenSetOrder
  const order: string[] = TOKENS?.$metadata?.tokenSetOrder ?? []
  const brands = order
    .filter(p => p.startsWith('1. Brands/'))
    .map(p => p.split('/').pop() as BrandKey)
  // unique
  return Array.from(new Set(brands)) as BrandKey[]
}

export function getPrimitivesSet(): any {
  // usually "0.Primitives/Value"
  return getTokenSet('0.Primitives/Value')
}

export function getBrandSet(brand: BrandKey): any {
  return getTokenSet(`1. Brands/${brand}`)
}

export function getColorModeSet(mode: ModeKey): any {
  const label = mode === 'light' ? 'Light mode' : 'Dark mode'
  return getTokenSet(`2. Color modes/${label}`)
}

export function getComponentsSet(): any {
  return getTokenSet('9.Components/Mode 1')
}

function flattenRec(node: any, prefix: string, out: FlatTokenMap, layer: FlatToken['layer']) {
  if (!node || typeof node !== 'object') return
  for (const [k, v] of Object.entries(node)) {
    const next = prefix ? `${prefix}.${k}` : k
    if (isTokenLeaf(v)) {
      const leaf = v as TokenLeaf
      out.set(next, {
        path: next,
        layer,
        type: (leaf as any).$type,
        description: (leaf as any).$description,
        raw: (leaf as any).$value,
      })
    } else {
      flattenRec(v, next, out, layer)
    }
  }
}

export function flattenLayer(layer: FlatToken['layer'], ctx: TokenContext) {
  const map: FlatTokenMap = new Map()
  if (layer === 'L1') flattenRec(getPrimitivesSet(), '', map, layer)
  if (layer === 'L2') flattenRec(getBrandSet(ctx.brand), '', map, layer)
  if (layer === 'L3') flattenRec(getColorModeSet(ctx.mode), '', map, layer)
  if (layer === 'L4') flattenRec(getComponentsSet(), '', map, layer)
  return map
}

export function buildAllLayerMaps(ctx: TokenContext) {
  return {
    L1: flattenLayer('L1', ctx),
    L2: flattenLayer('L2', ctx),
    L3: flattenLayer('L3', ctx),
    L4: flattenLayer('L4', ctx),
  }
}

export interface ResolveEnv {
  ctx: TokenContext
  overrides: Record<string, any> // key: scopedKey -> rawValue
}

function scopeKey(layer: FlatToken['layer'], ctx: TokenContext) {
  if (layer === 'L1') return 'L1:global'
  if (layer === 'L4') return 'L4:global'
  if (layer === 'L2') return `L2:brand:${ctx.brand}`
  return `L3:mode:${ctx.mode}`
}

export function getOverride(env: ResolveEnv, layer: FlatToken['layer'], tokenPath: string): any | undefined {
  const k = `${scopeKey(layer, env.ctx)}|${tokenPath}`
  return env.overrides[k]
}

export function setOverride(env: ResolveEnv, layer: FlatToken['layer'], tokenPath: string, rawValue: any) {
  const k = `${scopeKey(layer, env.ctx)}|${tokenPath}`
  env.overrides[k] = rawValue
}

export function cloneTokensForExport(ctx: TokenContext) {
  // deep clone original tokens (for future use); currently export uses resolved maps
  return deepClone(TOKENS)
}

export function getTokensMeta() {
  return TOKENS?.$metadata ?? {}
}
