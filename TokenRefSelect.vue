<template>
  <div class="refselect" ref="root">
    <div class="inputwrap">
      <input
        class="ds-input"
        :placeholder="placeholder"
        v-model="query"
        @focus="open = true"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="commitHighlighted()"
        @keydown.esc.prevent="open = false"
      />
      <button class="iconbtn" type="button" @click="toggle" :aria-label="open ? '关闭' : '打开'">
        <span class="chev" :class="{ open }">▾</span>
      </button>
    </div>

      <div v-if="open" class="dropdown">
      <div class="top">
        <div class="count">{{ countText }}</div>
        <div class="hint">{{ hintText }}</div>
      </div>

      <div class="list" role="listbox">
        <div
          v-for="(opt, idx) in filtered"
          :key="opt.path"
          class="opt"
          :class="{ active: idx === highlighted }"
          @mousedown.prevent="select(opt.path)"
          role="option"
        >
          <span class="dot" :class="{ none: !isColor(opt.resolved) }" :style="dotStyle(opt.resolved)"></span>
          <div class="main">
            <div class="path">{{ opt.path }}</div>
            <div class="preview" v-if="showPreview">
              <span class="mono">{{ previewText(opt.resolved) }}</span>
              <span class="layer" v-if="opt.layer">{{ opt.layer }}</span>
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="empty">
          {{ emptyText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useT } from '../i18n'

type Opt = { path: string; resolved: any; layer?: string; type?: string }

const props = defineProps<{
  modelValue: string
  options: Opt[]
  placeholder?: string
  showPreview?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const query = ref(props.modelValue || '')
const highlighted = ref(0)


watch(() => props.modelValue, (v) => {
  if (v !== query.value) query.value = v || ''
})

watch(query, (v) => {
  emit('update:modelValue', v)
  highlighted.value = 0
})

const filtered = computed(() => {
  const s = (query.value || '').trim().toLowerCase()
  const arr = props.options || []
  if (!s) return arr.slice(0, 240)
  return arr.filter(o => o.path.toLowerCase().includes(s)).slice(0, 240)
})

// translation function and computed texts defined after `filtered` to avoid reference errors
const t = useT()
const countText = computed(() => {
  const n = filtered.value.length
  return `${t('resultsCountPrefix')} ${n} ${t('resultsCountSuffix')}`
})
const hintText = computed(() => t('selectHint'))
const emptyText = computed(() => t('noMatch'))

function toggle() { open.value = !open.value }

function select(p: string) {
  query.value = p
  open.value = false
}

function move(step: number) {
  if (!open.value) open.value = true
  const max = Math.max(0, filtered.value.length - 1)
  highlighted.value = Math.min(max, Math.max(0, highlighted.value + step))
}

function commitHighlighted() {
  const opt = filtered.value[highlighted.value]
  if (opt) select(opt.path)
  else open.value = false
}

function isColor(v: any) {
  return typeof v === 'string' && v.trim().startsWith('#')
}
function dotStyle(v: any) {
  if (!isColor(v)) return {}
  return { background: String(v) }
}
function previewText(v: any) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return s.length > 26 ? s.slice(0, 26) + '…' : s
}

function onDocDown(e: MouseEvent) {
  const el = root.value
  if (!el) return
  if (!el.contains(e.target as any)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocDown))
</script>

<style scoped>
.refselect{ position: relative; width: 100%; }
.inputwrap{
  position: relative;
  display: flex;
  align-items: center;
}
.iconbtn{
  position:absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ds-subtext);
  width: 28px;
  height: 28px;
  border-radius: 10px;
  cursor: pointer;
}
.iconbtn:hover{ background: rgba(255,255,255,.06); border-color: var(--ds-border); }
.chev{ display:inline-block; transition: transform .15s ease; }
.chev.open{ transform: rotate(180deg); }

.dropdown{
  position:absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  border: 1px solid var(--ds-border);
  border-radius: 14px;
  background: rgba(16,18,26,.96);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 30px rgba(0,0,0,.45);
  overflow: hidden;
}
.top{
  display:flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ds-border);
  color: var(--ds-subtext);
  font-size: 12px;
}
.list{ max-height: 320px; overflow:auto; padding: 6px; }
.opt{
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  cursor: pointer;
}
.opt:hover{ background: rgba(255,255,255,.05); }
.opt.active{ background: rgba(114,98,253,.14); border: 1px solid rgba(114,98,253,.25); }
.dot{
  width: 14px; height: 14px;
  border-radius: 999px;
  border: 1px solid var(--ds-border-2);
  flex: 0 0 auto;
}
.dot.none{
  background: rgba(255,255,255,.06);
}
.main{ min-width: 0; }
.path{ font-weight: 650; }
.preview{
  margin-top: 4px;
  display:flex;
  gap: 8px;
  align-items:center;
}
.mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: var(--ds-muted);
}
.layer{
  font-size: 11px;
  color: var(--ds-subtext);
  border: 1px solid var(--ds-border);
  border-radius: 999px;
  padding: 1px 8px;
  background: rgba(255,255,255,.03);
}
.empty{
  padding: 14px 12px;
  color: var(--ds-subtext);
  font-size: 12px;
}
</style>