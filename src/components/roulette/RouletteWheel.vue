<template>
  <div class="relative">
    <!-- Flecha indicadora (puntero) -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 pointer-events-none">
      <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5" />
          </filter>
        </defs>
        <polygon
          points="18,48 2,6 18,14 34,6"
          style="fill: var(--color-gold-400); stroke: var(--color-berry-700)"
          stroke-width="2.5"
          stroke-linejoin="round"
          filter="url(#pointerShadow)"
        />
      </svg>
    </div>

    <!-- Anillo caramelo navideño alrededor de la ruleta -->
    <div
      class="rounded-full p-1.5"
      style="
        background: repeating-conic-gradient(
          var(--color-berry-500) 0deg 9deg,
          var(--color-cream-100) 9deg 18deg
        );
      "
    >
      <!-- Skeleton de carga -->
      <div
        v-if="!isLoaded"
        class="w-64 h-64 md:w-[500px] md:h-[500px] rounded-full bg-pine-900/80 animate-pulse flex items-center justify-center"
      >
        <svg
          class="size-10 text-gold-400 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      </div>

      <!-- Contenedor de spin-wheel -->
      <div
        ref="wheelContainer"
        class="w-64 h-64 md:w-[500px] md:h-[500px] rounded-full overflow-hidden"
        :class="{ 'opacity-0 absolute': !isLoaded }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { Wheel } from "spin-wheel";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { NOEL_CANDY_RED, NOEL_LABEL_CREAM, NOEL_LABEL_STROKE, NOEL_LINE } from "@/lib/noel-palette";

// Props
const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  isNamesMode: {
    type: Boolean,
    default: false,
  },
  // Configuración de la ruleta
  itemColors: {
    type: Array,
    default: () => [],
  },
  itemLabelColors: {
    type: Array,
    default: () => [NOEL_LABEL_CREAM],
  },
  fontFamily: {
    type: String,
    default: '"Outfit Variable", Arial, sans-serif',
  },
  fontSizeMax: {
    type: Number,
    default: 18,
  },
  labelAlign: {
    type: String,
    default: "right",
  },
  labelRadius: {
    type: Number,
    default: 0.75,
  },
  lineWidth: {
    type: Number,
    default: 2,
  },
  lineColor: {
    type: String,
    default: NOEL_LINE,
  },
  spinDuration: {
    type: Number,
    default: 4500,
  },
  revolutions: {
    type: Number,
    default: 8,
  },
});

// Emits
const emit = defineEmits(["winner-selected"]);

// Refs
const wheelContainer = ref(null);
let wheel = null;
const isLoaded = ref(false);

// Fallback caramelo (el padre siempre pasa `itemColors`/`itemLabelColors`).
const DEFAULT_BG = NOEL_CANDY_RED;
const DEFAULT_LABEL = NOEL_LABEL_CREAM;

// Construir items desde options
const buildItems = (options) => {
  return options.map((opt, i) => {
    const color = props.itemColors[i] || DEFAULT_BG;
    const labelColor = props.itemLabelColors[i] || DEFAULT_LABEL;
    return {
      label: String(opt),
      backgroundColor: color,
      labelColor,
      weight: 1,
    };
  });
};

// Inicializar la ruleta
const initWheel = () => {
  if (!wheelContainer.value) return;

  // Destruir wheel anterior si existe
  if (wheel) {
    wheel.remove();
  }

  isLoaded.value = false;

  wheel = new Wheel(wheelContainer.value, {
    items: buildItems(props.options),
    // Colores y estilo de texto
    itemLabelColors: [NOEL_LABEL_CREAM],
    itemLabelFont: props.fontFamily,
    itemLabelFontSizeMax: props.fontSizeMax,
    itemLabelAlign: props.labelAlign,
    itemLabelRadius: props.labelRadius,
    itemLabelRadiusMax: 0.2,
    itemLabelStrokeColor: NOEL_LABEL_STROKE,
    itemLabelStrokeWidth: 3,
    // Bordes entre items
    lineWidth: props.lineWidth,
    lineColor: props.lineColor,
    // Geometría
    pointerAngle: 0,
    radius: 0.95,
    // Comportamiento
    isInteractive: false,
    rotationResistance: -35,
    // Callbacks
    onRest: (event) => {
      emit("winner-selected", {
        index: event.currentIndex,
        winner: props.options[event.currentIndex],
      });
    },
    onCurrentIndexChange: () => {},
  });

  // Marcar como cargado después de un frame para asegurar render
  requestAnimationFrame(() => {
    isLoaded.value = true;
  });
};

// Método público para iniciar el giro (mínimo 8 vueltas)
const spin = () => {
  if (!wheel) return;

  // Calcular un índice ganador aleatorio
  const randomIndex = Math.floor(Math.random() * props.options.length);

  // Usar spinToItem para controlar vueltas mínimas
  wheel.spinToItem(
    randomIndex, // itemIndex - el ganador
    props.spinDuration, // duration - configurable
    true, // spinToCenter - centrar en el item
    props.revolutions, // numberOfRevolutions - configurable
    1, // direction - 1 = horario
    null, // easingFunction - usar default
  );

  // Reproducir sonido de giro
  const spinSound = document.getElementById("spinSound");
  if (spinSound) {
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});
  }
};

// Método público para detener
const stop = () => {
  if (wheel) {
    wheel.stop();
  }
};

// Watch para actualizar items cuando cambien las options
watch(
  () => props.options,
  (newOptions) => {
    if (wheel && newOptions.length > 0) {
      wheel.items = buildItems(newOptions);
    }
  },
  { deep: true },
);

// Watch para re-inicializar cuando cambien los parámetros de configuración visual
watch(
  () => [
    props.fontFamily,
    props.fontSizeMax,
    props.labelAlign,
    props.labelRadius,
    props.lineWidth,
    props.lineColor,
    props.itemColors,
    props.itemLabelColors,
  ],
  () => {
    initWheel();
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  initWheel();
});

onUnmounted(() => {
  if (wheel) {
    wheel.remove();
    wheel = null;
  }
});

// Exponer métodos públicos
defineExpose({
  spin,
  stop,
  initWheel,
});
</script>
