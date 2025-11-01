<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useColorMode } from '#imports'

import SheetMenu from '@/components/SheetMenu.vue'

import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'

// Control de apertura del Sheet (solo por atajo)
const isSheetOpen = ref(false)

onMounted(() => {
  toast.info('Presiona Ctrl+i para abrir el menú', { duration: 5000 })
})
// Nota: el atajo y la lógica del menú ahora están en `SheetMenu.vue`.
</script>
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Sheet lateral (moved to component) -->
    <SheetMenu v-model:open="isSheetOpen" />
    <!-- Componente de notificaciones Toaster con el Sooner -->
    <Toaster class="pointer-events-auto" />
  </div>
  
</template>

