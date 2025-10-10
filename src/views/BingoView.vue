<template>
  <div class="min-h-screen p-4 mb-6 bingo-root">
    <div class="mx-auto max-w-6xl">
      <h1 class="mb-6 text-center text-5xl font-bold">Bingo</h1>

      <!-- Panel de configuración -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="flex items-center text-xl">
            <Settings class="mr-2 h-5 w-5" />
            Configuración del Bingo
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Tamaño del bingo -->
          <div>
            <Label class="mb-2 block">Tamaño del tablero (cuadrado):</Label>
            <div class="max-w-xs">
              <div class="flex items-center gap-3">
                <Input
                  id="boardSizeInput"
                  v-model="boardSize"
                  type="number"
                  :min="2"
                  :max="10"
                  aria-label="Tamaño del tablero (número)"
                  class="w-20"
                  placeholder="Ej: 5"
                />

                <Slider
                  v-model="boardSizeSlider"
                  :min="2"
                  :max="10"
                  :step="1"
                  aria-label="Tamaño del tablero (deslizador)"
                  class="w-full"
                />
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                Un tablero de {{ boardSize }}x{{ boardSize }} necesita {{ totalCells }} opciones
              </p>
            </div>
          </div>

          <!-- Agregar opciones -->
          <div>
            <Label class="mb-2 block">Agregar opción:</Label>
            <div class="flex w-full items-start gap-2">
              <div class="flex-1">
                <Input
                  v-if="!multiLineMode"
                  v-model="newOption"
                  @keypress.enter.prevent="addOption"
                  type="text"
                  placeholder="Escribe una opción..."
                  class="w-full"
                />

                <Textarea
                  v-else
                  v-model="multiText"
                  @keydown.ctrl.enter.prevent="addOption"
                  placeholder="Pega o escribe opciones, una por línea (Ctrl+Enter para añadir)"
                  class="min-h-[60px]"
                />
              </div>

              <div class="flex flex-col gap-2">
                <Button
                  @click="addOption"
                  variant="secondary"
                  class="whitespace-nowrap"
                  title="Agregar opción(es)"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Agregar
                </Button>

                <Button
                  @click="multiLineMode = !multiLineMode"
                  :variant="multiLineMode ? 'default' : 'outline'"
                  size="sm"
                  :title="multiLineMode ? 'Modo línea' : 'Modo multilínea'"
                >
                  <FileText class="mr-1 h-3 w-3" />
                  {{ multiLineMode ? 'Línea' : 'Multi' }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Lista de opciones y progreso -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium">
                Opciones ({{ options.length }})
                <Badge v-if="hasExtraOptions" variant="secondary" class="ml-2">+{{ options.length - totalCells }} extra</Badge>
              </h3>
            </div>

            <div class="mb-3" aria-hidden="true">
              <Progress :model-value="percentOptions" class="h-2" />
              <div class="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{{ options.length }} disponibles</span>
                <span>{{ totalCells }} necesarias</span>
              </div>
            </div>

            <div
              v-if="options.length > 0"
              class="grid gap-2"
              :class="{
                'grid-cols-1': options.length <= 5,
                'grid-cols-2': options.length > 5 && options.length <= 15,
                'grid-cols-3': options.length > 15 && options.length <= 30,
                'grid-cols-4': options.length > 30
              }"
            >
              <div
                v-for="(option, index) in options"
                :key="index"
                class="group relative flex items-center justify-between rounded-md border bg-card px-3 py-2 transition-colors hover:bg-accent/25"
              >
                <span class="truncate pr-2 text-sm">{{ option }}</span>
                <Button
                  @click="removeOption(index)"
                  variant="ghost"
                  size="sm"
                  class="h-7 w-7 p-0"
                  title="Eliminar opción"
                >
                  <X class="h-4 w-4" />
                </Button>

                <div
                  v-if="option.length > 40"
                  class="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 max-w-[60vw] -translate-x-1/2 transform break-words rounded border bg-popover p-2 text-sm text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100"
                >
                  {{ option }}
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border-2 border-dashed bg-muted/50 py-6 text-center">
              <FileQuestion class="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">No hay opciones agregadas</p>
              <p class="mt-1 text-xs text-muted-foreground">Agrega al menos {{ totalCells }} opciones para generar el bingo</p>
              <p class="mt-2 text-xs text-muted-foreground/70">Consejo: puedes pegar varias líneas en el modo 'Multi' para añadir varias opciones a la vez.</p>
            </div>

            <div v-if="hasExtraOptions && bingoGrid.length === 0" class="mt-2 rounded-lg border bg-muted/30 p-3">
              <p class="text-sm">
                <Lightbulb class="mr-2 inline h-4 w-4" />
                <strong>¡Genial!</strong> Tienes {{ options.length - totalCells }} opciones extra. Cada vez que generes o reordenes el tablero, se seleccionarán {{ totalCells }} opciones aleatorias.
              </p>
            </div>
          </div>

          <!-- Botones de acción (principal) -->
          <div class="flex flex-wrap gap-4" role="toolbar" aria-label="Acciones principales">
            <Button
              @click="generateBingo"
              :disabled="!canGenerateBingo"
              aria-label="Generar bingo"
              class="px-6 py-3"
            >
              <Dice6 class="mr-2 h-4 w-4" />
              Generar Bingo
            </Button>

            <Button
              @click="clearAllOptions"
              variant="destructive"
              aria-label="Limpiar todas las opciones"
              class="px-4 py-3"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Limpiar Opciones
            </Button>

            <div class="ml-auto flex items-center gap-2 text-xs">
              <Badge variant="outline">Opciones: {{ options.length }}</Badge>
              <Badge variant="outline">Necesarias: {{ totalCells }}</Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex-col items-start space-y-4">
          <!-- Sección de compartir -->
          <div class="w-full">
            <h3 class="mb-2 flex items-center text-sm font-medium">
              <Link class="mr-2 h-4 w-4" />
              Compartir Opciones
            </h3>

            <div class="mb-2 flex gap-2">
              <Button @click="generateOptionsLink" variant="secondary" size="sm">
                <Share class="mr-1 h-3 w-3" />
                Compartir Opciones
              </Button>

              <Button
                v-if="bingoGrid.length > 0"
                @click="generateBoardLink"
                variant="secondary"
                size="sm"
                title="Compartir el tablero (incluye marcas)"
              >
                <Share class="mr-1 h-3 w-3" />
                Compartir Tablero
              </Button>

              <Button v-if="shareLink" @click="copyToClipboard" variant="outline" size="sm" :class="{ 'bg-accent': copied }">
                <Copy class="mr-1 h-3 w-3" />
                {{ copied ? 'Copiado' : 'Copiar' }}
              </Button>
            </div>

            <div class="space-y-1">
              <Input :model-value="shareLink" readonly class="text-xs" />
              <p class="text-xs text-muted-foreground">Comparte este enlace para que otros puedan usar las mismas opciones</p>
            </div>
          </div>
        </CardFooter>

        <!-- Area de estado accesible -->
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          <span v-if="savedBoard">Tablero guardado</span>
          <span v-else-if="copied">Enlace copiado al portapapeles</span>
        </div>
      </Card>

      <!-- Vista previa del Tablero de Bingo (siempre visible) -->
      <Card>
        <CardHeader>
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle class="text-xl">
              Tablero de Bingo
              <Badge variant="secondary" class="ml-2">{{ boardSize }}x{{ boardSize }}</Badge>
            </CardTitle>

            <div class="flex items-center gap-4">
              <div class="text-sm text-muted-foreground">Marcados: {{ markedCells }} / {{ totalCells }}</div>
              <Button @click="openFullscreen" :disabled="bingoGrid.length === 0" variant="secondary" class="gap-2">
                <Maximize class="h-4 w-4" />
                Pantalla Completa
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <!-- Contenido del tablero o placeholder -->
          <div class="flex justify-center items-center">
            <div v-if="bingoGrid.length > 0"
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
                @click="toggleCell(index)"
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
                <span :style="getPreviewTextStyle(cell.text)" class="select-none break-words px-1 text-center font-medium leading-tight hyphens-auto">{{ cell.text }}</span>
                <div v-if="cell.marked" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <X class="x-mark text-destructive" stroke-width="2.5" />
                </div>
              </div>
            </div>

            <div v-else class="w-full max-w-[720px] rounded-lg border bg-muted/30 py-12 text-center">
              <Grid3X3 class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p class="text-lg">No hay un tablero generado</p>
              <p class="mt-2 text-sm text-muted-foreground">Genera un bingo desde la sección de configuración o carga uno guardado.</p>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex flex-col items-center gap-2">
          <div class="flex justify-center gap-2">
            <Button v-if="bingoGrid.length > 0" @click="shuffleBingo" variant="ghost" size="sm" title="Reordenar las opciones actuales">
              <Shuffle class="mr-1 h-3 w-3" /> Reordenar
            </Button>

            <!-- Toggle center free space (only meaningful for odd-sized boards) -->
            <Button v-if="boardSize % 2 === 1" @click="toggleCenterFree" :variant="centerFreeEnabled ? 'default' : 'outline'" size="sm" title="Forzar Espacio Libre en el centro">
              {{ centerFreeEnabled ? 'Espacio Libre: ON' : 'Forzar Espacio Libre' }}
            </Button>

            <Button v-if="bingoGrid.length > 0" @click="saveBoard" variant="outline" size="sm" title="Guardar tablero en local">
              <Save class="mr-1 h-3 w-3" /> Guardar
            </Button>

            <Button v-if="bingoGrid.length > 0" @click="resetBingo" variant="ghost" size="sm">
              <Trash2 class="mr-1 h-3 w-3" /> Limpiar
            </Button>
          </div>

          <div v-if="savedBoard" class="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle class="mr-1 h-3 w-3" /> Tablero guardado correctamente
          </div>
        </CardFooter>
      </Card>

      <!-- Modal de pantalla completa -->
      <div v-if="showFullscreen" class="fixed inset-0 bg-zinc-950/80 backdrop-blur-lg z-50 flex items-center justify-center" @click.self="closeFullscreen">
        <div class="absolute top-0 left-0 w-sm hidden md:block">
          <img src="https://github.com/roldyoran/Saiko_Ruleta/blob/main/public/reigen_ag/stickers/leji_halo.gif?raw=true" alt="leji girando" />
        </div>
        <div class="absolute bottom-0 right-8 w-64 hidden md:block">
          <img src="https://github.com/roldyoran/Saiko_Ruleta/blob/main/public/roldyoran/DJ_RULETA.webp?raw=true" alt="DJRULETA" class="w-full h-auto" style="transform: scaleX(-1);" />
        </div>

        <div class="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
          <div>
            <!-- Slightly smaller header so the larger grid has more room -->
            <h2 class="text-lg font-bold">Tablero de Bingo</h2>
            <p class="text-sm text-muted-foreground">Marcados: {{ markedCells }} / {{ totalCells }}</p>
          </div>
          <Button @click="closeFullscreen" variant="secondary"><X class="mr-2 h-4 w-4" /> Cerrar</Button>
        </div>

        <div class="flex justify-center items-center w-full h-full pt-16 pb-4">
          <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gridTemplateRows: `repeat(${boardSize}, 1fr)`, width: `${fullscreenGridSize}px`, height: `${fullscreenGridSize}px` }">
            <div v-for="(cell, index) in bingoGrid" :key="index" @click="toggleCell(index)" class="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-card shadow-sm transition-all duration-200 hover:bg-accent" :class="{ 'bg-accent border-accent/80': cell.marked, 'hover:scale-[1.02]': !cell.marked, 'scale-[0.99]': cell.marked }">
              <span class="select-none break-words p-2 text-center font-medium leading-tight hyphens-auto" :style="getFullscreenTextStyle(cell.text)">{{ cell.text }}</span>
              <div v-if="cell.marked" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <X class="text-destructive font-bold opacity-90 drop-shadow-xl" :style="getFullscreenMarkStyle()" stroke-width="3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, type CSSProperties, nextTick } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  Plus, 
  FileText, 
  FileQuestion, 
  Lightbulb, 
  Dice6, 
  Trash2, 
  Link, 
  Share, 
  Copy, 
  Maximize, 
  Grid3X3, 
  Shuffle, 
  Save, 
  CheckCircle,
  Settings
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface BingoCell {
  text: string
  marked: boolean
  free?: boolean
}

// Estado reactivo
const options = ref<string[]>([])
const newOption = ref('')
const multiLineMode = ref(false)
const multiText = ref('')
const boardSize = ref(5)
const boardSizeSlider = ref([5]) // Para el slider que requiere array
const bingoGrid = ref<BingoCell[]>([])
const showFullscreen = ref(false)
// whether user requested a forced center free space (persists until toggled off)
const centerFreeEnabled = ref(false)
// store previous center text so we can restore when disabling the free space
const centerPrevText = ref<string | null>(null)
const shareLink = ref('')
const copied = ref(false)
const savedBoard = ref(false)
// restoredNotice removed after debugging
const isRestoring = ref(false)
// Reactive window size so fullscreen layout recalculates on resize
const windowSize = ref({ width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 })

// Computed properties
const totalCells = computed(() => boardSize.value * boardSize.value)
const markedCells = computed(() => bingoGrid.value.filter(cell => cell.marked).length)
const canGenerateBingo = computed(() => options.value.length >= totalCells.value)
const hasExtraOptions = computed(() => options.value.length > totalCells.value)
const centerIndex = computed(() => {
  // row-major index of center when boardSize is odd
  if (boardSize.value % 2 === 0) return -1
  const mid = Math.floor(boardSize.value / 2)
  return mid * boardSize.value + mid
})
const canHaveCenterFree = computed(() => boardSize.value % 2 === 1 && bingoGrid.value.length === totalCells.value)
const hasCenterFree = computed(() => {
  const ci = centerIndex.value
  if (ci < 0) return false
  const cell = bingoGrid.value[ci]
  if (!cell) return false
  return !!cell.free
})
const fullscreenGridSize = computed(() => {
  // Use reactive windowSize so the grid and font sizes update on resize
  const w = windowSize.value.width || 0
  const h = windowSize.value.height || 0
  // Increase available space slightly so fullscreen feels larger while clamping to sensible bounds
  const size = Math.min(Math.max(h - 140, 0), Math.max(w - 80, 0), 980) * 0.95
  // raise minimum so small devices still show a usable grid
  return Math.max(520, size)
})

// UI helpers
const percentOptions = computed(() => {
  if (totalCells.value <= 0) return 0
  const pct = Math.round((options.value.length / totalCells.value) * 100)
  return Math.min(100, Math.max(0, pct))
})

// Compute a preview grid size that fits nicely in common viewports while keeping square cells
const previewGridSize = computed(() => {
  const maxPreview = 520
  const minPreview = 200
  const w = windowSize.value.width || 800
  const h = windowSize.value.height || 600

  // prefer width but also respect height
  const candidate = Math.min(maxPreview, Math.max(minPreview, Math.min(w * 0.7, h * 0.55)))
  // snap to cell size to avoid fractional pixels
  const cell = Math.max(24, Math.floor(candidate / Math.max(boardSize.value, 1)))
  return cell * boardSize.value
})

// debug helpers removed

// Funciones de almacenamiento
const saveToStorage = (): void => {
  localStorage.setItem('bingoOptions', JSON.stringify(options.value))
  localStorage.setItem('boardSize', boardSize.value.toString())
  if (bingoGrid.value.length > 0) {
    localStorage.setItem('bingoGrid', JSON.stringify(bingoGrid.value))
  }
}

const loadFromStorage = async (): Promise<void> => {
  isRestoring.value = true
  try {
    // Prefer an explicit saved board if present
    const savedBoardJson = localStorage.getItem('savedBingoBoard')
    if (savedBoardJson) {
      const parsed = JSON.parse(savedBoardJson)
      if (parsed.boardSize) boardSize.value = parsed.boardSize
      if (parsed.options && Array.isArray(parsed.options)) options.value = [...parsed.options]

      let restoredGrid = false
      if (parsed.bingoGrid && Array.isArray(parsed.bingoGrid)) {
        // try to be flexible: bingoGrid may be 1D array, 2D array, or map-like object
        let candidate: any[] = parsed.bingoGrid
        // if it's a 2D array (rows), flatten it
        if (Array.isArray(candidate) && candidate.length > 0 && Array.isArray(candidate[0])) candidate = candidate.flat()

        // normalize entries: support legacy strings or objects without 'marked'
        bingoGrid.value = candidate.map((cell: any) => {
          if (typeof cell === 'string') return { text: cell, marked: false }
          if (cell && typeof cell === 'object') return { text: (cell.text ?? ''), marked: !!cell.marked }
          return { text: String(cell), marked: false }
        })
        // ensure the storage keys are synced
        saveToStorage()
        restoredGrid = true
      }

      if (restoredGrid) {
        // If restored grid exists but cells have empty text, attempt to rebuild from options
        const allEmpty = bingoGrid.value.length > 0 && bingoGrid.value.every((c: any) => !(c && String(c.text).trim()))
        if (allEmpty) {
          if (options.value.length > 0) {
            const shuffled = [...options.value].sort(() => Math.random() - 0.5)
            const pool: string[] = []
            while (pool.length < totalCells.value) pool.push(...shuffled)
            bingoGrid.value = pool.slice(0, totalCells.value).map((t: string) => ({ text: t, marked: false }))
            saveToStorage()
          } else {
            bingoGrid.value = Array.from({ length: totalCells.value }, (_, i) => ({ text: `Item ${i + 1}`, marked: false }))
            saveToStorage()
          }
        }

        // If bingoGrid is still empty try alternative keys (grid/cells/board) or object maps
        if (bingoGrid.value.length === 0) {
          const alt = parsed.grid || parsed.cells || parsed.board || null
          if (alt && Array.isArray(alt)) {
            let candidateAlt: any[] = alt
            if (candidateAlt.length > 0 && Array.isArray(candidateAlt[0])) candidateAlt = candidateAlt.flat()
            bingoGrid.value = candidateAlt.map((cell: any) => ({ text: (cell && cell.text) ? cell.text : String(cell), marked: !!(cell && cell.marked) }))
            if (bingoGrid.value.length > 0) saveToStorage()
          } else if (parsed.bingoGrid && typeof parsed.bingoGrid === 'object' && !Array.isArray(parsed.bingoGrid)) {
            const vals = Object.values(parsed.bingoGrid)
            if (Array.isArray(vals) && vals.length > 0) {
              bingoGrid.value = vals.map((cell: any) => ({ text: (cell && cell.text) ? cell.text : String(cell), marked: !!(cell && cell.marked) }))
              saveToStorage()
            }
          }
        }

        // Final safety: if nothing produced a grid, create placeholders so UI always shows something
        if (bingoGrid.value.length === 0) {
          bingoGrid.value = Array.from({ length: totalCells.value }, (_, i) => ({ text: `Item ${i + 1}`, marked: false }))
          saveToStorage()
        }

        // indicate we restored a saved board (saved indicator)
        savedBoard.value = true
        setTimeout(() => savedBoard.value = false, 1500)

        // ensure DOM updates after assigning bingoGrid
        try {
          await nextTick()
        } catch (e) {
          // no-op
        }
        return
      }
    }

    // Fallback to older storage keys
    const savedOptions = localStorage.getItem('bingoOptions')
    const savedBoardSize = localStorage.getItem('boardSize')
    const savedGrid = localStorage.getItem('bingoGrid')

    if (savedOptions) options.value = JSON.parse(savedOptions)
    if (savedBoardSize) boardSize.value = parseInt(savedBoardSize)
    if (savedGrid) {
      try {
        const parsedGrid = JSON.parse(savedGrid)
        if (Array.isArray(parsedGrid) && parsedGrid.length > 0) bingoGrid.value = parsedGrid
      } catch {
        localStorage.removeItem('bingoGrid')
      }
    }

  } catch (err) {
    console.warn('Failed to parse savedBingoBoard, removing it', err)
    localStorage.removeItem('savedBingoBoard')
  } finally {
    isRestoring.value = false
  }
}

// Save the current board explicitly (includes marks)
const saveBoard = (): void => {
  try {
    const payload = {
      boardSize: boardSize.value,
      bingoGrid: bingoGrid.value,
      options: options.value
    }
    localStorage.setItem('savedBingoBoard', JSON.stringify(payload))
    // Also sync other storage keys used by the component
    saveToStorage()
    savedBoard.value = true
    setTimeout(() => savedBoard.value = false, 2000)
    console.info('savedBingoBoard written to localStorage')
    toast.success('Tablero guardado localmente')
  } catch (e) {
    console.error('Error saving board:', e)
    toast.error('Error guardando el tablero')
  }
}

const loadFromUrl = async (): Promise<void> => {
  const bingoParam = new URLSearchParams(window.location.search).get('bingo')
  if (!bingoParam) return

  // Mark restoring so watchers don't reset the board while we apply URL data
  isRestoring.value = true
  try {
    const shareData = JSON.parse(atob(bingoParam))

    // If the shared data represents a full board, apply it (replace current)
    if (shareData.type === 'board') {
      if (shareData.boardSize) boardSize.value = shareData.boardSize
      if (shareData.options && Array.isArray(shareData.options)) options.value = [...shareData.options]
      if (shareData.bingoGrid && Array.isArray(shareData.bingoGrid)) {
        // normalize like loadFromStorage
        let candidate: any[] = shareData.bingoGrid
        if (Array.isArray(candidate) && candidate.length > 0 && Array.isArray(candidate[0])) candidate = candidate.flat()
        bingoGrid.value = candidate.map((cell: any) => {
          if (typeof cell === 'string') return { text: cell, marked: false }
          if (cell && typeof cell === 'object') return { text: (cell.text ?? ''), marked: !!cell.marked }
          return { text: String(cell), marked: false }
        })
        // ensure DOM updates before saving
        await nextTick()
        saveToStorage()
      }

      // replace the URL to remove parameters
      window.history.replaceState({}, document.title, window.location.pathname)

    } else if (shareData.type === 'options') {
      // Only apply shared options if there's no existing grid
      if (bingoGrid.value.length === 0) {
        if (shareData.boardSize) boardSize.value = shareData.boardSize
        if (shareData.options && Array.isArray(shareData.options)) {
          options.value = [...shareData.options]
        }
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        console.info('Ignored shared bingo params because a board is already loaded')
      }
    }

    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    console.error('Error al cargar datos compartidos:', error)
  } finally {
    isRestoring.value = false
  }
}

// Funciones de opciones
const addOption = (): void => {
  if (multiLineMode.value) {
    // Split by newline, trim, filter empty and dedupe
    const lines = multiText.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    let added = 0
    for (const line of lines) {
      if (!options.value.includes(line)) {
        options.value.push(line)
        added++
      }
    }
    // clear textarea after adding
    multiText.value = ''
    if (added > 0) toast.success(`${added} opción(es) agregada(s)`)
    else toast.info('No se agregaron nuevas opciones (posibles duplicados o líneas vacías)')
  } else {
    const trimmed = newOption.value.trim()
    if (trimmed && !options.value.includes(trimmed)) {
      options.value.push(trimmed)
      newOption.value = ''
      toast.success(`Opción agregada: "${trimmed}"`)
    } else if (!trimmed) {
      toast.error('La opción está vacía')
    } else {
      toast.info('La opción ya existe')
    }
  }
}

const removeOption = (index: number): void => {
  const removed = options.value.splice(index, 1)
  if (removed && removed.length > 0) toast.success(`Opción eliminada: "${removed[0]}"`)
}

const clearAllOptions = (): void => {
  if (options.value.length === 0) {
    toast.info('No hay opciones para limpiar')
    return
  }
  const count = options.value.length
  options.value = []
  toast.info(`${count} opción(es) eliminada(s)`)
}

// Funciones del tablero
const toggleCell = (index: number): void => {
  // Prevent toggling a forced free center cell
  if (bingoGrid.value[index]) {
    if (bingoGrid.value[index].free) return
    bingoGrid.value[index].marked = !bingoGrid.value[index].marked
  }
}

const generateBingo = (): void => {
  if (!canGenerateBingo.value) return
  
  const shuffled = [...options.value].sort(() => Math.random() - 0.5)
  bingoGrid.value = shuffled.slice(0, totalCells.value).map(text => ({
    text,
    marked: false
  }))
  
  // If center free was requested and the board size allows it, apply it
  if (centerFreeEnabled.value && boardSize.value % 2 === 1) {
    const ci = centerIndex.value
    if (ci >= 0 && bingoGrid.value[ci]) {
      // save previous text to allow restore
      centerPrevText.value = bingoGrid.value[ci].text
      bingoGrid.value[ci].text = 'ESPACIO LIBRE'
      bingoGrid.value[ci].marked = true
      bingoGrid.value[ci].free = true
    }
  }

  shareLink.value = ''
  toast.success('Tablero generado')
}

const shuffleBingo = (): void => {
  if (bingoGrid.value.length === 0 || !canGenerateBingo.value) return
  
  if (hasExtraOptions.value) {
    generateBingo()
    toast.info('Tablero reordenado usando opciones extra')
  } else {
    const texts = bingoGrid.value.map(cell => cell.text)
    const shuffled = [...texts].sort(() => Math.random() - 0.5)
    bingoGrid.value = shuffled.map(text => ({ text, marked: false }))
    // If center free requested, set it after shuffle
    if (centerFreeEnabled.value && boardSize.value % 2 === 1) {
      const ci = centerIndex.value
      if (ci >= 0 && bingoGrid.value[ci]) {
        centerPrevText.value = bingoGrid.value[ci].text
        bingoGrid.value[ci].text = 'ESPACIO LIBRE'
        bingoGrid.value[ci].marked = true
        bingoGrid.value[ci].free = true
      }
    }
    toast.info('Tablero reordenado')
  }
  
  shareLink.value = ''
}

const resetBingo = (): void => {
  console.info('resetBingo() called — clearing bingoGrid (previous length:', bingoGrid.value.length, ')')
  bingoGrid.value = []
  showFullscreen.value = false
  shareLink.value = ''
  // clearing board should also clear center free flag
  centerFreeEnabled.value = false
  centerPrevText.value = null
  localStorage.removeItem('bingoGrid')
  toast.info('Tablero restablecido')
}

const toggleCenterFree = (): void => {
  // Only applicable for odd board sizes
  if (boardSize.value % 2 === 0) return

  centerFreeEnabled.value = !centerFreeEnabled.value

  const ci = centerIndex.value
  if (centerFreeEnabled.value) {
    // enable: ensure grid exists and set the center
    if (ci >= 0 && bingoGrid.value[ci]) {
      centerPrevText.value = bingoGrid.value[ci].text
      bingoGrid.value[ci].text = 'ESPACIO LIBRE'
      bingoGrid.value[ci].marked = true
      bingoGrid.value[ci].free = true
    }
  } else {
    // disable: restore previous text if known
    if (ci >= 0 && bingoGrid.value[ci]) {
      bingoGrid.value[ci].free = false
      bingoGrid.value[ci].marked = false
      if (centerPrevText.value !== null) {
        bingoGrid.value[ci].text = centerPrevText.value
      }
      centerPrevText.value = null
    }
  }
}

// debug watch removed

// Funciones de pantalla completa
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

// update windowSize on resize so computed values recalc
const handleResize = (): void => {
  if (typeof window === 'undefined') return
  windowSize.value.width = window.innerWidth
  windowSize.value.height = window.innerHeight
}

// Funciones para compartir
const generateOptionsLink = (): void => {
  const shareData = {
    type: 'options',
    boardSize: boardSize.value,
    options: options.value
  }
  const encodedData = btoa(JSON.stringify(shareData))
  shareLink.value = `${window.location.origin}${window.location.pathname}?bingo=${encodedData}`
}

const generateBoardLink = (): void => {
  const shareData = {
    type: 'board',
    boardSize: boardSize.value,
    options: options.value,
    bingoGrid: bingoGrid.value
  }
  const encodedData = btoa(JSON.stringify(shareData))
  shareLink.value = `${window.location.origin}${window.location.pathname}?bingo=${encodedData}`
}

const copyToClipboard = async (): Promise<void> => {
  if (!shareLink.value) return
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareLink.value)
    } else {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = shareLink.value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
    toast.success('Enlace copiado al portapapeles')
  } catch (e) {
    console.error('Failed to copy share link', e)
    toast.error('No se pudo copiar el enlace')
  }
}

// Estilos dinámicos para pantalla completa
const getFullscreenTextStyle = (text: string): CSSProperties => {
  // Calculate a font size based on the available cell size and text length
  const cellSize = fullscreenGridSize.value / Math.max(boardSize.value, 1)

  // base font is a fraction of the cell size (slightly reduced so longer strings fit)
  let fontSize = cellSize * 0.165

  // reduce font size for very long strings
  if (text.length > 80) fontSize *= 0.55
  else if (text.length > 60) fontSize *= 0.65
  else if (text.length > 40) fontSize *= 0.75
  else if (text.length > 25) fontSize *= 0.85

  // clamp font size to reasonable bounds
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
  const cellSize = fullscreenGridSize.value / Math.max(boardSize.value, 1)
  // ensure a bold, very large mark in fullscreen; keep a sensible minimum
  const size = Math.max(cellSize * 0.9, 64)
  // return explicit width/height so SVG icons scale correctly
  return { width: `${size}px`, height: `${size}px`, color: '#dc2626' }
}

// Keyboard navigation between cells + space/enter handling
const handleCellKey = (index: number, event: KeyboardEvent): void => {
  const cols = boardSize.value
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleCell(index)
    return
  }

  // Arrow navigation
  let targetIndex: number | null = null
  if (event.key === 'ArrowRight') targetIndex = (index + 1) % bingoGrid.value.length
  else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + bingoGrid.value.length) % bingoGrid.value.length
  else if (event.key === 'ArrowDown') targetIndex = Math.min(bingoGrid.value.length - 1, index + cols)
  else if (event.key === 'ArrowUp') targetIndex = Math.max(0, index - cols)

  if (targetIndex !== null) {
    event.preventDefault()
    // focus the target cell
    const el = document.querySelector(`[data-cell=\"${targetIndex}\"]`) as HTMLElement | null
    if (el) el.focus()
  }
}

// Preview text sizing: similar to fullscreen but tighter bounds
const getPreviewTextStyle = (text: string): CSSProperties => {
  const gridPx = previewGridSize.value
  const cellSize = gridPx / Math.max(boardSize.value, 1)
  let fontSize = Math.min(18, Math.max(11, Math.floor(cellSize * 0.15)))
  if (text.length > 80) fontSize = Math.max(10, Math.floor(fontSize * 0.6))
  else if (text.length > 50) fontSize = Math.max(11, Math.floor(fontSize * 0.75))
  return { fontSize: `${fontSize}px`, lineHeight: '1.05', padding: '6px', textAlign: 'center' } as CSSProperties
}

// Watchers
watch([options, boardSize, bingoGrid], () => {
  saveToStorage()
}, { deep: true })

// Sincronizar slider con boardSize
watch(boardSize, (newVal) => {
  boardSizeSlider.value = [newVal]
})

watch(boardSizeSlider, (newVal) => {
  if (newVal[0] !== undefined && newVal[0] !== boardSize.value) {
    boardSize.value = newVal[0]
  }
}, { deep: true })

watch(boardSize, () => {
  if (isRestoring.value) {
    console.info('boardSize watcher skipped because restoration in progress')
    return
  }
  if (bingoGrid.value.length > 0) resetBingo()
})

// Lifecycle hooks
onMounted(() => {
  // Always try to restore a saved board first
  loadFromStorage()

  // Then, if there's a shared bingo param, apply it (but don't clear saved board automatically)
  const bingoParam = new URLSearchParams(window.location.search).get('bingo')
  if (bingoParam) loadFromUrl()

  document.addEventListener('keydown', handleKeyPress)
  // listen for resize so fullscreen sizes update live
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = 'auto'
})


</script>

<style scoped>
.bingo-root {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* Responsive small screens: make grid narrower */
@media (max-width: 640px) {
  .grid[style] {
    width: 90vw !important;
    height: 90vw !important;
  }
  .text-5xl { 
    font-size: 2rem;
  }
}

.x-mark {
  /* Make the X very prominent in preview — use explicit size so SVG scales well */
  width: 5.5rem;
  height: 5.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  opacity: 0.98;
  /* Intense red similar to Tailwind red-600 */
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

/* Toolbar tweaks */
[role="toolbar"] button { 
  min-width: 120px;
}
</style>