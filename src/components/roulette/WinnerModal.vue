<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      class="sm:max-w-md bg-cream-100 border-2 border-berry-500/40 p-0 gap-0 overflow-hidden"
      @close-auto-focus.prevent
    >
      <div class="flex flex-col items-center gap-5 p-6 sm:p-8 text-center">
        <!-- Trofeo: círculo rojo con icono crema -->
        <div class="w-16 h-16 bg-berry-500 rounded-full flex items-center justify-center">
          <Trophy class="h-8 w-8 text-cream-100" />
        </div>

        <!-- Label + Ganador -->
        <div>
          <span class="text-[11px] font-bold text-berry-500 uppercase tracking-widest"
            >Resultado</span
          >
          <h3
            class="mt-2 font-black font-display text-berry-600 uppercase tracking-wide"
            :class="[
              isNamesMode ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl',
              { 'text-7xl sm:text-8xl': !isNamesMode && (winner === '11' || winner === '13') },
            ]"
          >
            {{ winner || "---" }}
          </h3>
          <p
            v-if="!isNamesMode && winner === '11'"
            class="mt-2 text-lg font-extrabold text-berry-600"
          >
            Chupalo Entonces
          </p>
          <p
            v-if="!isNamesMode && winner === '13'"
            class="mt-2 text-lg font-extrabold text-berry-600"
          >
            Agarramela que me Crece
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-2 w-full mt-2">
          <!-- Eliminar (solo en modo nombres) -->
          <button
            v-if="isNamesMode"
            @click="removeWinner"
            class="flex-1 bg-transparent border border-berry-500/40 hover:bg-berry-500/10 text-berry-600 text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            Eliminar
          </button>
          <!-- Continuar -->
          <button
            @click="close"
            class="flex-1 bg-berry-500 hover:bg-berry-600 text-cream-100 text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            Continuar
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trophy } from "@lucide/vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  winner: {
    type: String,
    default: "",
  },
  isNamesMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "remove-winner"]);

const close = () => {
  emit("close");
};

const removeWinner = () => {
  emit("remove-winner");
};

const handleOpenChange = (open) => {
  if (!open) {
    emit("close");
  }
};
</script>
