import { ref, watch } from 'vue'

const STORAGE_KEY = 'roulette-config'

export interface RouletteItem {
  label: string
  backgroundColor: string
  labelColor: string
}

export interface RouletteSettings {
  fontFamily: string
  labelAlign: 'right' | 'left' | 'center'
  fontSizeMax: number
  labelRadius: number
  lineWidth: number
  lineColor: string
  spinDuration: number
  revolutions: number
}

const DEFAULT_SETTINGS: RouletteSettings = {
  fontFamily: 'Arial, sans-serif',
  labelAlign: 'right',
  fontSizeMax: 24,
  labelRadius: 0.6,
  lineWidth: 6,
  lineColor: '#0a0a0a',
  spinDuration: 4500,
  revolutions: 8,
}

const NEUTRAL_PALETTE: string[] = [
  '#0c0c0c', '#141414', '#1a1a1a', '#212121', '#2a2a2a',
  '#0f1218', '#151a24', '#1b2230', '#222a38', '#2a3342',
  '#121010', '#1a1616', '#221e1e', '#2b2626', '#342f2f',
  '#0d1117', '#161b22', '#1c2128', '#21262d', '#272d35',
  '#0a0f14', '#101820', '#152028', '#1a2830', '#1f3038',
  '#100e1a', '#18152a', '#201c3a', '#28234a', '#302b5a',
]

// Singleton
const items = ref<RouletteItem[]>([])
const settings = ref<RouletteSettings>({ ...DEFAULT_SETTINGS })
let initialized = false

function sortItems() {
  items.value.sort((a, b) => {
    const aIsNum = /^\d/.test(a.label)
    const bIsNum = /^\d/.test(b.label)
    if (aIsNum && !bIsNum) return 1
    if (!aIsNum && bIsNum) return -1
    return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
  })
}

function getRandomColor(): string {
  const usedColors = items.value.map(i => i.backgroundColor)
  const available = NEUTRAL_PALETTE.filter(c => !usedColors.includes(c))
  const pool = available.length > 0 ? available : NEUTRAL_PALETTE
  return pool[Math.floor(Math.random() * pool.length)]
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed.items && Array.isArray(parsed.items)) {
      items.value = parsed.items
      sortItems()
    }
    if (parsed.settings) {
      settings.value = { ...DEFAULT_SETTINGS, ...parsed.settings }
    }
  } catch {
    // ignore corrupt data
  }
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    items: items.value,
    settings: settings.value,
  }))
}

export function useRouletteConfig() {
  if (!initialized) {
    initialized = true
    loadConfig()
    watch([items, settings], saveConfig, { deep: true })
  }

  const addItem = (label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return false
    items.value.push({
      label: trimmed.toUpperCase(),
      backgroundColor: getRandomColor(),
      labelColor: '#ffffff',
    })
    sortItems()
    return true
  }

  const removeItem = (index: number) => {
    items.value.splice(index, 1)
  }

  const updateItemColor = (index: number, color: string) => {
    if (items.value[index]) {
      items.value[index].backgroundColor = color
    }
  }

  const clearItems = () => {
    items.value = []
  }

  const setItems = (newItems: RouletteItem[]) => {
    items.value = newItems
    sortItems()
  }

  const exportConfig = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ items: items.value, settings: settings.value }, null, 2))
    const anchor = document.createElement('a')
    anchor.setAttribute('href', dataStr)
    anchor.setAttribute('download', `ruleta-config-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  const importConfig = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          if (imported.items && imported.settings) {
            items.value = imported.items
            settings.value = { ...DEFAULT_SETTINGS, ...imported.settings }
            sortItems()
            resolve(true)
          } else if (Array.isArray(imported)) {
            items.value = imported
            sortItems()
            resolve(true)
          } else {
            resolve(false)
          }
        } catch {
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    items,
    settings,
    addItem,
    removeItem,
    updateItemColor,
    clearItems,
    setItems,
    exportConfig,
    importConfig,
    getRandomColor,
  }
}
