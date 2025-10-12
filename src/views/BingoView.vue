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
          <!-- Configuración del tablero -->
          <BingoConfigPanel
            :board-size="boardSize"
            :board-size-slider="boardSizeSlider"
            :options-count="options.length"
            :can-generate-bingo="canGenerateBingo"
            @update:board-size="boardSize = $event"
            @update:board-size-slider="boardSizeSlider = $event"
            @generate-bingo="generateBingo"
            @clear-all-options="clearAllOptions"
          />

          <!-- Gestión de opciones -->
          <BingoOptionsManager
            :options="options"
            :new-option="newOption"
            :multi-text="multiText"
            :multi-line-mode="multiLineMode"
            :total-cells="totalCells"
            :bingo-grid-length="bingoGrid.length"
            @update:new-option="newOption = $event"
            @update:multi-text="multiText = $event"
            @add-option="addOption"
            @remove-option="removeOption"
            @toggle-multi-line-mode="multiLineMode = !multiLineMode"
          />
        </CardContent>

        <CardFooter class="flex-col items-start space-y-4">
          <!-- Panel de compartir -->
          <BingoSharePanel
            :share-link="shareLink"
            :copied="copied"
            :has-bingo-grid="bingoGrid.length > 0"
            @generate-options-link="generateOptionsLink"
            @generate-board-link="generateBoardLink"
            @copy-to-clipboard="copyToClipboard"
          />
        </CardFooter>

        <!-- Area de estado accesible -->
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          <span v-if="savedBoard">Tablero guardado</span>
          <span v-else-if="copied">Enlace copiado al portapapeles</span>
        </div>
      </Card>

      <!-- Tablero de Bingo -->
      <BingoBoard
        :bingo-grid="bingoGrid"
        :board-size="boardSize"
        :saved-board="savedBoard"
        @toggle-cell="toggleCell"
        @shuffle-bingo="shuffleBingo"
        @save-board="saveBoard"
        @reset-bingo="resetBingo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Settings } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Importar los nuevos componentes
import {
  BingoConfigPanel,
  BingoOptionsManager,
  BingoSharePanel,
  BingoBoard
} from '@/components/bingo'

interface BingoCell {
  text: string
  marked: boolean
}

// Estado reactivo
const options = ref<string[]>([])
const newOption = ref('')
const multiLineMode = ref(false)
const multiText = ref('')
const boardSize = ref(5)
const boardSizeSlider = ref([5]) // Para el slider que requiere array
const bingoGrid = ref<BingoCell[]>([])
const shareLink = ref('')
const copied = ref(false)
const savedBoard = ref(false)
const isRestoring = ref(false)

// Computed properties
const totalCells = computed(() => boardSize.value * boardSize.value)
const canGenerateBingo = computed(() => options.value.length >= totalCells.value)

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
  if (bingoGrid.value[index]) {
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

  shareLink.value = ''
  toast.success('Tablero generado')
}

const shuffleBingo = (): void => {
  if (bingoGrid.value.length === 0 || !canGenerateBingo.value) return
  
  const hasExtraOptions = options.value.length > totalCells.value
  if (hasExtraOptions) {
    generateBingo()
    toast.info('Tablero reordenado usando opciones extra')
  } else {
    const texts = bingoGrid.value.map(cell => cell.text)
    const shuffled = [...texts].sort(() => Math.random() - 0.5)
    bingoGrid.value = shuffled.map(text => ({ text, marked: false }))
    toast.info('Tablero reordenado')
  }
  
  shareLink.value = ''
}

const resetBingo = (): void => {
  console.info('resetBingo() called — clearing bingoGrid (previous length:', bingoGrid.value.length, ')')
  bingoGrid.value = []
  shareLink.value = ''
  localStorage.removeItem('bingoGrid')
  toast.info('Tablero restablecido')
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
})

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})


</script>

<style scoped>
.bingo-root {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* Responsive small screens */
@media (max-width: 640px) {
  .text-5xl { 
    font-size: 2rem;
  }
}
</style>