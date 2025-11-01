<template>
  <TooltipProvider>
    <Card class="fixed top-4 right-4 z-50 p-2 cursor-pointer">
      <transition name="fade-scale">
        <div
          class="flex items-center gap-3 transition-all"
          @keydown.enter.prevent="toggleMode"
          @keydown.space.prevent="toggleMode"
        >
          <Badge
            :variant="isNamesMode ? 'default' : 'secondary'"
            class="flex items-center gap-1 cursor-pointer select-none"
            role="button"
            tabindex="0"
            @click="toggleMode"
          >
            <span v-if="!isNamesMode"><Hash class="h-3 w-3" /></span>
            <span v-else><Users class="h-3 w-3" /></span>
            <!-- <span>{{ isNamesMode ? 'Nombres' : 'Números' }}</span> -->
          </Badge>
          <div>
            <Switch :model-value="isNamesMode" @update:model-value="toggleMode" />
          </div>
        </div>
      </transition>
    </Card>
  </TooltipProvider>
</template>

<script setup>
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Hash, Users } from 'lucide-vue-next'

// Props
const props = defineProps({
  isNamesMode: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['toggle-mode'])

// Métodos
const toggleMode = () => {
  emit('toggle-mode')
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
