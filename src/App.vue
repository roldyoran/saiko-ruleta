<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'

import SheetMenu from '@/components/SheetMenu.vue'

import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

// Control de apertura del Sheet (solo por atajo)
const isSheetOpen = ref(false)

// Nota: el atajo y la lógica del menú ahora están en `SheetMenu.vue`.
</script>

<template>
  <RouterView />

  <!-- Sheet lateral (moved to component) -->
  <SheetMenu v-model:open="isSheetOpen" />

  <Toaster class="pointer-events-auto" />
</template>
