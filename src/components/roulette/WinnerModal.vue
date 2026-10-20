<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      class="sm:max-w-md border-0 bg-neutral-900/95 backdrop-blur-xl shadow-2xl p-0 gap-0 overflow-hidden"
      @close-auto-focus.prevent
    >
      <div class="flex flex-col items-center gap-5 p-6 sm:p-8 text-center">
        <!-- Trophy icon -->
        <div
          class="w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center shadow-inner"
        >
          <Trophy class="h-8 w-8 text-amber-400" />
        </div>

        <!-- Label + Ganador -->
        <div>
          <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest"
            >Resultado</span
          >
          <h3
            class="mt-2 font-black text-neutral-100 uppercase tracking-wide"
            :class="[
              isNamesMode ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl',
              { 'text-7xl sm:text-8xl': !isNamesMode && (winner === '11' || winner === '13') },
            ]"
            style="text-shadow: 0 0 30px rgba(245, 158, 11, 0.3)"
          >
            {{ winner || "---" }}
          </h3>
          <p v-if="!isNamesMode && winner === '11'" class="mt-2 text-lg font-bold text-amber-400">
            Chupalo Entonces
          </p>
          <p v-if="!isNamesMode && winner === '13'" class="mt-2 text-lg font-bold text-amber-400">
            Agarramela que me Crece
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-2 w-full mt-2">
          <!-- Eliminar (solo en modo nombres) -->
          <button
            v-if="isNamesMode"
            @click="removeWinner"
            class="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Eliminar
          </button>
          <!-- Continuar -->
          <button
            @click="close"
            class="flex-1 bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer"
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
