<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      class="sm:max-w-md border border-gold-500/25 bg-card/95 backdrop-blur-xl shadow-glow-gold p-0 gap-0 overflow-hidden"
      @close-auto-focus.prevent
    >
      <div class="flex flex-col items-center gap-5 p-6 sm:p-8 text-center">
        <!-- Trofeo en aro dorado -->
        <div
          class="rounded-full bg-linear-to-b from-gold-200 via-gold-400 to-gold-700 p-[2px] shadow-glow-gold"
        >
          <div class="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-inner">
            <Trophy class="h-8 w-8 text-gold-400" />
          </div>
        </div>

        <!-- Label + Ganador -->
        <div>
          <span class="text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
            >Resultado</span
          >
          <h3
            class="mt-2 font-black font-display text-gold-shine uppercase tracking-wide"
            :class="[
              isNamesMode ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl',
              { 'text-7xl sm:text-8xl': !isNamesMode && (winner === '11' || winner === '13') },
            ]"
          >
            {{ winner || "---" }}
          </h3>
          <p
            v-if="!isNamesMode && winner === '11'"
            class="mt-2 text-lg font-extrabold text-gold-400"
          >
            Chupalo Entonces
          </p>
          <p
            v-if="!isNamesMode && winner === '13'"
            class="mt-2 text-lg font-extrabold text-gold-400"
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
            class="flex-1 bg-destructive hover:bg-berry-500 text-destructive-foreground text-xs font-semibold py-3 px-4 rounded-xl shadow-glow-berry transition-all cursor-pointer"
          >
            Eliminar
          </button>
          <!-- Continuar -->
          <button
            @click="close"
            class="flex-1 bg-linear-to-b from-gold-200 via-gold-400 to-gold-600 hover:brightness-110 text-espresso-950 text-xs font-semibold py-3 px-4 rounded-xl shadow-glow-gold transition-all cursor-pointer"
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
