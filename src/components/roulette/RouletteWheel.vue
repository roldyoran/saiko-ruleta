<template>
  <div class="relative">
    <canvas ref="canvasRef" width="500" height="500" class="relative"></canvas>

    <!-- Mostrar ganador -->
    <transition name="fade-scale">
      <div
        v-if="isShowingWinner"
        class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 shadow-[0_0_20px_10px_rgba(0,0,0,0.3)] backdrop-blur-sm"
        :class="{
          'bg-black/85': currentWinner === '11' || currentWinner === '13',
        }"
      >
        <template v-if="isNamesMode">
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue-sonner'

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
  isShowingWinner: {
    type: Boolean,
    default: false,
  },
  currentWinner: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['winner-selected'])

// Refs
const canvasRef = ref(null)
const ctx = ref(null)
const startAngle = ref(0)
const spinTimeout = ref(null)
const spinAngleStart = ref(0)
const spinTime = ref(0)
const spinTimeTotal = ref(0)

// Ruleta Radios
const insideRadius = ref(120)
const textRadius = ref(190)
const textAngule = ref(2)

// Constantes Radios
const OUTSIDE_RADIUS = 240

// Computed
const arc = computed(() => Math.PI / (props.options.length / 2))

// Ajustar radios según el modo
watch(
  () => props.isNamesMode,
  (newMode) => {
    insideRadius.value = newMode ? 20 : 120
    textAngule.value = newMode ? 45 : 2
    textRadius.value = newMode ? 170 : 190
    drawRouletteWheel()
  },
)

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
  if (!canvasRef.value || !ctx.value || props.options.length === 0) return

  ctx.value.clearRect(0, 0, 500, 500)
  ctx.value.strokeStyle = 'black'
  ctx.value.lineWidth = 2
  ctx.value.font = props.isNamesMode ? 'bold 16px Helvetica, Arial' : 'bold 22px Helvetica, Arial'

  for (let i = 0; i < props.options.length; i++) {
    const angle = startAngle.value + i * arc.value
    ctx.value.fillStyle = getColor(i, props.options.length)

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

    const text = props.options[i]

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

const stopRotateWheel = () => {
  clearTimeout(spinTimeout.value)
  const degrees = (startAngle.value * 180) / Math.PI + 90
  const arcd = (arc.value * 180) / Math.PI
  const index = Math.floor((360 - (degrees % 360)) / arcd)

  // Emitir el ganador al componente padre
  emit('winner-selected', {
    index,
    winner: props.options[index],
  })
}

// Método público para iniciar el giro
const spin = () => {
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
onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
    drawRouletteWheel()
  }
})

// Watchers
watch(
  () => props.options,
  () => {
    if (!props.isShowingWinner) {
      drawRouletteWheel()
    }
  },
  { deep: true },
)

// Exponer métodos públicos
defineExpose({
  spin,
  drawRouletteWheel,
})
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
