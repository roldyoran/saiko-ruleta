<template>
  <div
    class="mt-4 flex w-max-4xl flex-col gap-4 px-2 sm:flex-row sm:items-center"
    :class="{ 'relative z-[60]': isNamesMode }"
  >
    <!-- Control de cantidad (visible solo en modo números) -->
    <NumberField
      v-if="!isNamesMode"
      :model-value="numOptions"
      :min="2"
      :max="44"
      class="flex-1 border-none shadow-sm font-bold bg-primary/80 hover:bg-primary rounded-md transition-all"
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
      :disabled="(isNamesMode && namesCount < 2) || isSpinning"
      class="flex-1 font-bold rounded-lg text-lg shadow-sm"
    >
      <RotateCcw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isSpinning }" />
      {{ isSpinning ? "GIRANDO..." : "GIRAR" }}
    </Button>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";

import { RotateCcw } from "@lucide/vue";

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
  isSpinning: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["spin", "update-options"]);

// Métodos
const handleSpin = () => {
  if (!props.isSpinning) {
    emit("spin");
  }
};

const updateOptions = (newValue) => {
  emit("update-options", newValue);
};
</script>
