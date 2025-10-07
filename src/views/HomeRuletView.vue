<template>
  <div class="relative m-0 flex min-h-screen flex-col justify-center items-center">
    <Background />
    <div class="relative">
      <canvas ref="canvasRef" width="500" height="500" class="relative"></canvas>

      <!-- Mostrar ganador con Vue -->
      <transition name="fade-scale">
        <div
          v-if="isShowingWinner"
          class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 shadow-[0_0_20px_10px_rgba(0,0,0,0.3)] backdrop-blur-sm"
          :class="{
            'bg-black/85': currentWinner === '11' || currentWinner === '13',
          }"
        >
          <template v-if="isNamesMode">
            <!-- <p class="text-4xl font-bold text-white mb-4">¡GANADOR!</p> -->
            <p
              class="text-4xl font-bold text-white uppercase px-6 py-3 rounded-lg"
              style="
                -webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.9);
                text-shadow: 0 4px 10px rgba(0, 0, 0, 0.85);
                background: rgba(0, 0, 0, 0.45);
              "
            >
              {{ currentWinner }}
            </p>
          </template>
          <template v-else>
            <p
              class="text-7xl font-bold text-white"
              :class="{
                'mb-4 text-8xl': currentWinner === '11' || currentWinner === '13',
              }"
            >
              {{ currentWinner }}
            </p>
            <p v-if="currentWinner === '11'" class="text-3xl font-bold text-white">
              Chupalo Entonces
            </p>
            <p v-if="currentWinner === '13'" class="text-2xl font-bold text-white">
              Agarramela que me Crece
            </p>
          </template>
        </div>
      </transition>
    </div>

    <!-- Botón flotante de toggle modo -->
    <TooltipProvider>
      <Card class="fixed top-4 right-4 z-50 p-2">
        <transition name="fade-scale">
          <div class="flex items-center gap-3 transition-all">
            <Badge
              :variant="isNamesMode ? 'default' : 'secondary'"
              class="flex items-center gap-1 cursor-pointer select-none"
              role="button"
              tabindex="0"
              @click="toggleNamesList"
              @keydown.enter.prevent="toggleNamesList"
              @keydown.space.prevent="toggleNamesList"
            >
              <span v-if="!isNamesMode"><Hash class="h-3 w-3" /></span>
              <span>{{ isNamesMode ? 'Nombres' : 'Números' }}</span>
            </Badge>
            <div>
              <Switch v-model="isNamesMode" @update:model-value="toggleNamesList" />
            </div>
          </div>
        </transition>
      </Card>
    </TooltipProvider>

    <!-- Panel de nombres -->
    <Card v-if="showNamesList && isNamesMode" class="fixed top-20 right-4 z-40 w-80 p-4">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Lista de Nombres</h3>
          <div class="flex items-center gap-2">
            <Badge variant="outline">{{ namesList.length }} nombres</Badge>
            <div class="flex items-center gap-2">
              <span class="text-sm">Multilínea</span>
              <Switch v-model="namesMultiline" />
            </div>
            <TooltipProvider v-if="namesList.length > 0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="clearAllNames"
                    class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limpiar toda la lista</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <template v-if="namesMultiline">
            <textarea
              id="newNameInput"
              v-model="newName"
              @keydown.ctrl.enter.prevent="addName"
              placeholder="Ingresa un nombre o pega varios separados por 'Enter'... (Ctrl+Enter para agregar)"
              class="flex-1 rounded-md bg-transparent border p-2 min-h-[3rem] resize-y"
              rows="3"
            ></textarea>
            <div class="flex items-center justify-between gap-2">
              <Button @click="addName" size="sm" :disabled="!newName.trim()"> Agregar </Button>
              <p class="text-xs text-muted-foreground">
                Puedes pegar una lista (un nombre por línea). Usa Ctrl+Enter para enviar.
              </p>
            </div>
          </template>
          <template v-else>
            <div class="flex gap-2">
              <Input
                id="newNameInput"
                v-model="newName"
                @keyup.enter="addName"
                placeholder="Ingresa un nombre..."
                class="flex-1"
              />
              <Button @click="addName" size="sm" :disabled="!newName.trim()"> Agregar </Button>
            </div>
            <p class="text-xs text-muted-foreground">Modo línea — presiona Enter para agregar.</p>
          </template>
        </div>
        <ScrollArea class="h-60">
          <div v-if="namesList.length === 0" class="text-center py-8 text-muted-foreground">
            <Users class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay nombres en la lista</p>
            <p class="text-sm">Agrega al menos 2 nombres para usar la ruleta</p>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(name, index) in namesList"
              :key="index"
              class="flex items-center justify-between rounded-md border p-2 bg-muted/50"
            >
              <span class="break-all font-medium">{{ name }}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="removeName(index)"
                      class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar "{{ name }}"</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>

    <!-- Contenedor de botones -->
    <TooltipProvider>
      <div class="mt-4 flex w-max-4xl flex-col gap-4 px-2 sm:flex-row">
        <!-- Control de cantidad (visible solo en modo números) -->
        <NumberField
          v-if="!isNamesMode"
          v-model="numOptions"
          :min="2"
          :max="44"
          class="flex-1 bg-zinc-800 rounded-md"
          @update:model-value="updateOptions"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <!-- Botón Actualizar removido: NumberField actualiza automáticamente -->

        <!-- Botón Girar -->
        <Button
          @click="handleSpin"
          :disabled="isNamesMode && namesList.length < 2"
          variant="default"
          size="lg"
          class="flex-1"
        >
          <RotateCcw class="mr-2 h-4 w-4" />
          GIRAR
        </Button>
      </div>
    </TooltipProvider>
  </div>
</template>

<script setup>
import '@/scripts/speech.js'

import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'

// Shadcn-vue components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Toast notifications
import { toast } from 'vue-sonner'

// Lucide icons
import { Users, Hash, X, RotateCcw } from 'lucide-vue-next'
import Background from '@/components/backgrounds/background.vue'

// Refs
const canvasRef = ref(null)
const ctx = ref(null)
const options = ref([])
const startAngle = ref(0)
const spinTimeout = ref(null)
const showNamesList = ref(false)
const isNamesMode = ref(false)
const namesList = ref([])
const newName = ref('')
const namesMultiline = ref(true)
const spinAngleStart = ref(0)
const spinTime = ref(0)
const spinTimeTotal = ref(0)
const numOptions = ref(9)
const numOptionsInput = ref(null)
const winnerDisplayTimeout = ref(null)
const isShowingWinner = ref(false)
const currentWinner = ref('')
const textAngule = ref(2)

// Ruleta Radios
const insideRadius = ref(120)
const textRadius = ref(190)
// Constantes Radios
const OUTSIDE_RADIUS = 240
insideRadius.value = isNamesMode.value ? 90 : 140

// Constantes de tiempo
const WINNER_DISPLAY_DURATION = 40000 // 16 segundos

// Computed
const arc = computed(() => Math.PI / (options.value.length / 2))

// Métodos para manejar la lista de nombres
const toggleNamesList = async (value) => {
  if (typeof value === 'boolean') {
    isNamesMode.value = value
  } else {
    isNamesMode.value = !isNamesMode.value
  }

  if (isNamesMode.value) {
    // Cambiar a modo nombres
    if (namesList.value.length > 0) {
      options.value = [...namesList.value]
    }
    insideRadius.value = 20 // Reducir el radio interior en modo nombres
    textAngule.value = 45 // Ajustar el ángulo del texto
    textRadius.value = 170 // Ajustar el radio del texto

    // Abrir panel y enfocar el input de nombres
    showNamesList.value = true
    await nextTick()
    const el = document.getElementById('newNameInput')
    if (el && typeof el.focus === 'function') el.focus()
  } else {
    // Volver a modo números
    showNamesList.value = false // Cerrar panel al cambiar a números
    updateOptions(numOptions.value)
    insideRadius.value = 120
    textAngule.value = 2 // Ajustar el ángulo del texto
    textRadius.value = 190 // Ajustar el radio del texto
  }
  drawRouletteWheel()
}

const addName = () => {
  const raw = newName.value.trim()
  if (!raw) return

  // Split by newlines to accept multiple names, also accept single-line input
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

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

  newName.value = ''

  // quitar ganador de pantalla
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
    drawRouletteWheel()
  }
}

const removeName = (index) => {
  const removedName = namesList.value[index]
  // quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  namesList.value.splice(index, 1)
  toast.success(`"${removedName}" eliminado de la lista`)
  if (isNamesMode.value) {
    options.value = [...namesList.value]
    drawRouletteWheel()
  }
}

const clearAllNames = () => {
  const count = namesList.value.length
  namesList.value = []
  options.value = []
  toast.success(`${count} nombres eliminados de la lista`)
  // quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }
  if (isNamesMode.value) {
    drawRouletteWheel()
  }
}

// Utilidades de color
const byte2Hex = (n) => {
  const nybHexString = '0123456789ABCDEF'
  return String(nybHexString.substr((n >> 4) & 0x0f, 1)) + nybHexString.substr(n & 0x0f, 1)
}

const RGB2Color = (r, g, b) => {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b)
}

const getColor = (item, maxitem) => {
  const colors = [
    { red: 255, green: 0, blue: 85 }, // Rosa intenso (amor/pasión)
    { red: 255, green: 255, blue: 255 }, // Blanco (pureza/contraste)
    { red: 180, green: 0, blue: 30 }, // Rojo oscuro (amor)
    { red: 255, green: 182, blue: 193 }, // Rosa claro
    { red: 100, green: 0, blue: 30 }, // Vino tinto oscuro
  ]

  const color = colors[item % colors.length]
  return RGB2Color(
    Math.min(255, Math.max(0, color.red)),
    Math.min(255, Math.max(0, color.green)),
    Math.min(255, Math.max(0, color.blue)),
  )
}

// Funciones de dibujo
const drawRouletteWheel = () => {
  if (!canvasRef.value || !ctx.value) return

  ctx.value.clearRect(0, 0, 500, 500)
  ctx.value.strokeStyle = 'black'
  ctx.value.lineWidth = 2
  ctx.value.font = isNamesMode.value ? 'bold 16px Helvetica, Arial' : 'bold 22px Helvetica, Arial'

  for (let i = 0; i < options.value.length; i++) {
    const angle = startAngle.value + i * arc.value
    ctx.value.fillStyle = getColor(i, options.value.length)

    // Dibujar segmento
    ctx.value.beginPath()
    ctx.value.arc(250, 250, OUTSIDE_RADIUS, angle, angle + arc.value, false)
    ctx.value.arc(250, 250, insideRadius.value, angle + arc.value, angle, true)
    ctx.value.lineWidth = 4
    ctx.value.stroke()
    ctx.value.fill()

    // Dibujar texto
    ctx.value.save()
    ctx.value.shadowOffsetX = -1
    ctx.value.shadowOffsetY = -1
    ctx.value.shadowBlur = 0
    ctx.value.shadowColor = 'rgb(0,0,0)'
    ctx.value.lineWidth = 4
    ctx.value.strokeStyle = 'black'
    ctx.value.fillStyle = 'white'

    ctx.value.translate(
      250 + Math.cos(angle + arc.value / 2) * textRadius.value,
      250 + Math.sin(angle + arc.value / 2) * textRadius.value,
    )
    ctx.value.rotate(angle + arc.value / 2 + Math.PI / textAngule.value)

    const text = options.value[i]

    // Medir el ancho del texto
    const maxTextWidth = arc.value * textRadius.value * 0.9
    const textWidth = ctx.value.measureText(text).width

    // Si es muy largo, escalarlo para que quepa en el segmento
    if (textWidth > maxTextWidth) {
      const scaleFactor = maxTextWidth / textWidth
      ctx.value.scale(scaleFactor, scaleFactor)
    }

    // Centrar el texto
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'

    // Dibujar texto centrado
    ctx.value.strokeText(text, 0, 0)
    ctx.value.fillText(text, 0, 0)

    // Restaurar escala si fue aplicada
    if (textWidth > arc.value * textRadius.value) {
      ctx.value.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
      ctx.value.translate(
        250 + Math.cos(angle + arc.value / 2) * textRadius.value,
        250 + Math.sin(angle + arc.value / 2) * textRadius.value,
      )
      ctx.value.rotate(angle + arc.value / 2 + Math.PI / textAngule.value)
    }

    ctx.value.restore()
  }

  // Dibujar flecha
  ctx.value.fillStyle = 'white'
  ctx.value.beginPath()
  ctx.value.moveTo(250 - 4, 250 - (OUTSIDE_RADIUS + 5))
  ctx.value.lineTo(250 + 4, 250 - (OUTSIDE_RADIUS + 5))
  ctx.value.lineTo(250 + 4, 250 - (OUTSIDE_RADIUS - 5))
  ctx.value.lineTo(250 + 9, 250 - (OUTSIDE_RADIUS - 5))
  ctx.value.lineTo(250 + 0, 250 - (OUTSIDE_RADIUS - 13))
  ctx.value.lineTo(250 - 9, 250 - (OUTSIDE_RADIUS - 5))
  ctx.value.lineTo(250 - 4, 250 - (OUTSIDE_RADIUS - 5))
  ctx.value.lineTo(250 - 4, 250 - (OUTSIDE_RADIUS + 5))
  ctx.value.fill()
}

// Animación de la ruleta
const easeOut = (t, b, c, d) => {
  const ts = (t /= d) * t
  const tc = ts * t
  return b + c * (tc + -3 * ts + 3 * t)
}

const rotateWheel = () => {
  spinTime.value += 30
  if (spinTime.value >= spinTimeTotal.value) {
    stopRotateWheel()
    return
  }

  const spinAngle =
    spinAngleStart.value - easeOut(spinTime.value, 0, spinAngleStart.value, spinTimeTotal.value)
  startAngle.value += (spinAngle * Math.PI) / 180
  drawRouletteWheel()
  spinTimeout.value = setTimeout(rotateWheel, 30)
}

const showWinner = (index) => {
  currentWinner.value = options.value[index]
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
    drawRouletteWheel()
  }, WINNER_DISPLAY_DURATION)
}

const stopRotateWheel = () => {
  clearTimeout(spinTimeout.value)
  const degrees = (startAngle.value * 180) / Math.PI + 90
  const arcd = (arc.value * 180) / Math.PI
  const index = Math.floor((360 - (degrees % 360)) / arcd)

  // Mostrar ganador
  showWinner(index)
}

// Métodos principales
const updateOptions = (newNumOptions) => {
  // quitar ganador de pantalla
  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  if (!isNaN(newNumOptions)) {
    numOptions.value = Math.min(44, Math.max(2, newNumOptions))
    options.value = Array.from({ length: numOptions.value }, (_, i) => (i + 1).toString())
    drawRouletteWheel()
  }
}

const spin = () => {
  if (isNamesMode.value && namesList.value.length < 2) {
    toast.error('Agrega al menos 2 nombres para girar la ruleta')
    return
  }

  if (winnerDisplayTimeout.value) {
    clearTimeout(winnerDisplayTimeout.value)
    isShowingWinner.value = false
  }

  // Animación del personaje (si existe)
  const rightImage = document.getElementById('personaje')
  // if (rightImage) {
  //   rightImage.src = "reigen_ag/Tania2_ruleta18.webp";
  //   setTimeout(() => {
  //     rightImage.src = "reigen_ag/Tania1_ruleta18.webp";
  //   }, 350);
  // }

  // Configurar parámetros de giro aleatorios
  const nmajah = Math.floor(Math.random() * (12 - 4 + 1)) + 8
  const numeroRandom2 = Math.floor(Math.random() * 17) + 1
  spinAngleStart.value = Math.random() * nmajah + numeroRandom2
  spinTime.value = 0
  spinTimeTotal.value = Math.random() * 6 + 4 * 2000

  // Reproducir sonido de giro
  const spinSound = document.getElementById('spinSound')
  if (spinSound) {
    spinSound.currentTime = 0
    spinSound.play()
  }

  rotateWheel()
}

// Inicialización
// Event handlers for speech integration
const handleUpdateOptionsFromSpeechWrapper = (e) => handleUpdateOptionsFromSpeech(e.detail)
const handlePlayAudioWrapper = (e) => handlePlayAudio(e.detail)

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
    updateOptions(numOptions.value)
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

  // Limpiar timeouts
  if (spinTimeout.value) clearTimeout(spinTimeout.value)
  if (winnerDisplayTimeout.value) clearTimeout(winnerDisplayTimeout.value)
})

// Watchers
watch([options, numOptions], () => {
  if (!isShowingWinner.value) {
    drawRouletteWheel()
  }
})

// Métodos expuestos al componente padre
defineExpose({
  updateOptions,
  spin,
})

// Handlers para los eventos del DOM
const handleSpin = () => {
  spin()
}

// Métodos para manejar eventos del speech.js
const handleSpinFromSpeech = () => {
  spin()
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
    toggleNamesList()
    updateOptions(n)
  } else {
    updateOptions(n)
  }
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
