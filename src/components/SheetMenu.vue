<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '@/router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// soporte para v-model:open
const props = defineProps<{ open?: boolean }>()
const emit = defineEmits<(e: 'update:open', value: boolean) => void>()

const isOpen = ref(props.open ?? false)
watch(
  () => props.open,
  (v) => {
    if (v !== undefined) isOpen.value = v
  },
)
watch(isOpen, (v) => emit('update:open', v))

// Rutas a mostrar en el menú (incluye index, excluye rutas dinámicas y catch-all)
const navRoutes = computed(() =>
  router.getRoutes().filter((r) => !r.path.includes(':') && r.name !== 'not-found')
)

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return
    }

    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="left" class="w-[250px] sm:w-[300px]">
      <SheetHeader>
        <SheetTitle>MENÚ</SheetTitle>
        <SheetDescription class="text-white/80">
          Usa este menú para navegar entre páginas.
          <br />
          <span class="font-mono">Presiona Ctrl + i</span> para abrir y/o cerrar.
        </SheetDescription>
      </SheetHeader>

      <nav class="px-4 pb-4">
        <ul class="flex flex-col gap-6">
          <li v-for="r in navRoutes" :key="r.path">
            <RouterLink
              :to="r.path"
              class="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors duration-150 text-white/90 hover:text-primary hover:bg-white/5 active:scale-95"
              @click="isOpen = false"
            >
              <span class="w-2 h-2 rounded-full bg-primary/80 shrink-0" aria-hidden="true"></span>
              <div class="flex-1">
                <div class="leading-none">{{ r.name ?? (r.path === '/' ? 'Inicio' : r.path) }}</div>
                <div class="text-xs text-white/50">{{ r.path }}</div>
              </div>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <SheetFooter class="px-4 pb-6">
        <SheetClose as-child>
          <Button variant="secondary">Cerrar</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
