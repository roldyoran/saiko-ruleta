<script setup lang="ts">
import { ref } from "vue";

import SheetMenu from "@/components/SheetMenu.vue";

import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";

// Control de apertura del Sheet (solo por atajo)
const isSheetOpen = ref(false);
</script>
<template>
  <div>
    <RouterView />
    <!-- Sheet lateral (moved to component) -->
    <SheetMenu v-model:open="isSheetOpen" />
    <!-- Componente de notificaciones Toaster con el Sooner -->
    <Toaster class="pointer-events-auto" />
  </div>
</template>
