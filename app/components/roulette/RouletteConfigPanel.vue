<template>
  <Sheet v-model:open="isOpen" @update:open="onOpenChange">
    <SheetTrigger as-child>
      <slot name="trigger">
        <Button variant="outline" size="icon" class="h-8 w-8">
          <Settings class="h-4 w-4" />
        </Button>
      </slot>
    </SheetTrigger>

    <SheetContent
      side="right"
      overlay-class="bg-transparent"
      class="w-full sm:max-w-sm flex flex-col gap-0 p-0 overflow-hidden backdrop-blur-2xl bg-black/95 border-l border-zinc-800"
    >
      <SheetHeader class="px-5 pt-5 pb-3 border-b border-zinc-800">
        <SheetTitle class="text-base text-white">Configuración</SheetTitle>
        <SheetDescription class="text-xs text-zinc-400">
          Parámetros de la ruleta.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 overflow-y-auto">
        <div class="flex flex-col gap-4 px-5 py-4">

          <!-- Agregar Participante -->
          <div class="space-y-2">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Agregar Participante
              </h3>

              <template v-if="namesMultiline">
                <textarea
                  ref="nameInputRef"
                  v-model="newName"
                  @keydown.ctrl.enter.prevent="handleAddFromInput"
                  placeholder="Nombre por línea... (Ctrl+Enter para agregar)"
                  class="w-full rounded-md bg-transparent border border-input p-3 min-h-20 text-xs resize-y focus:border-ring outline-none"
                  rows="4"
                />
              </template>

              <template v-else>
                <Input
                  ref="nameInputRef"
                  v-model="newName"
                  placeholder="Nombre..."
                  class="w-full text-xs h-8"
                  @keyup.enter="handleAddFromInput"
                />
              </template>

              <div class="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  class="text-xs h-7 px-3"
                  :disabled="!newName.trim()"
                  @click="handleAddFromInput"
                >
                  Agregar
                </Button>
                <div class="flex items-center gap-2">
                  <Label class="text-[10px] text-muted-foreground">Multilínea</Label>
                  <Switch v-model="namesMultiline" class="scale-75" />
                </div>
              </div>
            </div>

            <Separator />

            <!-- Lista de Participantes -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participantes</h3>
                <Badge variant="secondary" class="text-[10px] font-mono px-2 py-0.5">
                  {{ itemCount }}
                </Badge>
              </div>

              <div v-if="itemCount === 0" class="text-center py-6 text-muted-foreground">
                <Users class="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p class="text-xs">No hay participantes</p>
                <p class="text-[11px]">Agrega al menos 2 para usar la ruleta</p>
              </div>

              <ScrollArea v-else class="h-56">
                <div class="flex flex-col gap-1 pr-2">
                  <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="flex items-center gap-2 bg-muted/30 border border-input/50 rounded-md px-2 py-2 text-xs hover:bg-muted/50 transition-colors"
                  >
                    <!-- Color picker styled as a color wheel that triggers a dialog modal -->
                    <button
                      type="button"
                      @click="openColorPickerModal(index)"
                      class="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-zinc-700/50 shadow-inner flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      :style="{ backgroundColor: item.backgroundColor }"
                      :title="'Color de ' + item.label"
                    >
                      <!-- Subtle inner dot or radial lines to simulate a wheel -->
                      <div class="absolute inset-0 pointer-events-none rounded-full border border-white/20"></div>
                    </button>
                    <span class="flex-1 truncate text-foreground font-medium">{{ item.label }}</span>
                    <button
                      @click="handleRemoveItem(index)"
                      class="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all px-1.5 py-1 rounded cursor-pointer"
                      :title="'Eliminar ' + item.label"
                    >
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </ScrollArea>

              <!-- Modal dialog containing the chromatic color wheel -->
              <Dialog v-model:open="showColorPicker">
                <DialogContent class="sm:max-w-xs p-5 bg-zinc-950 border border-zinc-800 text-white flex flex-col items-center gap-4">
                  <DialogHeader class="w-full text-center">
                    <DialogTitle class="text-sm font-semibold">Seleccionar Color</DialogTitle>
                    <p class="text-xs text-zinc-400">Participante: {{ activeItemLabel }}</p>
                  </DialogHeader>

                  <div class="flex justify-center items-center py-4 bg-zinc-900/50 rounded-lg w-full">
                    <ColorPicker
                      :hue="activeHue"
                      @input="onHueInput"
                    />
                  </div>

                  <div class="flex items-center gap-3 w-full justify-between mt-1">
                    <div class="flex items-center gap-2">
                      <div class="w-5 h-5 rounded-full border border-zinc-700" :style="{ backgroundColor: activeColorHex }"></div>
                      <span class="text-xs font-mono">{{ activeColorHex.toUpperCase() }}</span>
                    </div>
                    <Button size="sm" class="h-7 text-xs" @click="showColorPicker = false">Aceptar</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                v-if="itemCount > 0"
                variant="destructive"
                size="sm"
                class="w-full text-xs h-7 bg-red-600 text-white font-semibold transition-all hover:bg-red-500 hover:scale-[1.01] hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95"
                @click="handleClearAll"
              >
                <Trash2 class="h-3 w-3 mr-1 text-white stroke-[2.5]" /> Limpiar lista ({{ itemCount }})
              </Button>
            </div>

            <Separator />

          <!-- Texto y Alineación -->
          <div class="space-y-2.5">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Texto y Alineación</h3>

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Alineación</Label>
                <Select v-model="settings.labelAlign">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Exterior</SelectItem>
                    <SelectItem value="left">Centro</SelectItem>
                    <SelectItem value="center">Medio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Radio Texto</Label>
                <Input
                  v-model.number="settings.labelRadius"
                  type="number"
                  :min="0.1"
                  :max="0.95"
                  step="0.05"
                  class="text-xs h-8"
                />
              </div>
            </div>

            <div class="space-y-1">
              <Label class="text-[11px] text-muted-foreground">Tamaño Máx.</Label>
              <Input
                v-model.number="settings.fontSizeMax"
                type="number"
                :min="8"
                :max="60"
                class="text-xs h-8"
              />
            </div>
          </div>

          <Separator />

          <!-- Parámetros Giro -->
          <div class="space-y-2.5">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parámetros Giro</h3>

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Ancho Líneas</Label>
                <Input
                  v-model.number="settings.lineWidth"
                  type="number"
                  :min="0"
                  :max="20"
                  class="text-xs h-8"
                />
              </div>
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Color Borde</Label>
                <input
                  type="color"
                  v-model="settings.lineColor"
                  class="w-full h-8 rounded cursor-pointer border border-input bg-transparent"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Duración (ms)</Label>
                <Input
                  v-model.number="settings.spinDuration"
                  type="number"
                  :min="1000"
                  :max="15000"
                  step="250"
                  class="text-xs h-8"
                />
              </div>
              <div class="space-y-1">
                <Label class="text-[11px] text-muted-foreground">Vueltas mín. (≥ 8)</Label>
                <Input
                  v-model.number="settings.revolutions"
                  type="number"
                  :min="8"
                  :max="30"
                  class="text-xs h-8"
                />
              </div>
            </div>
          </div>

          <Separator />

          <!-- JSON & Backup -->
          <Accordion type="single" collapsible>
            <AccordionItem value="json-tools" class="border-0">
              <AccordionTrigger class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-0 hover:no-underline">
                JSON & Backup
              </AccordionTrigger>
              <AccordionContent class="pt-3 flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" class="text-xs h-8" @click="exportConfig">
                    <Download class="h-3 w-3 mr-1" /> Exportar
                  </Button>
                  <label class="inline-flex items-center justify-center gap-1 text-xs h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                    <Upload class="h-3 w-3" /> Cargar
                    <input type="file" accept=".json" class="hidden" @change="handleImport">
                  </label>
                </div>

                <div class="space-y-2">
                  <Label class="text-[11px] text-muted-foreground">Editar JSON Directo</Label>
                  <Textarea
                    v-model="jsonText"
                    class="w-full h-32 text-[11px] font-mono resize-y"
                    placeholder='[{"label":"NOMBRE","backgroundColor":"#1a1a2e","labelColor":"#ffffff"}]'
                  />
                  <Button variant="outline" size="sm" class="text-xs h-8 w-full" @click="loadFromJson">
                    Cargar desde JSON
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { Download, Upload, Users, Trash2, Settings } from '@lucide/vue'
import ColorPicker from '@radial-color-picker/vue-color-picker'
import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { useRouletteConfig } from '@/composables/useRouletteConfig'

const { items, settings, addItem, removeItem, updateItemColor, clearItems, setItems, exportConfig, importConfig } = useRouletteConfig()

const emit = defineEmits(['items-changed', 'update:open'])

const isOpen = ref(false)
const newName = ref('')
const namesMultiline = ref(true)
const jsonText = ref('[]')
const nameInputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Radial Color Picker modal logic
const showColorPicker = ref(false)
const activeItemIndex = ref(-1)
const activeHue = ref(0)

const activeItemLabel = computed(() => {
  if (activeItemIndex.value >= 0 && items.value[activeItemIndex.value]) {
    return items.value[activeItemIndex.value].label
  }
  return ''
})

const activeColorHex = computed(() => {
  if (activeItemIndex.value >= 0 && items.value[activeItemIndex.value]) {
    return items.value[activeItemIndex.value].backgroundColor
  }
  return '#ffffff'
})

function openColorPickerModal(index: number) {
  activeItemIndex.value = index
  const hexColor = items.value[index].backgroundColor
  const { h } = hexToHSL(hexColor)
  activeHue.value = h
  showColorPicker.value = true
}

function onHueInput(hue: number) {
  activeHue.value = hue
  const hex = hslToHex(hue, 100, 20) // Neutral dark saturation & lightness for theme consistency
  updateItemColor(activeItemIndex.value, hex)
}

// Convert Hex to HSL
function hexToHSL(hex: string) {
  hex = hex.replace(/^#/, '')
  let r = parseInt(hex.substring(0, 2), 16) / 255
  let g = parseInt(hex.substring(2, 4), 16) / 255
  let b = parseInt(hex.substring(4, 6), 16) / 255

  let max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const itemCount = computed(() => items.value.length)

function onOpenChange(val: boolean) {
  emit('update:open', val)
}

watch(
  () => [...items.value],
  (current) => {
    jsonText.value = JSON.stringify(current, null, 2)
  },
  { deep: true, immediate: true }
)

function handleRemoveItem(index: number) {
  removeItem(index)
}

function handleClearAll() {
  clearItems()
  toast.success('Lista limpiada')
}

function handleAddFromInput() {
  const raw = newName.value.trim()
  if (!raw) return

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  let added = 0
  let skipped = 0

  for (const line of lines) {
    const exists = items.value.some(i => i.label.toUpperCase() === line.toUpperCase())
    if (exists) {
      skipped++
    } else {
      addItem(line)
      added++
    }
  }

  if (added > 0) {
    toast.success(added === 1 ? `"${lines[0].toUpperCase()} agregado"` : `${added} participantes agregados`)
    emit('items-changed')
  }
  if (skipped > 0) {
    toast.error(skipped === 1 ? 'Ese nombre ya existe' : `${skipped} nombres ya existían`)
  }

  newName.value = ''
}

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const ok = await importConfig(file)
  if (ok) {
    toast.success('Configuración importada')
    emit('items-changed')
  } else {
    toast.error('Archivo JSON no válido')
  }
  ;(event.target as HTMLInputElement).value = ''
}

function loadFromJson() {
  try {
    const parsed = JSON.parse(jsonText.value)
    if (Array.isArray(parsed) && parsed.length >= 2) {
      setItems(parsed)
      toast.success('JSON cargado')
      emit('items-changed')
    } else if (Array.isArray(parsed) && parsed.length < 2) {
      toast.error('Se necesitan al menos 2 ítems')
    } else {
      toast.error('El JSON debe ser un array')
    }
  } catch {
    toast.error('JSON inválido')
  }
}

function focusInput() {
  nextTick(() => {
    const el = nameInputRef.value
    if (el && typeof el.focus === 'function') el.focus()
  })
}

defineExpose({
  isOpen,
  focusInput,
})
</script>
