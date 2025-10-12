<template>
  <div class="relative m-0 flex min-h-screen flex-col justify-center items-center">
    <Background />

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
      <div class="absolute hidden lg:block left-[410px] top-72 -translate-y-1/2 z-30 w-32 md:w-64">
        <img
          :src="taniaState.currentSrc"
          ref="taniaImgRef"
          alt="Tania"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          :class="{ 'transition-opacity duration-200': taniaState.isAnimating }"
        />
      </div>
       <!-- Imagenes personajes que acompañan ls ruleta -->
      <div class="absolute hidden lg:block right-[420px] top-72 -translate-y-1/2 z-30 w-32 md:w-52">
        <img src="/reigen_ag/Tago_ruleta_navidad.webp" alt="Tago" loading="lazy" decoding="async" fetchpriority="low" />
      </div>
      <!-- Carousel centrado horizontalmente respecto a la ruleta -->
      <div
        class="absolute hidden lg:block left-[730px] -translate-x-1/2 -bottom-8 z-20"
      >
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
      </div>
      <!-- Duplicado del carousel, posicionado al lado derecho -->
      <div
        class="absolute hidden lg:block right-[730px] translate-x-1/2 -bottom-8 z-20"
      >
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
    <!-- Preload visual offscreen de la imagen secundaria de Tania para evitar parpadeos -->
    <!-- Usamos clases Tailwind para posicionar la imagen fuera de pantalla sin usar display:none (para forzar descarga) -->
    <img
      :src="TANIA_IMAGES.secondary"
      alt=""
      aria-hidden="true"
      decoding="async"
      class="absolute w-px h-px opacity-0 pointer-events-none transform -translate-x-[9999px]"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, defineAsyncComponent, onActivated, onDeactivated } from 'vue'
import { toast } from 'vue-sonner'

// Componentes de la ruleta
import RouletteWheel from '@/components/roulette/RouletteWheel.vue'
import ModeToggle from '@/components/roulette/ModeToggle.vue'
import NamesPanel from '@/components/roulette/NamesPanel.vue'
import RouletteControls from '@/components/roulette/RouletteControls.vue'
import IconNav from '@/components/ui/action-buttons/IconNav.vue'

// Lazy-load de componentes pesados para reducir bundle inicial
const Background = defineAsyncComponent(() => import('@/components/backgrounds/background.vue'))
const ImageCarousel = defineAsyncComponent(() => import('@/components/ImageCarousel.vue'))

// Refs de componentes
const rouletteWheelRef = ref(null)
const namesPanelRef = ref(null)
const carouselLeftRef = ref(null)
const carouselRightRef = ref(null)
const carouselMobileRef = ref(null)
const taniaImgRef = ref(null)

// Carousel demo images
// Note: replace these with your image URLs (relative to public/) when ready
const carouselImages = ref([
  '/carousel/tagoDaki.webp',
  '/carousel/tania4.webp',
  '/carousel/dj_picado.webp',
  '/carousel/tania.webp',
  '/carousel/tania2.webp',
])

const fadeDuration = ref(1500)

// Sistema de imágenes de Tania optimizado
const TANIA_IMAGES = {
  primary: '/reigen_ag/Tania1_navidad.webp',
  secondary: '/reigen_ag/Tania2_navidad.webp'
}

const taniaState = ref({
  currentSrc: TANIA_IMAGES.primary,
  isSecondaryLoaded: false,
  isAnimating: false,
  revertTimeoutId: null
})

// Estado de la aplicación
const showNamesList = ref(false)
const isNamesMode = ref(false)
const namesList = ref([])
const numOptions = ref(9)
const winnerDisplayTimeout = ref(null)
const isShowingWinner = ref(false)
const currentWinner = ref('')

// Constantes de tiempo
const WINNER_DISPLAY_DURATION = 40000 // 40 segundos

// computed para options (evita reasignaciones manuales)
const options = computed(() => {
  if (isNamesMode.value) {
    return namesList.value.slice()
  }
  const clamped = Math.max(2, Math.min(44, Number(numOptions.value) || 9))
  return Array.from({ length: clamped }, (_, i) => (i + 1).toString())
})

// Métodos para manejar el toggle de modo
const toggleNamesList = async () => {
  isNamesMode.value = !isNamesMode.value

  if (isNamesMode.value) {
    // Abrir panel y enfocar el input de nombres
    showNamesList.value = true
    await nextTick()
    if (namesPanelRef.value) {
      namesPanelRef.value.focusInput()
    }
  } else {
    // Volver a modo números
    showNamesList.value = false
    updateOptions(numOptions.value)
  }
}

// Métodos para manejar la lista de nombres
const handleAddName = (lines) => {
  const added = []
  const skipped = []

  for (const line of lines) {
    const nameUpper = line.toUpperCase()
    if (namesList.value.some((existingName) => existingName.toUpperCase() === nameUpper)) {
      skipped.push(line)
    } else {
      namesList.value.push(nameUpper)
      added.push(line)
    }
  }

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  if (added.length > 0) {
    if (added.length === 1) {
      toast.success(`"${added[0]}" agregado a la lista`)
    } else {
      toast.success(`${added.length} nombres agregados a la lista`)
    }
  }

  if (skipped.length > 0) {
    if (skipped.length === 1) {
      toast.error(`El nombre "${skipped[0]}" ya existe y fue ignorado`)
    } else {
      toast.error(`${skipped.length} nombres ya existían y fueron ignorados`)
    }
  }

  // options es computed y se actualizará automáticamente
}

const handleRemoveName = (index) => {
  const removedName = namesList.value[index]

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  namesList.value.splice(index, 1)
  toast.success(`"${removedName}" eliminado de la lista`)

  // options es computed y se actualizará automáticamente
}

const handleClearNames = () => {
  const count = namesList.value.length
  namesList.value = []
  // options es computed y se actualizará automáticamente
  toast.success(`${count} nombres eliminados de la lista`)

  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }
}

// Método para manejar cuando se selecciona un ganador
const handleWinnerSelected = ({ index, winner }) => {
  currentWinner.value = winner
  isShowingWinner.value = true

  // Limpiar timeout existente
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
  }

  // Usar audios cacheados (o fallback a getElementById la primera vez)
  if (cachedSpinSound) {
    cachedSpinSound.pause()
    cachedSpinSound.currentTime = 0
  } else {
    const spinSound = document.getElementById('spinSound')
    if (spinSound) {
      spinSound.pause()
      spinSound.currentTime = 0
    }
  }

  if (cachedBell) {
    cachedBell.play().catch(() => {})
  } else {
    const bell = document.getElementById('bell')
    if (bell) bell.play().catch(() => {})
  }

  toast.success(`¡El ganador es: ${currentWinner.value}!`)

  // Configurar timeout para volver a la vista normal
  winnerDisplayTimeout.value = setTimeout(() => {
    isShowingWinner.value = false
  }, WINNER_DISPLAY_DURATION)
}

// Métodos principales
const updateOptions = (newNumOptions) => {
  // Quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  if (!isNaN(newNumOptions)) {
    numOptions.value = Math.min(44, Math.max(2, newNumOptions))
    // options es computed: no reasignar
  }
}

const handleSpin = () => {
  if (isNamesMode.value && namesList.value.length < 2) {
    toast.error('Agrega al menos 2 nombres para girar la ruleta')
    return
  }

  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  // Cambiar imagen de Tania al girar usando el sistema optimizado
  taniaImageManager.switchToSecondary(500)

  // Delegar el giro al componente de la ruleta
  if (rouletteWheelRef.value) {
    rouletteWheelRef.value.spin()
  }
}

// Inicialización
// Event handlers for speech integration
const handleUpdateOptionsFromSpeechWrapper = (e) => handleUpdateOptionsFromSpeech(e.detail)
const handlePlayAudioWrapper = (e) => handlePlayAudio(e.detail)

// Audio caché (para evitar getElementById repetidos)
let cachedSpinSound = null
let cachedBell = null
let cachedCancion = null

// === SISTEMA DE IMÁGENES DE TANIA OPTIMIZADO ===
const taniaImageManager = {
  // Precargar imagen secundaria
  async preloadSecondaryImage() {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = TANIA_IMAGES.secondary
      
      img.onload = () => {
        taniaState.value.isSecondaryLoaded = true
        resolve(img)
      }
      
      img.onerror = () => {
        taniaState.value.isSecondaryLoaded = false
        console.warn('No se pudo precargar la imagen secundaria de Tania:', TANIA_IMAGES.secondary)
        reject(new Error('Failed to preload secondary image'))
      }
    })
  },

  // Cambiar a imagen secundaria con revert automático
  switchToSecondary(duration = 500) {
    // Solo cambiar si la imagen secundaria está cargada y no estamos ya animando
    if (!taniaState.value.isSecondaryLoaded || taniaState.value.isAnimating) {
      return false
    }

    // Limpiar timeout anterior si existe
    this.clearRevertTimeout()

    // Marcar como animando y cambiar imagen
    taniaState.value.isAnimating = true
    taniaState.value.currentSrc = TANIA_IMAGES.secondary

    // Programar revert automático
    taniaState.value.revertTimeoutId = setTimeout(() => {
      this.revertToPrimary()
    }, duration)

    return true
  },

  // Revertir a imagen primaria
  revertToPrimary() {
    taniaState.value.currentSrc = TANIA_IMAGES.primary
    taniaState.value.isAnimating = false
    this.clearRevertTimeout()
  },

  // Limpiar timeout de revert
  clearRevertTimeout() {
    if (taniaState.value.revertTimeoutId) {
      clearTimeout(taniaState.value.revertTimeoutId)
      taniaState.value.revertTimeoutId = null
    }
  },

  // Limpiar todo el estado
  cleanup() {
    this.clearRevertTimeout()
    taniaState.value.currentSrc = TANIA_IMAGES.primary
    taniaState.value.isAnimating = false
    taniaState.value.isSecondaryLoaded = false
  },

  // Métodos de utilidad adicionales
  isReady() {
    return taniaState.value.isSecondaryLoaded
  },

  getCurrentImage() {
    return taniaState.value.currentSrc
  },

  isPrimary() {
    return taniaState.value.currentSrc === TANIA_IMAGES.primary
  },

  isSecondary() {
    return taniaState.value.currentSrc === TANIA_IMAGES.secondary
  }
}

onMounted(async () => {
  // Validar numOptions inicial y permitir computed construir options
  updateOptions(numOptions.value)

  // Cachear elementos de audio para uso frecuente
  cachedSpinSound = document.getElementById('spinSound')
  cachedBell = document.getElementById('bell')
  cachedCancion = document.getElementById('cancion')

  // Preload optimizado de la imagen secundaria de Tania
  taniaImageManager.preloadSecondaryImage().catch((error) => {
    console.warn('Error al precargar imagen secundaria de Tania:', error)
  })

  // Cargar speech.js de forma diferida (mejora bundle inicial) y activar reconocimiento de voz
  try {
    await import('@/scripts/speech.js')
    
  } catch (err) {
    console.warn('No se pudo cargar speech.js de forma diferida:', err)
  }

  // Event listeners para integración con speech.js
  window.addEventListener('ruleta-spin', handleSpinFromSpeech)
  window.addEventListener('ruleta-update-options', handleUpdateOptionsFromSpeechWrapper)
  window.addEventListener('ruleta-play-audio', handlePlayAudioWrapper)
})

onUnmounted(() => {
  
  // Limpiar event listeners
  window.removeEventListener('ruleta-spin', handleSpinFromSpeech)
  window.removeEventListener('ruleta-update-options', handleUpdateOptionsFromSpeechWrapper)
  window.removeEventListener('ruleta-play-audio', handlePlayAudioWrapper)

  // Limpiar timeouts y estado de Tania
  if (winnerDisplayTimeout.value) clearTimeout(winnerDisplayTimeout.value)
  taniaImageManager.cleanup()
})


// Métodos expuestos al componente padre
defineExpose({
  updateOptions,
  handleSpin,
})

// Métodos para manejar eventos del speech.js
const handleSpinFromSpeech = () => {
  handleSpin()
}

const handleUpdateOptionsFromSpeech = (n) => {
  updateOptionsinNameStatus(n)
}

// Reproducción de audio robusta: evita AbortError al cambiar src mientras se reproduce.
const PLAY_DEBOUNCE_MS = 400
let _lastPlayAt = 0
let _currentPlayPromise = null

const handlePlayAudio = async (audioFile) => {
  const now = Date.now()
  if (now - _lastPlayAt < PLAY_DEBOUNCE_MS) return
  _lastPlayAt = now

  try {
    const audio = cachedCancion || document.getElementById('cancion')
    if (!audio) return

    const newSrc = `audios/${audioFile}`
    // Si ya está reproduciendo exactamente el mismo archivo, no hacemos nada
    if (audio.src && audio.src.endsWith(newSrc) && !audio.paused) {
      return
    }

    // Detener cualquier reproducción en curso y reiniciar
    try {
      audio.pause()
      audio.currentTime = 0
    } catch (e) {
      // algunos navegadores pueden lanzar si no soportan currentTime aún
    }

    // Asignar la fuente solo si cambió
    if (!audio.src || !audio.src.endsWith(newSrc)) {
      audio.src = newSrc
      try {
        audio.load()
      } catch (e) {
        // load puede no ser necesario, seguir de todos modos
      }
    }

    // Reproducir y esperar la promesa; capturamos AbortError que aparece cuando
    // una nueva carga interrumpe la reproducción anterior.
    _currentPlayPromise = audio.play()
    await _currentPlayPromise
  } catch (err) {
    if (err && err.name === 'AbortError') {
      // Ocurre cuando una nueva carga interrumpe la reproducción anterior.
      // No es crítico, lo ignoramos silenciosamente.
    } else {
      console.warn('Error al reproducir audio:', err)
    }
  } finally {
    _currentPlayPromise = null
  }
}

const updateOptionsinNameStatus = (n) => {
  if (isNamesMode.value) {
    // Si estamos en modo nombres, cambiar a modo números
    isNamesMode.value = false
    showNamesList.value = false
    updateOptions(n)
  } else {
    updateOptions(n)
  }
}
</script>