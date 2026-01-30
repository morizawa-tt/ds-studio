<template>
  <div class="picker">
    <div class="row head">
      <div class="label">{{ label }}</div>
      <div class="hint" v-if="hint">{{ hint }}</div>
    </div>

    <div class="row controls" v-if="editable">
      <TokenRefSelect
        v-model="refPath"
        :options="allowedOptions"
        :placeholder="t('placeholderSearch')"
        :show-preview="true"
      />
      <button class="ds-btn" @click="applyRef">{{ t('apply') }}</button>
      <button class="ds-btn subtle" @click="clear">{{ t('clearChange') }}</button>
    </div>

    <div v-else class="lock">
      <div class="ds-tag">{{ t('l1NoRef') }}</div>
      <div class="lock-sub">{{ t('l1Suggestion') }}</div>
    </div>

    <div class="warn" v-if="warning">{{ warning }}</div>
    <div class="err" v-if="error">{{ error }}</div>

    <div class="preview">
      <div class="meta">
        <span class="ds-tag">{{ t('currentRaw') }}：<b>{{ currentRawText }}</b></span>
        <span class="ds-tag">{{ t('resolved') }}：<b>{{ currentResolved }}</b></span>
        <span class="ds-tag" v-if="scopedKey">{{ t('scope') }}：<b>{{ scopedKey }}</b></span>
      </div>

      <div class="swatch" v-if="isColor(currentResolved)" :style="{ background: String(currentResolved) }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TokenRefSelect from './TokenRefSelect.vue'
import { useT } from '../i18n'

type Opt = { path: string; resolved: any; layer?: string; type?: string }

const props = defineProps<{
  label: string
  hint?: string
  tokenPath: string
  layer: 'L1'|'L2'|'L3'|'L4'
  currentRaw: any
  currentResolved: any
  scopedKey: string
  refOptions?: Opt[]
}>()

const emit = defineEmits<{
  (e: 'set', scopedKey: string, rawValue: any): void
  (e: 'clear', scopedKey: string): void
}>()

const refPath = ref('')
const warning = ref('')
const error = ref('')

const editable = computed(() => props.layer !== 'L1')

// translation function
const t = useT()

watch(() => props.currentRaw, (v) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (/^\{[^}]+\}$/.test(s)) {
    refPath.value = s.slice(1, -1)
    warning.value = ''
  } else {
    // 当前 raw 不是 token 引用：允许用户通过选择 token 来覆盖它
    refPath.value = ''
    warning.value = editable.value
      ? t('notTokenRef')
      : t('l1Warning')
  }
  error.value = ''
}, { immediate: true })

const currentRawText = computed(() => {
  const v = props.currentRaw
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return String(v) }
})

const allowedOptions = computed(() => {
  const all = props.refOptions ?? []
  // enforce one-way references (recommended): L4→L3→L2→L1
  // L4 can reference L3/L2/L1; L3 can reference L2/L1; L2 can reference L1; L1 no refs
  const allowLayers =
    props.layer === 'L4' ? new Set(['L3','L2','L1']) :
    props.layer === 'L3' ? new Set(['L2','L1']) :
    props.layer === 'L2' ? new Set(['L1']) :
    new Set<string>([])
  const filtered = all.filter(o => !o.layer || allowLayers.has(o.layer))
  // prefer show color tokens earlier when searching blank
  if (!refPath.value.trim()) {
    const colors = filtered.filter(o => isColor(o.resolved))
    const rest = filtered.filter(o => !isColor(o.resolved))
    return [...colors, ...rest].slice(0, 240)
  }
  return filtered
})

function applyRef() {
  const p = refPath.value.trim()
  if (!p) {
    error.value = t('selectAToken')
    return
  }
  const exists = allowedOptions.value.some(o => o.path === p)
  if (!exists) {
    error.value = t('tokenNotExist')
    return
  }
  emit('set', props.scopedKey, `{${p}}`)
  error.value = ''
}

function clear() {
  emit('clear', props.scopedKey)
  error.value = ''
}

function isColor(v: any) {
  return typeof v === 'string' && v.trim().startsWith('#')
}
</script>

<style scoped>
.picker{
  border: 1px solid var(--ds-border);
  border-radius: 14px;
  padding: 14px;
  background: rgba(255,255,255,.03);
}
.row{ display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
.head{ justify-content: space-between; }
.label{ font-weight: 720; }
.hint{ font-size: 12px; color: var(--ds-subtext); }
.controls{ margin-top: 10px; align-items: stretch; }
.subtle{ opacity: .85; }
.warn{
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255,255,255,.72);
}
.err{
  margin-top: 8px;
  font-size: 12px;
  color: var(--ds-danger);
}
.lock{
  margin-top: 10px;
  padding: 12px;
  border-radius: 14px;
  border: 1px dashed rgba(255,255,255,.18);
  background: rgba(255,255,255,.02);
}
.lock-sub{ margin-top: 6px; font-size: 12px; color: var(--ds-subtext); line-height: 1.5; }
.preview{ margin-top: 12px; display:flex; justify-content: space-between; gap: 10px; align-items:center; }
.meta{ display:flex; gap: 8px; flex-wrap: wrap; }
.swatch{
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--ds-border);
}
b{ font-weight: 750; }
</style>