<template>
  <div class="layout">
    <section class="left ds-card">
      <div class="header">
        <div class="title">{{ t('componentLab') }}</div>
        <div class="subtitle">{{ t('componentLabSubtitle') }}</div>
      </div>

      <div class="ds-divider"></div>

      <div class="fields">
        <div class="field">
          <div class="field-label">{{ t('currentComponent') }}</div>
          <select class="ds-select" v-model="activeComponent">
            <option value="button">button</option>
            <option value="input">input</option>
            <option value="slider">slider</option>
            <option value="label">label</option>
            <option value="hint-text">hint-text</option>
          </select>
        </div>

        <div class="field" v-if="activeComponent==='button'">
          <div class="field-label">{{ t('buttonVariant') }}</div>
          <select class="ds-select" v-model="btnVariant">
            <option value="primary-filled">primary-filled</option>
            <option value="neutral-ghost">neutral-ghost</option>
            <option value="neutral-lighter">neutral-lighter</option>
            <option value="up-filled">up-filled</option>
            <option value="down-filled">down-filled</option>
          </select>
        </div>

        <div class="field" v-if="activeComponent==='button'">
          <div class="field-label">{{ t('state') }}</div>
          <select class="ds-select" v-model="btnState">
            <option value="default">default</option>
            <option value="hover">hover</option>
            <option value="pressed">pressed</option>
            <option value="disabled">disabled</option>
          </select>
        </div>
      </div>

        <div class="preview ds-card">
        <div class="pv-title">{{ t('preview') }}</div>

        <div v-if="activeComponent==='button'" class="pv-area">
          <button :disabled="btnState==='disabled'" class="demo-btn" :style="buttonStyle">
            按钮 / {{ btnVariant }} / {{ btnState }}
          </button>
        </div>

        <div v-else-if="activeComponent==='input'" class="pv-area">
          <input class="demo-input" :style="inputStyle" placeholder="Input - 输入框预览" />
        </div>

        <div v-else-if="activeComponent==='slider'" class="pv-area">
          <div class="demo-slider">
            <div class="track" :style="sliderTrackStyle"></div>
            <div class="thumb" :style="sliderThumbStyle"></div>
          </div>
        </div>

        <div v-else-if="activeComponent==='label'" class="pv-area">
          <div class="demo-label" :style="labelStyle">Label 文本</div>
        </div>

        <div v-else class="pv-area">
          <div class="demo-hint" :style="hintStyle">Hint text / 辅助说明</div>
        </div>
      </div>

      <div class="ds-divider"></div>

      <div class="tips">
        <div class="ds-badge">{{ t('tips') }}</div>
        <div class="tipline">• {{ t('tipRaw') }}</div>
        <div class="tipline">• {{ t('tipExport') }}</div>
      </div>
    </section>

    <section class="right ds-card">
      <div class="header">
        <div class="title">{{ t('propertyPanel') }}</div>
        <div class="subtitle">{{ t('currentScope') }}：<span class="ds-kbd">{{ scopeLabel }}</span></div>
      </div>

      <div class="ds-divider"></div>

      <div v-if="activeComponent==='button'" class="panel">
        <TokenPicker
          :label="t('labelFill')"
          :token-path="fillToken"
          layer="L4"
          :current-raw="getRaw('L4', fillToken)"
          :current-resolved="getResolved('L4', fillToken)"
          :scoped-key="scopedKey('L4', fillToken)"
          :ref-options="refOptions"
          @set="setOv"
          @clear="clearOv"
        />
        <TokenPicker
          :label="t('labelContent')"
          :token-path="contentToken"
          layer="L4"
          :current-raw="getRaw('L4', contentToken)"
          :current-resolved="getResolved('L4', contentToken)"
          :scoped-key="scopedKey('L4', contentToken)"
          :ref-options="refOptions"
          @set="setOv"
          @clear="clearOv"
        />
        <TokenPicker
          :label="t('paddingH')"
          token-path="button.spacing.container-padding-horizontal-m"
          layer="L4"
          :current-raw="getRaw('L4','button.spacing.container-padding-horizontal-m')"
          :current-resolved="getResolved('L4','button.spacing.container-padding-horizontal-m')"
          :scoped-key="scopedKey('L4','button.spacing.container-padding-horizontal-m')"
          :ref-options="refOptions"
          @set="setOv"
          @clear="clearOv"
        />
        <TokenPicker
          :label="t('paddingV')"
          token-path="button.spacing.container-padding-vertical-m"
          layer="L4"
          :current-raw="getRaw('L4','button.spacing.container-padding-vertical-m')"
          :current-resolved="getResolved('L4','button.spacing.container-padding-vertical-m')"
          :scoped-key="scopedKey('L4','button.spacing.container-padding-vertical-m')"
          :ref-options="refOptions"
          @set="setOv"
          @clear="clearOv"
        />
      </div>

      <div v-else class="panel">
        <div class="placeholder">
          {{ t('placeholderDemo') }}  
          <br/>{{ t('placeholderExample') }}
          <div class="ds-divider"></div>
          <div class="ds-tag">{{ t('placeholderExample') }}</div>
        </div>
      </div>

      <div class="ds-divider"></div>

      <div class="debug ds-col">
        <div class="ds-tag">{{ t('debug') }}</div>
        <div class="mono">
          fillToken: {{ fillToken }} → {{ getResolved('L4', fillToken) }}<br/>
          contentToken: {{ contentToken }} → {{ getResolved('L4', contentToken) }}
        </div>
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

const activeComponent = computed({
  get: () => store.activeComponent,
  set: (v) => store.setActiveComponent(v)
})

const btnVariant = ref<'primary-filled'|'neutral-ghost'|'neutral-lighter'|'up-filled'|'down-filled'>('primary-filled')
const btnState = ref<'default'|'hover'|'pressed'|'disabled'>('default')

const scopeLabel = computed(() => `${store.brand} / ${store.mode}`)

const maps = ref<any>(null)
const resolved = ref<any>(null)

const refOptions = computed(() => {
  const out: any[] = []
  const order: any[] = ['L3','L2','L1']
  for (const layer of order) {
    const map = maps.value?.[layer]
    if (!map) continue
    for (const t of map.values()) {
      out.push({ path: t.path, resolved: t.resolved, layer, type: t.type })
    }
  }
  return out
})

watchEffect(() => {
  const ctx = { brand: store.brand as BrandKey, mode: store.mode as ModeKey }
  const layerMaps = buildAllLayerMaps(ctx)
  const env = { ctx, overrides: store.overrides }
  const input: ResolveInput = { maps: layerMaps, env }
  resolveAll(input)
  maps.value = layerMaps
  resolved.value = input
})

function scopedKey(layer: 'L1'|'L2'|'L3'|'L4', tokenPath: string) {
  // must match core/tokens scopeKey rules
  const ctx = { brand: store.brand, mode: store.mode }
  const scope = layer === 'L1' ? 'L1:global'
    : layer === 'L4' ? 'L4:global'
    : layer === 'L2' ? `L2:brand:${ctx.brand}`
    : `L3:mode:${ctx.mode}`
  return `${scope}|${tokenPath}`
}

function getToken(layer: 'L1'|'L2'|'L3'|'L4', tokenPath: string) {
  return maps.value?.[layer]?.get(tokenPath)
}
function getRaw(layer: any, tokenPath: string) {
  const t = getToken(layer, tokenPath)
  if (!t) return ''
  const k = scopedKey(layer, tokenPath)
  return (store.overrides[k] !== undefined) ? store.overrides[k] : t.raw
}
function getResolved(layer: any, tokenPath: string) {
  const t = getToken(layer, tokenPath)
  return t?.resolved ?? ''
}

function setOv(k: string, v: any) { store.setOverride(k, v) }
function clearOv(k: string) { store.clearOverride(k) }

function buttonToken(variant: string, kind: 'fill'|'content', state: string) {
  // fix naming quirks in source tokens.json
  // 1) down-filled hover has double hyphen: down-filled-fill--hover
  // 2) up/down content uses buy/sell naming
  const stateKey = (variant === 'down-filled' && kind === 'fill' && state === 'hover')
    ? '--hover'
    : state

  if (kind === 'content') {
    if (variant === 'up-filled') variant = 'buy-filled'
    if (variant === 'down-filled') variant = 'sell-filled'
  }

  const suffix = (variant === 'down-filled' && kind === 'fill' && state === 'hover')
    ? `fill${stateKey}`
    : `${kind}-${stateKey}`

  // when stateKey is '--hover', suffix becomes 'fill--hover'
  return `button.color.${variant}-${suffix}`
}

const fillToken = computed(() => buttonToken(btnVariant.value, 'fill', btnState.value))
const contentToken = computed(() => buttonToken(btnVariant.value, 'content', btnState.value))

const buttonStyle = computed(() => {
  const fill = getResolved('L4', fillToken.value)
  const content = getResolved('L4', contentToken.value)
  const px = Number(getResolved('L4','button.spacing.container-padding-horizontal-m') ?? 12)
  const py = Number(getResolved('L4','button.spacing.container-padding-vertical-m') ?? 8)

  return {
    background: String(fill),
    color: String(content),
    border: '1px solid rgba(255,255,255,.10)',
    padding: `${py}px ${px}px`,
    borderRadius: '12px',
    fontWeight: 650,
  } as any
})

const inputStyle = computed(() => ({
  background: String(getResolved('L3','bg.secondary')),
  color: String(getResolved('L3','content.primary')),
  border: `1px solid ${String(getResolved('L3','border.primary'))}`,
  padding: '10px 12px',
  borderRadius: '12px',
  width: '320px'
}))

const sliderTrackStyle = computed(() => ({
  background: String(getResolved('L3','bg.tertiary')),
}))
const sliderThumbStyle = computed(() => ({
  background: String(getResolved('L3','brand.fill-primary')),
  border: `2px solid ${String(getResolved('L3','bg.primary'))}`,
}))
const labelStyle = computed(() => ({
  color: String(getResolved('L3','content.primary')),
  fontWeight: 700,
}))
const hintStyle = computed(() => ({
  color: String(getResolved('L3','content.tertiary')),
}))
</script>

<style scoped>
.layout{
  display: grid;
  grid-template-columns: 1.2fr .9fr;
  gap: 14px;
}
.header .title{ font-weight: 800; font-size: 16px; }
.header .subtitle{ margin-top: 4px; color: var(--ds-subtext); font-size: 12px; }
.fields{
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: end;
}
.field{
  display:flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  flex: 1;
}
.field-label{
  font-size: 12px;
  color: var(--ds-subtext);
  white-space: nowrap;
}
.preview{ margin-top: 12px; padding: 14px; }
.pv-title{ font-weight: 700; color: var(--ds-subtext); margin-bottom: 10px; }
.pv-area{ display:flex; align-items:center; gap: 12px; min-height: 88px; }
.demo-btn{
  border: none;
  outline: none;
  cursor: pointer;
}
.demo-input{
  border: none;
  outline: none;
}
.demo-slider{ position: relative; width: 320px; height: 30px; }
.track{
  position:absolute; left:0; right:0; top: 50%;
  height: 8px; border-radius: 999px;
  transform: translateY(-50%);
  border: 1px solid var(--ds-border);
}
.thumb{
  position:absolute; top: 50%; left: 60%;
  width: 20px; height: 20px;
  border-radius: 999px;
  transform: translate(-50%,-50%);
}
.demo-label{ font-size: 18px; }
.demo-hint{ font-size: 14px; }
.tips{ margin-top: 10px; }
.tipline{ margin-top: 6px; color: var(--ds-subtext); font-size: 12px; }
.panel{ display:flex; flex-direction: column; gap: 12px; }
.placeholder{
  color: var(--ds-subtext);
  line-height: 1.6;
}
.debug .mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: var(--ds-muted);
  line-height: 1.5;
}
@media (max-width: 1100px) {
  .layout{ grid-template-columns: 1fr; }
}
</style>
