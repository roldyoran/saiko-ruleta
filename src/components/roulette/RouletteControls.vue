<template>
  <div
    class="mt-5 flex w-64 md:w-[420px] flex-col gap-2.5 px-2 sm:flex-row sm:items-stretch"
    :class="{ 'relative z-[60]': isNamesMode }"
  >
    <!-- Control de cantidad (visible solo en modo números) -->
    <NumberField
      v-if="!isNamesMode"
      :model-value="numOptions"
      :min="2"
      :max="44"
      :disabled="isSpinning"
      class="w-full sm:w-32 flex-none rounded-xl border border-gold-500/30 bg-card/80"
      @update:model-value="updateOptions"
    >
      <NumberFieldContent>
        <NumberFieldDecrement class="text-gold-400/70" />
        <NumberFieldInput
          class="h-11 border-0 bg-transparent font-display text-lg font-extrabold text-gold-300 shadow-none"
        />
        <NumberFieldIncrement class="text-gold-400/70" />
      </NumberFieldContent>
    </NumberField>

    <!-- Botón Girar: dorado plano, compacto -->
    <Button
      @click="handleSpin"
      :disabled="(isNamesMode && namesCount < 2) || isSpinning"
      class="h-11 flex-1 rounded-xl border-b-4 border-gold-700 bg-gold-400 font-display text-base font-extrabold uppercase tracking-widest text-espresso-950 transition-all hover:bg-gold-300 active:translate-y-[2px] active:border-b-0"
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
