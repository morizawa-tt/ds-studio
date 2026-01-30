<template>
  <div class="grid">
    <section class="ds-card">
      <div class="header">
        <div class="title">{{ t('tokens') }}</div>
        <div class="subtitle">{{ t('tokensSubtitle') }}</div>
      </div>
      <div class="ds-divider"></div>

      <div class="ds-row">
        <span class="ds-tag">{{ t('level') }}</span>
        <select class="ds-select" v-model="layer">
          <option value="L4">{{ t('l4Components') }}</option>
          <option value="L3">{{ t('l3Modes') }}</option>
          <option value="L2">{{ t('l2Brands') }}</option>
          <option value="L1">{{ t('l1Primitives') }}</option>
        </select>

        <input class="ds-input" v-model="q" :placeholder="t('searchPlaceholder')" />
      </div>

      <div class="ds-divider"></div>

      <div class="list">
        <div class="row head">
          <div>{{ t('token') }}</div>
          <div>{{ t('rawColumn') }}</div>
          <div>{{ t('resolvedColumn') }}</div>
          <div>{{ t('operations') }}</div>
        </div>

        <div v-for="tok in filtered" :key="tok.path" class="row item">
          <div class="tok">
            <div class="path">{{ tok.path }}</div>
            <div class="meta">
              <span class="ds-tag">{{ tok.type || 'unknown' }}</span>
              <span class="ds-tag" v-if="tok.description">{{ tok.description }}</span>
            </div>
          </div>

          <div class="val mono">{{ rawOf(tok.path) }}</div>
          <div class="val mono">{{ tok.resolved }}</div>

          <div class="ops">
            <button class="ds-btn tiny" @click="openEdit(tok.path)">{{ t('edit') }}</button>
            <button class="ds-btn tiny subtle" @click="clear(tok.path)">{{ t('clear') }}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="ds-card">
      <div class="header">
        <div class="title">{{ t('editor') }}</div>
        <div class="subtitle">{{ t('currentColon') }} <span class="ds-kbd">{{ editPath || '—' }}</span></div>
      </div>
      <div class="ds-divider"></div>

      <div v-if="editPath">
        <TokenPicker
          label="修改 token raw 值"
          :token-path="editPath"
          :layer="layer"
          :current-raw="rawOf(editPath)"
          :current-resolved="resolvedOf(editPath)"
          :scoped-key="scopedKey(layer, editPath)"
          :ref-options="refOptions"
          @set="setOv"
          @clear="clearScoped"
        />
      </div>
      <div v-else class="empty">
        {{ t('emptyEdit') }}
      </div>

      <div class="ds-divider"></div>

      <div class="note">
        <div class="ds-badge">{{ t('note') }}</div>
        <div class="line">• {{ t('noteL3') }}</div>
        <div class="line">• {{ t('noteL2') }}</div>
        <div class="line">• {{ t('noteL4') }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useAppStore } from '../store/app'
import TokenPicker from '../components/TokenPicker.vue'
import { buildAllLayerMaps, type BrandKey, type ModeKey } from '../core/tokens'
import { resolveAll, type ResolveInput } from '../core/resolve'
import { useT } from '../i18n'

const store = useAppStore()

// translation function
const t = useT()

const layer = ref<'L1'|'L2'|'L3'|'L4'>('L4')
const q = ref('')

const maps = ref<any>(null)

const refOptions = computed(() => {
  const out: any[] = []
  const pushLayer = (layerX: any) => {
    const map = maps.value?.[layerX]
    if (!map) return
    for (const t of map.values()) out.push({ path: t.path, resolved: t.resolved, layer: layerX, type: t.type })
  }
  if (layer.value === 'L4') { pushLayer('L3'); pushLayer('L2'); pushLayer('L1') }
  else if (layer.value === 'L3') { pushLayer('L2'); pushLayer('L1') }
  else if (layer.value === 'L2') { pushLayer('L1') }
  return out
})

watchEffect(() => {
  const ctx = { brand: store.brand as BrandKey, mode: store.mode as ModeKey }
  const layerMaps = buildAllLayerMaps(ctx)
  const env = { ctx, overrides: store.overrides }
  const input: ResolveInput = { maps: layerMaps, env }
  resolveAll(input)
  maps.value = layerMaps
})

const list = computed(() => Array.from(maps.value?.[layer.value]?.values() ?? []))

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return list.value.slice(0, 260)
  return list.value.filter((t:any) => t.path.toLowerCase().includes(s)).slice(0, 260)
})

const editPath = ref('')

function scopedKey(layerX: 'L1'|'L2'|'L3'|'L4', tokenPath: string) {
  const ctx = { brand: store.brand, mode: store.mode }
  const scope = layerX === 'L1' ? 'L1:global'
    : layerX === 'L4' ? 'L4:global'
    : layerX === 'L2' ? `L2:brand:${ctx.brand}`
    : `L3:mode:${ctx.mode}`
  return `${scope}|${tokenPath}`
}

function rawOf(p: string) {
  const t = maps.value?.[layer.value]?.get(p)
  if (!t) return ''
  const k = scopedKey(layer.value, p)
  return (store.overrides[k] !== undefined) ? store.overrides[k] : t.raw
}
function resolvedOf(p: string) {
  const t = maps.value?.[layer.value]?.get(p)
  return t?.resolved ?? ''
}
function openEdit(p: string) { editPath.value = p }

function setOv(k: string, v: any) { store.setOverride(k, v) }
function clear(p: string) { store.clearOverride(scopedKey(layer.value, p)) }
function clearScoped(k: string) { store.clearOverride(k) }
</script>

<style scoped>
.grid{
  display:grid;
  grid-template-columns: 1.35fr .85fr;
  gap: 14px;
}
.header .title{ font-weight: 800; font-size: 16px; }
.header .subtitle{ margin-top: 4px; color: var(--ds-subtext); font-size: 12px; }
.list{ margin-top: 10px; }
.row{
  display:grid;
  grid-template-columns: 1.8fr 1.2fr 1.2fr .6fr;
  gap: 10px;
  padding: 10px 6px;
  border-bottom: 1px solid var(--ds-border);
}
.row.head{
  padding-top: 6px;
  color: var(--ds-subtext);
  font-size: 12px;
}
.row.item:hover{
  background: rgba(255,255,255,.03);
  border-radius: 12px;
}
.tok .path{ font-weight: 650; }
.tok .meta{ margin-top: 6px; display:flex; gap: 6px; flex-wrap: wrap; }
.val{ overflow:hidden; text-overflow: ellipsis; white-space: nowrap; }
.mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: var(--ds-muted);
}
.ops{ display:flex; gap: 8px; align-items:center; }
.tiny{ padding: 6px 10px; }
.subtle{ opacity: .85; }
.empty{ color: var(--ds-subtext); line-height: 1.7; padding: 6px; }
.note .line{ margin-top: 6px; color: var(--ds-subtext); font-size: 12px; }
@media (max-width: 1200px) {
  .grid{ grid-template-columns: 1fr; }
  .row{ grid-template-columns: 1.4fr 1fr 1fr .7fr; }
}
</style>
