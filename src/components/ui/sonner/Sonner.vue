<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--success-bg': 'var(--popover)',
      '--success-text': 'white',
      '--info-bg': 'var(--popover)',
      '--info-text': 'var(--popover-foreground)',
      '--warning-bg': 'var(--popover)',
      '--warning-text': 'var(--popover-foreground)',
      '--error-bg': 'var(--popover)',
      '--error-text': 'var(--popover-foreground)',
      '--border': 'color-mix(in srgb, var(--ring) 40%, transparent)',
    }"
  />
</template>
