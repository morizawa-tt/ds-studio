<template>
  <header class="topbar">
    <div class="left">
      <div class="brand">
        <div class="logo">DS</div>
        <div class="title">
          <div class="name">DS studio</div>
          <div class="desc">{{ t('desc') }}</div>
        </div>
      </div>

      <nav class="nav">
        <RouterLink class="nav-item" to="/lab">{{ t('componentLab') }}</RouterLink>
        <RouterLink class="nav-item" to="/tokens">{{ t('tokens') }}</RouterLink>
        <RouterLink class="nav-item" to="/export">{{ t('exportTokens') }}</RouterLink>
      </nav>
    </div>

    <div class="right controls">
      <!-- Brand selector -->
      <span class="small-label">{{ t('brand') }}</span>
      <select class="ds-select tiny brand-select" v-model="brand">
        <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
      </select>

      <!-- Theme toggle -->
      <span class="small-label">{{ t('theme') }}</span>
      <button class="ds-btn tiny theme-btn" @click="toggleMode">
        {{ mode === 'dark' ? t('dark') : t('light') }}
      </button>

      <!-- Language toggle -->
      <span class="small-label">{{ t('language') }}</span>
      <button class="ds-btn tiny lang-btn" @click="toggleLang">
        {{ lang === 'zh' ? '中文' : 'EN' }}
      </button>

      <!-- Reset button -->
      <button class="ds-btn tiny danger reset-btn" @click="reset">
        {{ t('reset') }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../store/app'
import { listBrands } from '../core/tokens'
import { useT } from '../i18n'

const store = useAppStore()
const t = useT()
const brands = listBrands()

// reactive bindings
const brand = computed({
  get: () => store.brand,
  set: (v) => store.setBrand(v as any)
})
const mode = computed(() => store.mode)
const lang = computed(() => store.lang)

// toggle between dark and light mode
function toggleMode() {
  store.setMode(store.mode === 'dark' ? 'light' : 'dark')
}

// toggle between Chinese and English
function toggleLang() {
  store.setLang(store.lang === 'zh' ? 'en' : 'zh')
}

function reset() {
  const confirmMsg = store.lang === 'zh'
    ? '会清空本机 localStorage 中的 token 改动，确定吗？'
    : 'This will clear all local token overrides. Continue?'
  if (confirm(confirmMsg)) {
    store.resetAllOverrides()
    location.reload()
  }
}
</script>

<style scoped>
.topbar{
  position: sticky;
  top: 0;
  z-index: 10;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ds-border);
  /* Use a theme-dependent variable for the header background. The value is
   * defined in `src/styles/global.css` (var(--ds-topbar-bg)) and will
   * automatically switch between dark and light modes. */
  background: var(--ds-topbar-bg);
  backdrop-filter: blur(10px);
}
.left{ display:flex; align-items:center; gap: 14px; }
.brand{ display:flex; align-items:center; gap: 10px; }
.logo{
  width: 36px; height: 36px;
  border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  /* adopt new brand colour for logo badge */
  background: rgba(114,98,253,.14);
  border: 1px solid rgba(114,98,253,.35);
  color: rgba(255,255,255,.92);
  font-weight: 700;
}
.title .name{ font-weight: 700; letter-spacing: .2px; }
.title .desc{ font-size: 12px; color: var(--ds-subtext); margin-top: 2px; }
.nav{ display:flex; align-items:center; gap: 10px; margin-left: 12px; }
.nav-item{
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  color: var(--ds-subtext);
}
.nav-item.router-link-active{
  color: var(--ds-text);
  border-color: rgba(114,98,253,.35);
  background: rgba(114,98,253,.10);
}
/* Controls container in topbar: arrange controls horizontally with consistent gaps */
.controls{
  display:flex;
  align-items:center;
  gap: 10px;
}
/* Smaller label preceding controls */
.small-label{
  font-size: 12px;
  color: var(--ds-subtext);
  margin-right: 4px;
}
/* Ensure select and buttons share the same height and border radius */
.ds-select.tiny,
.ds-btn.tiny{
  padding: 6px 10px;
  border-radius: 10px;
}
.brand-select{ width: 92px; }
/* Danger button remains red across themes */
.danger{
  border-color: rgba(255,77,79,.35);
  background: rgba(255,77,79,.10);
}
.danger:hover{ background: rgba(255,77,79,.18); }
</style>
