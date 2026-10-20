<template>
  <RouletteConfigPanel
    ref="configPanelRef"
    :is-names-mode="isNamesMode"
    @update:open="onPanelChange"
    @mode-change="(mode) => emit('mode-change', mode)"
    @items-changed="() => emit('items-changed')"
  />

  <!-- Botón para abrir panel de configuración -->
  <Card v-if="!panelOpen" class="fixed top-4 right-4 z-50 p-2 cursor-pointer" @click="openPanel">
    <Button
      variant="ghost"
      size="icon"
      title="Abrir configuración"
      class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
    >
      <LifeBuoy class="h-3.5 w-3.5" />
    </Button>
  </Card>
</template>

<script setup>
import { ref } from "vue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "@lucide/vue";
import RouletteConfigPanel from "./RouletteConfigPanel.vue";

const emit = defineEmits(["panel-open", "panel-close", "mode-change", "items-changed"]);

const props = defineProps({
  isNamesMode: {
    type: Boolean,
    default: false,
  },
});

const configPanelRef = ref(null);
const panelOpen = ref(false);

function onPanelChange(open) {
  panelOpen.value = open;
  if (open) {
    emit("panel-open");
  } else {
    emit("panel-close");
  }
}

function openPanel() {
  if (configPanelRef.value) {
    configPanelRef.value.open();
  }
}

function closePanel() {
  if (configPanelRef.value) {
    configPanelRef.value.close();
  }
}

defineExpose({
  open: openPanel,
  close: closePanel,
});
</script>
