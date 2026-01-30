export function isTokenLeaf(v: any): v is { $value: any } {
  return !!v && typeof v === 'object' && ('$value' in v)
}

export function parseReference(raw: any): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  // only support pure reference like "{content.primary}"
  const m = s.match(/^\{([^}]+)\}$/)
  return m ? m[1].trim() : null
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function setByPath(obj: any, path: string, value: any) {
  const parts = path.split('.').filter(Boolean)
  let cur = obj
  for (let i=0;i<parts.length;i++){
    const k = parts[i]
    if (i === parts.length-1) {
      cur[k] = value
    } else {
      if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
      cur = cur[k]
    }
  }
}

export function getByPath(obj: any, path: string): any {
  const parts = path.split('.').filter(Boolean)
  let cur = obj
  for (const k of parts) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

export function downloadText(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function nowIso() {
  return new Date().toISOString()
}
