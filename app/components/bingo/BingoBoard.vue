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
            :draggable="isDragMode"
            @click="!isDragMode && $emit('toggleCell', index)"
            @keydown="handleCellKey(index, $event)"
            @dragstart="isDragMode && $emit('dragStart', index, $event)"
            @dragover="isDragMode && $emit('dragOver', index, $event)"
            @dragleave="isDragMode && $emit('dragLeave')"
            @drop="isDragMode && $emit('drop', index, $event)"
            @dragend="isDragMode && $emit('dragEnd')"
            tabindex="0"
            role="button"
            :aria-pressed="cell.marked"
            :data-cell="index"
            class="group cell relative flex items-center justify-center overflow-hidden rounded border bg-card transition-all duration-200 focus:outline-none"
            :class="{
              'bg-accent border-accent/80': cell.marked,
              'hover:scale-[1.02]': !cell.marked && !isDragMode,
              'scale-[0.98]': cell.marked,
              'cursor-pointer': !isDragMode,
              'cursor-move': isDragMode,
              'hover:bg-accent': !isDragMode,
              'hover:bg-blue-50 dark:hover:bg-blue-950': isDragMode && dragOverIndex !== index,
              'opacity-50': isDragMode && draggedIndex === index,
              'ring-2 ring-blue-400 ring-offset-1': isDragMode && draggedIndex === index,
              'border-blue-300': isDragMode,
              'shadow-lg': isDragMode && draggedIndex === index,
              'bg-green-100 dark:bg-green-900 border-green-400 ring-2 ring-green-400': isDragMode && dragOverIndex === index && draggedIndex !== index,
              'scale-105': isDragMode && dragOverIndex === index && draggedIndex !== index
            }"
          >
            <!-- Indicador de drag handle cuando está en modo drag -->
            <div 
              v-if="isDragMode" 
              class="absolute top-1 right-1 text-muted-foreground opacity-60"
            >
              <GripVertical class="h-3 w-3" />
            </div>
            
            <span 
              :style="getPreviewTextStyle(cell.text)" 
              class="break-words px-1 text-center font-medium leading-tight hyphens-auto"
              :class="{ 'select-none': !isDragMode, 'pointer-events-none': isDragMode }"
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
      <div class="flex justify-center gap-2 flex-wrap">
        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('shuffleBingo')" 
          variant="ghost" 
          size="sm" 
          title="Reordenar las opciones actuales"
          :disabled="isDragMode"
        >
          <Shuffle class="mr-1 h-3 w-3" /> Reordenar
        </Button>

        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('toggleDragMode')" 
          :variant="isDragMode ? 'default' : 'ghost'" 
          size="sm" 
          :title="isDragMode ? 'Desactivar modo reordenamiento' : 'Activar modo reordenamiento'"
        >
          <Move class="mr-1 h-3 w-3" /> 
          {{ isDragMode ? 'Salir Reorden' : 'Reordenar Manual' }}
        </Button>

        <Button 
          v-if="bingoGrid.length > 0" 
          @click="$emit('saveBoard')" 
          variant="ghost" 
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
          :disabled="isDragMode"
        >
          <Trash2 class="mr-1 h-3 w-3" /> Limpiar
        </Button>
      </div>

      <!-- Mensaje informativo del modo drag -->
      <div v-if="isDragMode" class="mt-1 flex items-center text-sm text-blue-600 dark:text-blue-400">
        <Move class="mr-1 h-3 w-3" /> Arrastra una celda hacia otra para intercambiar sus posiciones
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
    <div class="absolute top-0 left-0 w-sm hidden lg:block">
      <img 
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        src="/reigen_ag/stickers/leji_halo.gif" 
        alt="leji girando" 
      />
    </div>
    <div class="absolute bottom-0 right-8 w-64 hidden lg:block">
      <img 
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        src="/roldyoran/DJ_RULETA.webp" 
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
            :draggable="isDragMode"
            @click="!isDragMode && $emit('toggleCell', index)"
            @dragstart="isDragMode && $emit('dragStart', index, $event)"
            @dragover="isDragMode && $emit('dragOver', index, $event)"
            @dragleave="isDragMode && $emit('dragLeave')"
            @drop="isDragMode && $emit('drop', index, $event)"
            @dragend="isDragMode && $emit('dragEnd')"
            class="group relative flex items-center justify-center overflow-hidden rounded-lg border-2 bg-card shadow-sm transition-all duration-200" 
            :class="{ 
              'bg-accent border-accent/80': cell.marked, 
              'hover:scale-[1.02]': !cell.marked && !isDragMode, 
              'scale-[0.99]': cell.marked,
              'cursor-pointer': !isDragMode,
              'cursor-move': isDragMode,
              'hover:bg-accent': !isDragMode,
              'hover:bg-blue-50 dark:hover:bg-blue-950': isDragMode && dragOverIndex !== index,
              'opacity-50': isDragMode && draggedIndex === index,
              'ring-4 ring-blue-400 ring-offset-2': isDragMode && draggedIndex === index,
              'border-blue-300': isDragMode,
              'shadow-xl': isDragMode && draggedIndex === index,
              'bg-green-100 dark:bg-green-900 border-green-400 ring-4 ring-green-400': isDragMode && dragOverIndex === index && draggedIndex !== index,
              'scale-105': isDragMode && dragOverIndex === index && draggedIndex !== index
            }"
          >
            <!-- Indicador de drag handle para pantalla completa -->
            <div 
              v-if="isDragMode" 
              class="absolute top-2 right-2 text-muted-foreground opacity-70"
            >
              <GripVertical class="h-6 w-6" />
            </div>
            
            <span 
              class="break-words  p-2 text-center font-medium leading-tight hyphens-auto" 
              :class="{ 'select-none': !isDragMode, 'pointer-events-none': isDragMode }"
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
import { computed, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue'
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
  Trash2,
  Move,
  GripVertical
} from 'lucide-vue-next'
import confetti from 'canvas-confetti'

interface BingoCell {
  text: string
  marked: boolean
}

interface Props {
  bingoGrid: BingoCell[]
  boardSize: number
  savedBoard: boolean
  isDragMode: boolean
  draggedIndex: number | null
  dragOverIndex: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggleCell': [index: number]
  'shuffleBingo': []
  'saveBoard': []
  'resetBingo': []
  'toggleDragMode': []
  'dragStart': [index: number, event: DragEvent]
  'dragOver': [index: number, event: DragEvent]
  'dragLeave': []
  'drop': [index: number, event: DragEvent]
  'dragEnd': []
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

// Bingo detection logic
const checkForBingo = (grid: BingoCell[], size: number): { hasBingo: boolean, lines: number[][] } => {
  const completedLines: number[][] = []
  
  // Check horizontal lines
  for (let row = 0; row < size; row++) {
    const line: number[] = []
    let isComplete = true
    
    for (let col = 0; col < size; col++) {
      const index = row * size + col
      line.push(index)
      if (!grid[index]?.marked) {
        isComplete = false
      }
    }
    
    if (isComplete) {
      completedLines.push(line)
    }
  }
  
  // Check vertical lines
  for (let col = 0; col < size; col++) {
    const line: number[] = []
    let isComplete = true
    
    for (let row = 0; row < size; row++) {
      const index = row * size + col
      line.push(index)
      if (!grid[index]?.marked) {
        isComplete = false
      }
    }
    
    if (isComplete) {
      completedLines.push(line)
    }
  }
  
  // Check main diagonal (top-left to bottom-right)
  const mainDiagonal: number[] = []
  let mainDiagComplete = true
  for (let i = 0; i < size; i++) {
    const index = i * size + i
    mainDiagonal.push(index)
    if (!grid[index]?.marked) {
      mainDiagComplete = false
    }
  }
  if (mainDiagComplete) {
    completedLines.push(mainDiagonal)
  }
  
  // Check anti-diagonal (top-right to bottom-left)
  const antiDiagonal: number[] = []
  let antiDiagComplete = true
  for (let i = 0; i < size; i++) {
    const index = i * size + (size - 1 - i)
    antiDiagonal.push(index)
    if (!grid[index]?.marked) {
      antiDiagComplete = false
    }
  }
  if (antiDiagComplete) {
    completedLines.push(antiDiagonal)
  }
  
  return {
    hasBingo: completedLines.length > 0,
    lines: completedLines
  }
}

const previousCompletedLines = ref<Set<string>>(new Set())

const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.05, y: 0.95 }
  });
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.95, y: 0.95 }
  });
}

// Watch for bingo completions
watch(() => props.bingoGrid, (newGrid) => {
  if (!newGrid || newGrid.length === 0) {
    previousCompletedLines.value.clear()
    return
  }
  
  const { hasBingo, lines } = checkForBingo(newGrid, props.boardSize)
  
  if (hasBingo && lines.length > 0) {
    const currentLines = new Set(lines.map(line => line.join(',')))
    
    // Check if there are new completed lines
    const newLines = Array.from(currentLines).filter(line => !previousCompletedLines.value.has(line))
    
    if (newLines.length > 0) {
      // New bingo line(s) completed!
      triggerConfetti()
      
      // Update the set of completed lines
      previousCompletedLines.value = currentLines
    }
  } else {
    // No bingo, clear the previous lines
    previousCompletedLines.value.clear()
  }
}, { deep: true })

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
    if (!props.isDragMode) {
      emit('toggleCell', index)
    }
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
  color: #e41e1e;
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
  position: relative;
}

.cell:focus {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 20px rgba(2,6,23,0.5), 0 0 0 4px hsl(var(--ring) / 0.2);
}

/* Estilos para drag and drop */
.cell[draggable="true"] {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.cell[draggable="true"]:hover {
  transform: translateY(-1px);
}

.cell[draggable="true"]:active {
  transform: scale(0.98);
}

/* Indicador visual durante el drag */
.cell.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(0.95);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Zona de intercambio disponible */
.cell.drag-over {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgb(34, 197, 94);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

/* Animación suave para transiciones */
.cell {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estilos para el handle de drag */
.drag-handle {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cell:hover .drag-handle {
  opacity: 1;
}
</style>