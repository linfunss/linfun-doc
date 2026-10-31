import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import BuildCommit from './BuildCommit.vue'
import DocumentUpdated from './DocumentUpdated.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h(BuildCommit),
    'doc-footer-before': () => h(DocumentUpdated)
  })
}
