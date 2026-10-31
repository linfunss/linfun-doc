<script setup lang="ts">
import { useData } from 'vitepress'
const { theme } = useData()
</script>

<template>
  <component :is="theme.buildCommit.url ? 'a' : 'span'" class="build-commit" :href="theme.buildCommit.url" target="_blank" rel="noopener noreferrer" :aria-label="`查看构建提交 ${theme.buildCommit.hash}`" :title="theme.buildCommit.hash === 'a1b2c3d' ? '本地预览：查看 dev 分支提交记录' : '查看本次构建的 Git 提交'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="6" cy="5" r="3" /><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" />
      <path d="M6 8v8m12-8a8 8 0 0 1-8 8H6" />
    </svg>
    <span class="build-commit-hash vp-external-link-icon">{{ theme.buildCommit.hash }}</span>
  </component>
</template>
