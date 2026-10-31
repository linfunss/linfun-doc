<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
const { page, frontmatter, theme } = useData()
const editUrl = computed(() => theme.value.editLink?.pattern.replace(':path', page.value.relativePath))
// 本地开发缺少文档 Git 时间时，用当前时间展示相同格式。
const previewTimestamp = Date.now()
const timestamp = computed(() => page.value.lastUpdated ?? (import.meta.env.DEV ? previewTimestamp : undefined))
const formatted = computed(() => {
  if (!timestamp.value) return ''
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(timestamp.value))
  const part = (type: string) => parts.find(p => p.type === type)?.value
  return `${part('year')}年${part('month')}月${part('day')}日 ${part('hour')}:${part('minute')}:${part('second')}`
})
</script>

<template>
  <div class="document-footer-info">
    <a v-if="editUrl && frontmatter.editLink !== false" class="document-edit-link" :href="editUrl" target="_blank" rel="noopener noreferrer">
      <span class="vpi-square-pen" aria-hidden="true" />
      {{ theme.editLink.text }}
    </a>
  <p v-if="timestamp && frontmatter.lastUpdated !== false" class="document-updated">
    最后更新于:<time :datetime="new Date(timestamp).toISOString()">{{ formatted }}</time>
  </p>
  </div>
</template>
