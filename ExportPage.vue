<template>
  <div class="ds-card">
    <div class="header">
      <div class="title">{{ t('exportTokens') }}</div>
      <div class="subtitle">{{ t('exportSubtitle') }}</div>
    </div>

    <div class="ds-divider"></div>

    <div class="ds-row">
      <div class="ds-col" style="min-width:260px">
        <div class="ds-tag">{{ t('platform') }}</div>
        <select class="ds-select" v-model="platform">
          <option value="web">Web</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>
      </div>

      <div class="ds-col" style="min-width:260px">
        <div class="ds-tag">{{ t('range') }}</div>
        <select class="ds-select" v-model="scope">
          <option value="active">{{ t('scopeActive') }}</option>
          <option value="all">{{ t('scopeAll') }}</option>
        </select>
      </div>

      <div class="ds-col" style="min-width:320px">
        <div class="ds-tag">{{ t('filePrefix') }}</div>
        <input class="ds-input" v-model="prefix" placeholder="ds-tokens" />
      </div>
    </div>

    <div class="ds-divider"></div>

    <div class="actions">
      <button class="ds-btn" @click="exportNow">{{ t('exportButton') }}</button>
      <span class="ds-tag">{{ t('currentColon') }} {{ store.brand }} / {{ store.mode }}</span>
    </div>

    <div class="ds-divider"></div>

    <div class="note">
      <div class="ds-badge">{{ t('note') }}</div>
      <div class="line">• {{ t('noteExport1') }}</div>
      <div class="line">• {{ t('noteExport2') }}</div>
      <div class="line">• {{ t('noteExport3') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../store/app'
import { buildAllLayerMaps, listBrands, type BrandKey, type ModeKey } from '../core/tokens'
import { resolveAll, type ResolveInput } from '../core/resolve'
import { buildResolvedObject, buildExportJson } from '../core/export'
import { downloadText } from '../core/utils'
import { useT } from '../i18n'

const store = useAppStore()

// translation function
const t = useT()

const platform = ref<'web'|'ios'|'android'>('web')
const scope = ref<'active'|'all'>('active')
const prefix = ref('ds-tokens')

function exportOne(brand: BrandKey, mode: ModeKey) {
  const ctx = { brand, mode }
  const maps = buildAllLayerMaps(ctx)
  const env = { ctx, overrides: store.overrides }
  const input: ResolveInput = { maps, env }
  resolveAll(input)
  const resolvedTokens = buildResolvedObject(maps, platform.value)
  const payload = buildExportJson({ brand, mode, platform: platform.value, resolvedTokens })
  const name = `${prefix.value}.${platform.value}.${brand}.${mode}.json`
  downloadText(name, JSON.stringify(payload, null, 2))
}

function exportAll() {
  const brands = listBrands()
  const modes: ModeKey[] = ['light','dark']
  // single file containing all combos
  const bundle: any = {
    meta: {
      platform: platform.value,
      generatedAt: new Date().toISOString(),
      generator: 'DS studio (Vue)',
      scope: 'all',
    },
    tokens: {}
  }
  for (const b of brands) {
    bundle.tokens[b] = {}
    for (const m of modes) {
      const ctx = { brand: b as BrandKey, mode: m }
      const maps = buildAllLayerMaps(ctx)
      const env = { ctx, overrides: store.overrides }
      const input: ResolveInput = { maps, env }
      resolveAll(input)
      bundle.tokens[b][m] = buildResolvedObject(maps, platform.value)
    }
  }
  const name = `${prefix.value}.${platform.value}.ALL.json`
  downloadText(name, JSON.stringify(bundle, null, 2))
}

function exportNow() {
  if (scope.value === 'active') exportOne(store.brand as any, store.mode as any)
  else exportAll()
}
</script>

<style scoped>
.header .title{ font-weight: 800; font-size: 16px; }
.header .subtitle{ margin-top: 4px; color: var(--ds-subtext); font-size: 12px; }
.actions{ display:flex; align-items:center; gap: 12px; }
.note .line{ margin-top: 6px; color: var(--ds-subtext); font-size: 12px; }
</style>
