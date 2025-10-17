<template>
  <div :class="['relative overflow-hidden w-full h-full', wrapperClass]">
    <div
      v-if="!loaded && !error"
      class="absolute inset-0 flex items-center justify-center bg-zinc-200/60 dark:bg-background-700/50 backdrop-blur-md animate-pulse"
      aria-hidden="true"
    ></div>

    <img
      :src="src"
      :alt="alt"
      @load="onLoad"
      @error="onError"
      class="w-full h-full object-cover object-top transition-all duration-300 ease-in-out group-hover:scale-110"
      :style="{ opacity: loaded ? 1 : 0 }"
    />

    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950"
    >
      <span class="text-sm text-zinc-500 dark:text-zinc-300">Imagen no disponible</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  src: string
  alt?: string
  wrapperClass?: string
}>()

const loaded = ref(false)
const error = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  error.value = true
}

const wrapperClass = props.wrapperClass || ''
</script>

<style scoped>
/* nothing here: styling via Tailwind */
</style>
