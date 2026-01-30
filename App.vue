<template>
  <div class="app-shell">
    <TopBar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import { useAppStore } from './store/app'
import { watch } from 'vue'

// Set up watchers to update HTML data attributes for theme and language
const store = useAppStore()
watch(
  () => store.mode,
  (m) => {
    document.documentElement.setAttribute('data-mode', m)
  },
  { immediate: true }
)
watch(
  () => store.lang,
  (l) => {
    document.documentElement.setAttribute('lang', l)
  },
  { immediate: true }
)
</script>

<style scoped>
.app-shell{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--ds-text);
}
.app-main{
  flex: 1;
  padding: 16px 20px 24px;
}
</style>
