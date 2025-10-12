<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle class="text-xl">
          Tablero de Bingo
          <Badge variant="secondary" class="ml-2">{{ boardSize }}x{{ boardSize }}</Badge>
        </CardTitle>

        <div class="flex items-center gap-4">
          <div class="text-sm text-muted-foreground">Marcados: {{ markedCells }} / {{ totalCells }}</div>
          <Button 
            @click="openFullscreen" 
            :disabled="bingoGrid.length === 0" 
            variant="secondary" 
            class="gap-2"
          >
            <Maximize class="h-4 w-4" />
            Pantalla Completa
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <!-- Contenido del tablero o placeholder -->
      <div class="flex justify-center items-center">
        <div 
          v-if="bingoGrid.length > 0"
          class="grid gap-1 preview-grid"
          :style="{ 
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
            width: previewGridSize + 'px',
            height: previewGridSize + 'px'
          }"
        >
          <div
            v-for="(cell, index) in bingoGrid"
            :key="index"
            @click="$emit('toggleCell', index)"
            @keydown="handleCellKey(index, $event)"
            tabindex="0"
            role="button"
            :aria-pressed="cell.marked"
            :data-cell="index"
            class="group cell relative flex cursor-pointer items-center justify-center overflow-hidden rounded border bg-card transition-all duration-200 hover:bg-accent focus:outline-none"
            :class="{
              'bg-accent border-accent/80': cell.marked,
              'hover:scale-[1.02]': !cell.marked,
              'scale-[0.98]': cell.marked
            }"
          >
            <span 
              :style="getPreviewTextStyle(cell.text)" 
              class="select-none break-words px-1 text-center font-medium leading-tight hyphens-auto"
            >
              {{ cell.text }}
            </span>
            <div 
              v-if="cell.marked" 
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <X class="x-mark text-destructive" stroke-width="2.5" />
            </div>
          </div>
        </div>

        <div v-else class="w-full max-w-[720px] rounded-lg border bg-muted/30 py-12 text-center">
          <Grid3X3 class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p class="text-lg">No hay un tablero generado</p>
          <p class="mt-2 text-sm text-muted-foreground">
            Genera un bingo desde la sección de configuración o carga uno guardado.
          </p>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex flex-col items-center gap-2">
      <div class="flex justify-center gap-2">
        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('shuffleBingo')" 
          variant="ghost" 
          size="sm" 
          title="Reordenar las opciones actuales"
        >
          <Shuffle class="mr-1 h-3 w-3" /> Reordenar
        </Button>

        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('saveBoard')" 
          variant="outline" 
          size="sm" 
          title="Guardar tablero en local"
        >
          <Save class="mr-1 h-3 w-3" /> Guardar
        </Button>

        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('resetBingo')" 
          variant="ghost" 
          size="sm"
        >
          <Trash2 class="mr-1 h-3 w-3" /> Limpiar
        </Button>
      </div>

      <div v-if="savedBoard" class="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
        <CheckCircle class="mr-1 h-3 w-3" /> Tablero guardado correctamente
      </div>
    </CardFooter>

    <!-- Modal de pantalla completa -->
    <div 
      v-if="showFullscreen" 
      class="fixed inset-0 bg-zinc-950/80 backdrop-blur-lg z-50 flex items-center justify-center" 
      @click.self="closeFullscreen"
    >
      <div class="absolute top-0 left-0 w-sm hidden md:block">
        <img 
          src="https://github.com/roldyoran/Saiko_Ruleta/blob/main/public/reigen_ag/stickers/leji_halo.gif?raw=true" 
          alt="leji girando" 
        />
      </div>
      <div class="absolute bottom-0 right-8 w-64 hidden md:block">
        <img 
          src="https://github.com/roldyoran/Saiko_Ruleta/blob/main/public/roldyoran/DJ_RULETA.webp?raw=true" 
          alt="DJRULETA" 
          class="w-full h-auto" 
          style="transform: scaleX(-1);" 
        />
      </div>

      <div class="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold">Tablero de Bingo</h2>
          <p class="text-sm text-muted-foreground">Marcados: {{ markedCells }} / {{ totalCells }}</p>
        </div>
        <Button @click="closeFullscreen" variant="secondary">
          <X class="mr-2 h-4 w-4" /> Cerrar
        </Button>
      </div>

      <div class="flex justify-center items-center w-full h-full pt-16 pb-4">
        <div 
          class="grid gap-2" 
          :style="{ 
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`, 
            gridTemplateRows: `repeat(${boardSize}, 1fr)`, 
            width: `${fullscreenGridSize}px`, 
            height: `${fullscreenGridSize}px` 
          }"
        >
          <div 
            v-for="(cell, index) in bingoGrid" 
            :key="index" 
            @click="$emit('toggleCell', index)" 
            class="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-card shadow-sm transition-all duration-200 hover:bg-accent" 
            :class="{ 
              'bg-accent border-accent/80': cell.marked, 
              'hover:scale-[1.02]': !cell.marked, 
              'scale-[0.99]': cell.marked 
            }"
          >
            <span 
              class="select-none break-words p-2 text-center font-medium leading-tight hyphens-auto" 
              :style="getFullscreenTextStyle(cell.text)"
            >
              {{ cell.text }}
            </span>
            <div 
              v-if="cell.marked" 
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <X 
                class="text-destructive font-bold opacity-90 drop-shadow-xl" 
                :style="getFullscreenMarkStyle()" 
                stroke-width="3" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Maximize, 
  Grid3X3, 
  Shuffle, 
  Save, 
  CheckCircle,
  Trash2
} from 'lucide-vue-next'

interface BingoCell {
  text: string
  marked: boolean
}

interface Props {
  bingoGrid: BingoCell[]
  boardSize: number
  savedBoard: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggleCell': [index: number]
  'shuffleBingo': []
  'saveBoard': []
  'resetBingo': []
}>()

const showFullscreen = ref(false)
const windowSize = ref({ 
  width: typeof window !== 'undefined' ? window.innerWidth : 0, 
  height: typeof window !== 'undefined' ? window.innerHeight : 0 
})

const totalCells = computed(() => props.boardSize * props.boardSize)
const markedCells = computed(() => props.bingoGrid.filter(cell => cell.marked).length)

const fullscreenGridSize = computed(() => {
  const w = windowSize.value.width || 0
  const h = windowSize.value.height || 0
  const size = Math.min(Math.max(h - 140, 0), Math.max(w - 80, 0), 980) * 0.95
  return Math.max(520, size)
})

const previewGridSize = computed(() => {
  const maxPreview = 520
  const minPreview = 200
  const w = windowSize.value.width || 800
  const h = windowSize.value.height || 600

  const candidate = Math.min(maxPreview, Math.max(minPreview, Math.min(w * 0.7, h * 0.55)))
  const cell = Math.max(24, Math.floor(candidate / Math.max(props.boardSize, 1)))
  return cell * props.boardSize
})

const openFullscreen = (): void => {
  showFullscreen.value = true
  document.body.style.overflow = 'hidden'
}

const closeFullscreen = (): void => {
  showFullscreen.value = false
  document.body.style.overflow = 'auto'
}

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && showFullscreen.value) {
    closeFullscreen()
  }
}

const handleResize = (): void => {
  if (typeof window === 'undefined') return
  windowSize.value.width = window.innerWidth
  windowSize.value.height = window.innerHeight
}

const handleCellKey = (index: number, event: KeyboardEvent): void => {
  const cols = props.boardSize
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('toggleCell', index)
    return
  }

  let targetIndex: number | null = null
  if (event.key === 'ArrowRight') targetIndex = (index + 1) % props.bingoGrid.length
  else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + props.bingoGrid.length) % props.bingoGrid.length
  else if (event.key === 'ArrowDown') targetIndex = Math.min(props.bingoGrid.length - 1, index + cols)
  else if (event.key === 'ArrowUp') targetIndex = Math.max(0, index - cols)

  if (targetIndex !== null) {
    event.preventDefault()
    const el = document.querySelector(`[data-cell=\"${targetIndex}\"]`) as HTMLElement | null
    if (el) el.focus()
  }
}

const getFullscreenTextStyle = (text: string): CSSProperties => {
  const cellSize = fullscreenGridSize.value / Math.max(props.boardSize, 1)
  let fontSize = cellSize * 0.165

  if (text.length > 80) fontSize *= 0.55
  else if (text.length > 60) fontSize *= 0.65
  else if (text.length > 40) fontSize *= 0.75
  else if (text.length > 25) fontSize *= 0.85

  fontSize = Math.max(10, Math.min(fontSize, 40))

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${Math.max(fontSize * 1.05, 12)}px`,
    whiteSpace: 'normal',
    overflowWrap: 'break-word' as any,
    wordBreak: 'break-word' as any,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '6px'
  } as CSSProperties
}

const getFullscreenMarkStyle = () => {
  const cellSize = fullscreenGridSize.value / Math.max(props.boardSize, 1)
  const size = Math.max(cellSize * 0.9, 64)
  return { width: `${size}px`, height: `${size}px`, color: '#dc2626' }
}

const getPreviewTextStyle = (text: string): CSSProperties => {
  const gridPx = previewGridSize.value
  const cellSize = gridPx / Math.max(props.boardSize, 1)
  let fontSize = Math.min(18, Math.max(11, Math.floor(cellSize * 0.15)))
  if (text.length > 80) fontSize = Math.max(10, Math.floor(fontSize * 0.6))
  else if (text.length > 50) fontSize = Math.max(11, Math.floor(fontSize * 0.75))
  return { fontSize: `${fontSize}px`, lineHeight: '1.05', padding: '6px', textAlign: 'center' } as CSSProperties
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.x-mark {
  width: 5.5rem;
  height: 5.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  opacity: 0.98;
  color: #dc2626;
  filter: drop-shadow(0 10px 26px rgba(0,0,0,0.72));
  line-height: 1;
}

.preview-grid { 
  border-radius: 8px; 
  overflow: hidden; 
}

.cell {
  padding: 6px;
  min-width: 0;
}

.cell:focus {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 20px rgba(2,6,23,0.5), 0 0 0 4px hsl(var(--ring) / 0.2);
}
</style>