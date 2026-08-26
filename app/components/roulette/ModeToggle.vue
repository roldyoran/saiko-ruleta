<template>
  <RouletteConfigPanel
    ref="configPanelRef"
    :prevent-close="preventClose"
    @update:open="onPanelChange"
  >
    <template #trigger="{ toggle }">
      <Card class="fixed top-4 right-4 z-50 p-2 cursor-pointer" @click="toggle">
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Users class="h-3.5 w-3.5" />
        </Button>
      </Card>
    </template>
  </RouletteConfigPanel>
</template>

<script setup>
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from '@lucide/vue'
import RouletteConfigPanel from './RouletteConfigPanel.vue'

const emit = defineEmits(['panel-open', 'panel-close'])

defineProps({
  preventClose: {
    type: Boolean,
    default: false,
  },
})

const configPanelRef = ref(null)

function onPanelChange(open) {
  if (open) {
    emit('panel-open')
  } else {
    emit('panel-close')
  }
}

defineExpose({
  open: () => {
    if (configPanelRef.value) {
      configPanelRef.value.isOpen = true
      configPanelRef.value.focusInput()
    }
  }
})
</script>
