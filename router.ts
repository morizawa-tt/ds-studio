import type { RouteRecordRaw } from 'vue-router'
import ComponentLab from './pages/ComponentLab.vue'
import TokensExplorer from './pages/TokensExplorer.vue'
import ExportPage from './pages/ExportPage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/lab' },
  { path: '/lab', component: ComponentLab },
  { path: '/tokens', component: TokensExplorer },
  { path: '/export', component: ExportPage },
]
