<template>
  <div
    class="mt-6 flex w-64 md:w-[500px] flex-col gap-3 px-2 sm:flex-row sm:items-stretch"
    :class="{ 'relative z-[60]': isNamesMode }"
  >
    <!-- Control de cantidad (visible solo en modo números) -->
    <NumberField
      v-if="!isNamesMode"
      :model-value="numOptions"
      :min="2"
      :max="44"
      :disabled="isSpinning"
      class="flex-1 rounded-2xl border-2 border-gold-500/40 bg-card/80 shadow-glow-gold"
      @update:model-value="updateOptions"
    >
      <NumberFieldContent>
        <NumberFieldDecrement class="text-gold-400" />
        <NumberFieldInput
          class="h-14 border-0 bg-transparent font-display text-xl font-black text-gold-300 shadow-none"
        />
        <NumberFieldIncrement class="text-gold-400" />
      </NumberFieldContent>
    </NumberField>

    <!-- Botón Girar: dorado metálico 3D, el único protagonista de color -->
    <Button
      @click="handleSpin"
      :disabled="(isNamesMode && namesCount < 2) || isSpinning"
      class="h-14 flex-1 rounded-2xl border-b-4 border-gold-700 bg-linear-to-b from-gold-200 via-gold-400 to-gold-600 font-display text-xl font-black uppercase tracking-widest text-espresso-950 shadow-glow-gold transition-all hover:brightness-110 active:translate-y-[2px] active:border-b-0 disabled:shadow-none"
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
