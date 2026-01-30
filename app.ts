import { defineStore } from 'pinia'
import { listBrands, type BrandKey, type ModeKey } from '../core/tokens'

type Layer = 'L1'|'L2'|'L3'|'L4'

function loadOverrides(): Record<string, any> {
  try {
    const s = localStorage.getItem('ds-studio:overrides')
    return s ? JSON.parse(s) : {}
  } catch {
    return {}
  }
}
function saveOverrides(v: Record<string, any>) {
  localStorage.setItem('ds-studio:overrides', JSON.stringify(v))
}

export const useAppStore = defineStore('app', {
  state: () => ({
    brand: (listBrands()[0] ?? 'SA') as BrandKey,
    mode: 'dark' as ModeKey,
    // current interface language: 'zh' (Chinese) or 'en' (English). Default is Chinese
    lang: 'zh' as 'zh' | 'en',
    overrides: loadOverrides() as Record<string, any>,
    search: '',
    activeComponent: 'button' as 'button'|'input'|'slider'|'label'|'hint-text',
  }),
  actions: {
    setBrand(b: BrandKey) { this.brand = b },
    setMode(m: ModeKey) { this.mode = m },
    /**
     * Set current UI language. Supported values: 'zh' for Chinese (default) and 'en' for English.
     */
    setLang(l: 'zh' | 'en') { this.lang = l },
    setSearch(s: string) { this.search = s },
    setActiveComponent(c: any) { this.activeComponent = c },
    setOverride(scopedKey: string, rawValue: any) {
      this.overrides[scopedKey] = rawValue
      saveOverrides(this.overrides)
    },
    clearOverride(scopedKey: string) {
      delete this.overrides[scopedKey]
      saveOverrides(this.overrides)
    },
    resetAllOverrides() {
      this.overrides = {}
      saveOverrides(this.overrides)
    }
  }
})
