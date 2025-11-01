<template>
  <div class="flex min-h-[200px] flex-col items-center justify-center">
    <div class="text-center">
      <h2 class="mb-2 text-2xl font-bold">Error al cargar los datos</h2>
      <p class="text-sm text-muted-foreground">{{ error }}</p>
      <Button class="mt-4" @click="$emit('retry')">Reintentar</Button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: { type: String, required: true },
})
const emit = defineEmits(['retry'])

import { Button } from '@/components/ui/button'
</script>
