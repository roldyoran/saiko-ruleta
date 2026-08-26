<template>
  <RouletteConfigPanel
    ref="configPanelRef"
    :is-names-mode="isNamesMode"
    @update:open="onPanelChange"
    @mode-change="(mode) => emit('mode-change', mode)"
    @items-changed="() => emit('items-changed')"
  />

  <!-- Botón para abrir panel de configuración -->
  <Card
    v-if="!panelOpen"
    class="fixed top-4 right-4 z-50 p-2 cursor-pointer"
    @click="openPanel"
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
    >
      <Users class="h-3.5 w-3.5" />
    </Button>
  </Card>

  <!-- Botón para alternar modo (solo visible cuando hay items y el panel está cerrado) -->
  <Card
    v-if="!panelOpen && itemsCount >= 2"
    class="fixed top-14 right-4 z-50 p-2 cursor-pointer"
    @click="toggleMode"
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
      :title="isNamesMode ? 'Cambiar a modo números' : 'Cambiar a modo participantes'"
    >
      <component :is="isNamesMode ? Hash : Users" class="h-3.5 w-3.5" />
    </Button>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Hash } from '@lucide/vue'
import RouletteConfigPanel from './RouletteConfigPanel.vue'

const emit = defineEmits(['panel-open', 'panel-close', 'mode-change', 'items-changed'])

const props = defineProps({
  isNamesMode: {
    type: Boolean,
    default: false,
  },
  itemsCount: {
    type: Number,
    default: 0,
  },
})

const configPanelRef = ref(null)
const panelOpen = ref(false)

function onPanelChange(open) {
  panelOpen.value = open
  if (open) {
    emit('panel-open')
  } else {
    emit('panel-close')
  }
}

function openPanel() {
  if (configPanelRef.value) {
    configPanelRef.value.open()
  }
}

function toggleMode() {
  emit('mode-change', props.isNamesMode ? 'numbers' : 'names')
}

defineExpose({
  open: openPanel,
})
</script>
