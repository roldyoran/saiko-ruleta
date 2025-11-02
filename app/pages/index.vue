<template>
  <div
    class="relative m-0 flex min-h-screen flex-col justify-center items-center"
  >
    <!-- <Background /> -->
    <Christmas />

    <!-- Icon navigation for testing -->
    <IconNav class="absolute top-7 left-4 z-40" />

    <!-- Componente Principal de la Ruleta (wrapper relativo para posicionar el carousel) -->
    <div class="relative">
      <RouletteWheel
        ref="rouletteWheelRef"
        :options="options"
        :is-names-mode="isNamesMode"
        :is-showing-winner="isShowingWinner"
        :current-winner="currentWinner"
        @winner-selected="handleWinnerSelected"
      />
      <!-- Imagenes personajes que acompañan ls ruleta -->
      <div
        class="absolute hidden lg:block left-[400px] top-44 -translate-y-1/2 z-30 w-32 md:w-64"
      >
        <!-- Contenedor con posición relativa para superponer las imágenes -->
        <div class="relative w-full aspect-square">
          <!-- Imagen primaria de Tania -->
          <NuxtImg
            :src="TANIA_IMAGES.primary"
            alt="Tania"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            preload
            :class="{
              'opacity-100 z-20': !taniaState.isShowingSecondary,
              'opacity-0 z-10': taniaState.isShowingSecondary,
            }"
            class="absolute inset-0 w-full"
          />
          <!-- Imagen secundaria de Tania -->
          <NuxtImg
            :src="TANIA_IMAGES.secondary"
            alt="Tania"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            :class="{
              'opacity-100 z-20': taniaState.isShowingSecondary,
              'opacity-0 z-10': !taniaState.isShowingSecondary,
            }"
            class="absolute inset-0 w-full"
          />
        </div>
      </div>
      <!-- Imagenes personajes que acompañan ls ruleta -->
      <div
        class="absolute hidden lg:block right-[420px] top-72 -translate-y-1/2 z-30 w-32 md:w-52"
      >
        <NuxtImg
          src="/reigen_ag/Tago_ruleta_navidad.webp"
          alt="Tago"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
      </div>
      <!-- Carousel centrado horizontalmente respecto a la ruleta -->
      <div
        class="absolute hidden lg:block left-[730px] -translate-x-1/2 -bottom-8 z-20"
      >
        <Suspense>
          <ImageCarousel
            ref="carouselLeftRef"
            :images="carouselImages"
            :interval="6000"
            :fade-duration="fadeDuration"
            :autoplay="true"
            :use-staggered-animation="true"
            :stagger-delay="5"
            :show-indicators="false"
          />
          <template #fallback>
            <div class="w-32 h-32 bg-transparent"></div>
          </template>
        </Suspense>
      </div>
      <!-- Duplicado del carousel, posicionado al lado derecho -->
      <div
        class="absolute hidden lg:block right-[730px] translate-x-1/2 -bottom-8 z-20"
      >
        <Suspense>
          <ImageCarousel
            ref="carouselRightRef"
            :images="carouselImages"
            :interval="6000"
            :fade-duration="fadeDuration"
            :autoplay="true"
            :use-staggered-animation="true"
            :stagger-delay="5"
            :show-indicators="false"
          />
          <template #fallback>
            <div class="w-32 h-32 bg-transparent"></div>
          </template>
        </Suspense>
      </div>
    </div>

    <!-- Toggle de Modo -->
    <ModeToggle :is-names-mode="isNamesMode" @toggle-mode="toggleNamesList" />

    <!-- Panel de Nombres -->
    <NamesPanel
      ref="namesPanelRef"
      :show-names-list="showNamesList"
      :is-names-mode="isNamesMode"
      :names-list="namesList"
      @add-name="handleAddName"
      @remove-name="handleRemoveName"
      @clear-names="handleClearNames"
    />

    <!-- Controles -->
    <RouletteControls
      :is-names-mode="isNamesMode"
      :num-options="numOptions"
      :names-count="namesList.length"
      @spin="handleSpin"
      @update-options="updateOptions"
    />
    
    <!--- Recursos multimedia que se deben cargar al inicio --->
    <div class="hidden">
      <audio id="spinSound" src="audios/audio.mp3"></audio>
      <audio id="bell" src="audios/bell_ring.mp3"></audio>
      <!-- <audio id="cancion"></audio> -->
    </div>
    <!-- Las imágenes de Tania ahora se precargan directamente en el componente principal -->
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  computed,
  defineAsyncComponent,
} from "vue";
import {toast} from "vue-sonner";
import { useAppMeta } from '@/composables/useAppMeta';

// Composables
const { updateMeta } = useAppMeta({
  title: 'Inicio',
  description: 'Ruleta interactiva para sorteos y entretenimiento. Perfecto para streamers y comunidades.',
  keywords: ['ruleta', 'sorteo', 'streaming', 'juegos', 'entretenimiento'],
  type: 'website'
});

// Componentes de la ruleta (carga prioritaria)
import RouletteWheel from "@/components/roulette/RouletteWheel.vue";
import ModeToggle from "@/components/roulette/ModeToggle.vue";
import NamesPanel from "@/components/roulette/NamesPanel.vue";
import RouletteControls from "@/components/roulette/RouletteControls.vue";
import IconNav from "@/components/IconNav.vue";
import Christmas from "@/components/backgrounds/christmas.vue";

// Solo lazy-load componentes no críticos
const ImageCarousel = defineAsyncComponent(() =>
  import("@/components/ImageCarousel.vue")
);

// Refs de componentes
const rouletteWheelRef = ref(null);
const namesPanelRef = ref(null);
const carouselLeftRef = ref(null);
const carouselRightRef = ref(null);

// Carousel demo images
// Note: replace these with your image URLs (relative to public/) when ready
const carouselImages = ref([
  "/carousel/tagoDaki.webp",
  "/carousel/tania4.webp",
  "/carousel/dj_picado.webp",
  "/carousel/tania.webp",
  "/carousel/tania2.webp",
]);

const fadeDuration = ref(1500);

// Sistema de imágenes de Tania optimizado
const TANIA_IMAGES = {
  primary: "/reigen_ag/Tania1_navidad.webp",
  secondary: "/reigen_ag/Tania2_navidad.webp",
};

const taniaState = ref({
  currentSrc: TANIA_IMAGES.primary,
  isSecondaryLoaded: true, // Marcar como cargada desde el inicio
  isShowingSecondary: false, // Mostrar imagen primaria por defecto
  isAnimating: false,
  revertTimeoutId: null,
});

// Estado de la aplicación
const showNamesList = ref(false);
const isNamesMode = ref(false);
const namesList = ref([]);
const numOptions = ref(9);
const winnerDisplayTimeout = ref(null);
const isShowingWinner = ref(false);
const currentWinner = ref("");

// Constantes de tiempo
const WINNER_DISPLAY_DURATION = 40000; // 40 segundos

// computed para options (evita reasignaciones manuales)
const options = computed(() => {
  if (isNamesMode.value) {
    return namesList.value.slice();
  }
  const clamped = Math.max(2, Math.min(44, Number(numOptions.value) || 9));
  return Array.from({length: clamped}, (_, i) => (i + 1).toString());
});

// Métodos para manejar el toggle de modo
const toggleNamesList = async () => {
  isNamesMode.value = !isNamesMode.value;

  if (isNamesMode.value) {
    // Abrir panel y enfocar el input de nombres
    showNamesList.value = true;
    await nextTick();
    if (namesPanelRef.value) {
      namesPanelRef.value.focusInput();
    }
  } else {
    // Volver a modo números
    showNamesList.value = false;
    updateOptions(numOptions.value);
  }
};

// Métodos para manejar la lista de nombres
const handleAddName = (lines) => {
  const added = [];
  const skipped = [];

  for (const line of lines) {
    const nameUpper = line.toUpperCase();
    if (
      namesList.value.some(
        (existingName) => existingName.toUpperCase() === nameUpper
      )
    ) {
      skipped.push(line);
    } else {
      namesList.value.push(nameUpper);
      added.push(line);
    }
  }

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
    isShowingWinner.value = false;
  }

  if (added.length > 0) {
    if (added.length === 1) {
      toast.success(`"${added[0]}" agregado a la lista`);
    } else {
      toast.success(`${added.length} nombres agregados a la lista`);
    }
  }

  if (skipped.length > 0) {
    if (skipped.length === 1) {
      toast.error(`El nombre "${skipped[0]}" ya existe y fue ignorado`);
    } else {
      toast.error(`${skipped.length} nombres ya existían y fueron ignorados`);
    }
  }

  // options es computed y se actualizará automáticamente
};

const handleRemoveName = (index) => {
  const removedName = namesList.value[index];

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
    isShowingWinner.value = false;
  }

  namesList.value.splice(index, 1);
  toast.success(`"${removedName}" eliminado de la lista`);

  // options es computed y se actualizará automáticamente
};

const handleClearNames = () => {
  const count = namesList.value.length;
  namesList.value = [];
  // options es computed y se actualizará automáticamente
  toast.success(`${count} nombres eliminados de la lista`);

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
    isShowingWinner.value = false;
  }
};

// Método para manejar cuando se selecciona un ganador
const handleWinnerSelected = ({index, winner}) => {
  currentWinner.value = winner;
  isShowingWinner.value = true;

  // Limpiar timeout existente
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
  }

  // Usar audios cacheados (o fallback a getElementById la primera vez)
  if (cachedSpinSound) {
    cachedSpinSound.pause();
    cachedSpinSound.currentTime = 0;
  } else {
    const spinSound = document.getElementById("spinSound");
    if (spinSound) {
      spinSound.pause();
      spinSound.currentTime = 0;
    }
  }

  if (cachedBell) {
    cachedBell.play().catch(() => {});
  } else {
    const bell = document.getElementById("bell");
    if (bell) bell.play().catch(() => {});
  }

  toast.success(`¡El ganador es: ${currentWinner.value}!`);

  // Configurar timeout para volver a la vista normal
  winnerDisplayTimeout.value = setTimeout(() => {
    isShowingWinner.value = false;
  }, WINNER_DISPLAY_DURATION);
};

// Métodos principales
const updateOptions = (newNumOptions) => {
  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
    isShowingWinner.value = false;
  }

  if (!isNaN(newNumOptions)) {
    numOptions.value = Math.min(44, Math.max(2, newNumOptions));
    // options es computed: no reasignar
  }
};

const handleSpin = () => {
  if (isNamesMode.value && namesList.value.length < 2) {
    toast.error("Agrega al menos 2 nombres para girar la ruleta");
    return;
  }

  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value);
    isShowingWinner.value = false;
  }

  // Cambiar imagen de Tania al girar usando el sistema optimizado
  taniaImageManager.switchToSecondary(200);

  // Delegar el giro al componente de la ruleta
  if (rouletteWheelRef.value) {
    rouletteWheelRef.value.spin();
  }
};

// Inicialización
// Event handlers for speech integration
const handleUpdateOptionsFromSpeechWrapper = (e) =>
  handleUpdateOptionsFromSpeech(e.detail);
const handlePlayAudioWrapper = (e) => handlePlayAudio(e.detail);

// Audio caché (para evitar getElementById repetidos)
let cachedSpinSound = null;
let cachedBell = null;
let cachedCancion = null;

// === SISTEMA DE IMÁGENES DE TANIA OPTIMIZADO ===
const taniaImageManager = {
  // Cambiar a imagen secundaria con revert automático
  switchToSecondary(duration = 200) {
    // Limpiar timeout anterior si existe
    this.clearRevertTimeout();

    // Mostrar imagen secundaria
    taniaState.value.isShowingSecondary = true;
    taniaState.value.isAnimating = true;

    // Programar revert automático
    taniaState.value.revertTimeoutId = setTimeout(() => {
      this.revertToPrimary();
    }, duration);

    return true;
  },

  // Revertir a imagen primaria
  revertToPrimary() {
    taniaState.value.isShowingSecondary = false;
    taniaState.value.isAnimating = false;
    this.clearRevertTimeout();
  },

  // Limpiar timeout de revert
  clearRevertTimeout() {
    if (taniaState.value.revertTimeoutId) {
      clearTimeout(taniaState.value.revertTimeoutId);
      taniaState.value.revertTimeoutId = null;
    }
  },

  // Limpiar todo el estado
  cleanup() {
    this.clearRevertTimeout();
    taniaState.value.isShowingSecondary = false;
    taniaState.value.isAnimating = false;
    // Mantener isSecondaryLoaded como true ya que las imágenes están en el DOM
  },

  // Métodos de utilidad adicionales
  isReady() {
    return taniaState.value.isSecondaryLoaded;
  },

  getCurrentImage() {
    return taniaState.value.isShowingSecondary
      ? TANIA_IMAGES.secondary
      : TANIA_IMAGES.primary;
  },

  isPrimary() {
    return !taniaState.value.isShowingSecondary;
  },

  isSecondary() {
    return taniaState.value.isShowingSecondary;
  },
};

onMounted(async () => {
  // PRIORIDAD 1: Validar numOptions inicial y permitir que la ruleta esté lista
  updateOptions(numOptions.value);

  // PRIORIDAD 2: Event listeners críticos para la funcionalidad principal
  window.addEventListener("ruleta-spin", handleSpinFromSpeech);
  window.addEventListener(
    "ruleta-update-options",
    handleUpdateOptionsFromSpeechWrapper
  );
  window.addEventListener("ruleta-play-audio", handlePlayAudioWrapper);

  // PRIORIDAD 3: Cachear elementos de audio (defer con nextTick)
  await nextTick();
  cachedSpinSound = document.getElementById("spinSound");
  cachedBell = document.getElementById("bell");
  cachedCancion = document.getElementById("cancion");

  // Las imágenes ya están marcadas como listas en el estado inicial

  // PRIORIDAD 5: Cargar speech.js después de que todo lo crítico esté listo
  setTimeout(async () => {
    try {
      await import("@/scripts/speech.js");
    } catch (err) {
      console.warn("No se pudo cargar speech.js de forma diferida:", err);
    }
  }, 1500); // Esperar 1.5 segundos para que la ruleta esté completamente cargada
});

onUnmounted(() => {
  // Limpiar event listeners
  window.removeEventListener("ruleta-spin", handleSpinFromSpeech);
  window.removeEventListener(
    "ruleta-update-options",
    handleUpdateOptionsFromSpeechWrapper
  );
  window.removeEventListener("ruleta-play-audio", handlePlayAudioWrapper);

  // Limpiar timeouts y estado de Tania
  if (winnerDisplayTimeout.value) clearTimeout(winnerDisplayTimeout.value);
  taniaImageManager.cleanup();
});

// Métodos expuestos al componente padre
defineExpose({
  updateOptions,
  handleSpin,
});

// Métodos para manejar eventos del speech.js
const handleSpinFromSpeech = () => {
  handleSpin();
};

const handleUpdateOptionsFromSpeech = (n) => {
  updateOptionsinNameStatus(n);
};

// Reproducción de audio robusta: evita AbortError al cambiar src mientras se reproduce.
const PLAY_DEBOUNCE_MS = 400;
let _lastPlayAt = 0;
let _currentPlayPromise = null;

const handlePlayAudio = async (audioFile) => {
  const now = Date.now();
  if (now - _lastPlayAt < PLAY_DEBOUNCE_MS) return;
  _lastPlayAt = now;

  try {
    const audio = cachedCancion || document.getElementById("cancion");
    if (!audio) return;

    const newSrc = `audios/${audioFile}`;
    // Si ya está reproduciendo exactamente el mismo archivo, no hacemos nada
    if (audio.src && audio.src.endsWith(newSrc) && !audio.paused) {
      return;
    }

    // Detener cualquier reproducción en curso y reiniciar
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      // algunos navegadores pueden lanzar si no soportan currentTime aún
    }

    // Asignar la fuente solo si cambió
    if (!audio.src || !audio.src.endsWith(newSrc)) {
      audio.src = newSrc;
      try {
        audio.load();
      } catch (e) {
        // load puede no ser necesario, seguir de todos modos
      }
    }

    // Reproducir y esperar la promesa; capturamos AbortError que aparece cuando
    // una nueva carga interrumpe la reproducción anterior.
    _currentPlayPromise = audio.play();
    await _currentPlayPromise;
  } catch (err) {
    if (err && err.name === "AbortError") {
      // Ocurre cuando una nueva carga interrumpe la reproducción anterior.
      // No es crítico, lo ignoramos silenciosamente.
    } else {
      console.warn("Error al reproducir audio:", err);
    }
  } finally {
    _currentPlayPromise = null;
  }
};

const updateOptionsinNameStatus = (n) => {
  if (isNamesMode.value) {
    // Si estamos en modo nombres, cambiar a modo números
    isNamesMode.value = false;
    showNamesList.value = false;
    updateOptions(n);
  } else {
    updateOptions(n);
  }
};
</script>
