export type TokenType =
  | 'color'
  | 'number'
  | 'string'
  | 'typography'
  | 'shadow'
  | 'gradient'
  | 'border'
  | 'dimension'
  | 'other'
  | string

export interface TokenLeaf {
  $value: any
  $type?: TokenType
  $description?: string
}

export interface FlatToken {
  path: string            // e.g. "button.color.primary-filled-fill-default"
  type?: TokenType
  description?: string
  raw: any                // original $value (may be reference like "{brand.fill-primary}")
  resolved?: any          // resolved value based on brand/mode
  layer: 'L1'|'L2'|'L3'|'L4'
}

export type FlatTokenMap = Map<string, FlatToken>
