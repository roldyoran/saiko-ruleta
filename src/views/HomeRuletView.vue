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

      <!-- Carousel centrado horizontalmente respecto a la ruleta -->
      <div
        class="absolute hidden md:block left-[750px] -translate-x-1/2 -top-4 z-30 w-60 bg-transparent p-2 rounded"
      >
        <ImageCarousel
          ref="carouselLeftRef"
          :images="carouselImages"
          :interval="4000"
          :fadeDuration="fadeDuration"
          :autoplay="true"
          :pauseOnHover="false"
          :showIndicators="false"
          class="rounded-xl shadow-md"
        />
      </div>
      <!-- Duplicado del carousel, posicionado al lado derecho -->
      <div
        class="absolute hidden md:block right-[750px] translate-x-1/2 -top-4 z-30 w-60 bg-transparent p-2 rounded"
      >
        <ImageCarousel
          ref="carouselRightRef"
          :images="carouselImages"
          :interval="4000"
          :fadeDuration="fadeDuration"
          :autoplay="true"
          :pauseOnHover="false"
          :showIndicators="false"
          class="rounded-xl shadow-md"
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
  </div>
</template>

<script setup>
import '@/scripts/speech.js'

import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { toast } from 'vue-sonner'

// Componentes de la ruleta
import RouletteWheel from '@/components/roulette/RouletteWheel.vue'
import ModeToggle from '@/components/roulette/ModeToggle.vue'
import NamesPanel from '@/components/roulette/NamesPanel.vue'
import RouletteControls from '@/components/roulette/RouletteControls.vue'
import Background from '@/components/backgrounds/background.vue'
import IconNav from '@/components/ui/action-buttons/IconNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'

// Refs de componentes
const rouletteWheelRef = ref(null)
const namesPanelRef = ref(null)
const carouselLeftRef = ref(null)
const carouselRightRef = ref(null)
const carouselMobileRef = ref(null)

// Carousel demo images
// Note: replace these with your image URLs (relative to public/) when ready
const carouselImages = ref([
  '/carousel/dj_picado.webp',
  '/carousel/tania.webp',
  '/carousel/tania2.webp',
])

const fadeDuration = ref(1000)

// Estado de la aplicación
const options = ref([])
const showNamesList = ref(false)
const isNamesMode = ref(false)
const namesList = ref([])
const numOptions = ref(9)
const winnerDisplayTimeout = ref(null)
const isShowingWinner = ref(false)
const currentWinner = ref('')

// Constantes de tiempo
const WINNER_DISPLAY_DURATION = 40000 // 40 segundos

// Métodos para manejar el toggle de modo
const toggleNamesList = async () => {
  isNamesMode.value = !isNamesMode.value

  if (isNamesMode.value) {
    // Cambiar a modo nombres
    if (namesList.value.length > 0) {
      options.value = [...namesList.value]
    } else {
      options.value = []
    }

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

  if (isNamesMode.value) {
    options.value = [...namesList.value]
  }
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

  if (isNamesMode.value) {
    options.value = [...namesList.value]
  }
}

const handleClearNames = () => {
  const count = namesList.value.length
  namesList.value = []
  options.value = []
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

  // Detener sonido de giro y reproducir campana
  const spinSound = document.getElementById('spinSound')
  const bell = document.getElementById('bell')
  if (spinSound) {
    spinSound.pause()
    spinSound.currentTime = 0
  }
  if (bell) bell.play()
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
    options.value = Array.from({ length: numOptions.value }, (_, i) => (i + 1).toString())
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

  // Delegar el giro al componente de la ruleta
  if (rouletteWheelRef.value) {
    rouletteWheelRef.value.spin()
  }
}

// Inicialización
// Event handlers for speech integration
const handleUpdateOptionsFromSpeechWrapper = (e) => handleUpdateOptionsFromSpeech(e.detail)
const handlePlayAudioWrapper = (e) => handlePlayAudio(e.detail)

onMounted(() => {
  // Inicializar con opciones por defecto
  updateOptions(numOptions.value)

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

  // Limpiar timeouts
  if (winnerDisplayTimeout.value) clearTimeout(winnerDisplayTimeout.value)
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

const handlePlayAudio = (audioFile) => {
  const audio = document.getElementById('cancion')
  if (audio) {
    audio.src = `audios/${audioFile}`
    audio.play()
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
