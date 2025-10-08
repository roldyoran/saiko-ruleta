<template>
    <div class="mt-4 flex w-max-4xl flex-col gap-4 px-2 sm:flex-row">
      <!-- Control de cantidad (visible solo en modo números) -->
      <NumberField
        v-if="!isNamesMode"
        :model-value="numOptions"
        :min="2"
        :max="44"
        class="flex-1  border-none shadow-sm font-bold bg-pink-900 hover:bg-pink-700 rounded-md transition-all"
        @update:model-value="updateOptions"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <!-- Botón Girar -->
      <Button
        @click="handleSpin"
        :disabled="isNamesMode && namesCount < 2"
        size="xl"
        class="flex-1 font-bold rounded-lg text-lg shadow-sm"
      >
        <RotateCcw class="mr-2 h-4 w-4" />
        GIRAR
      </Button>
    </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RotateCcw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Props
const props = defineProps({
  isNamesMode: {
    type: Boolean,
    default: false,
  },
  numOptions: {
    type: Number,
    default: 9,
  },
  namesCount: {
    type: Number,
    default: 0,
  },
})

// Emits
const emit = defineEmits(['spin', 'update-options'])

// Métodos
const handleSpin = () => {
  if (props.isNamesMode && props.namesCount < 2) {
    toast.error('Agrega al menos 2 nombres para girar la ruleta')
    return
  }
  emit('spin')
}

const updateOptions = (newValue) => {
  emit('update-options', newValue)
}
</script>
