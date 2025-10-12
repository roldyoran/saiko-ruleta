<template>
  <div>
    <!-- Agregar opciones -->
    <div>
      <Label class="mb-2 block">Agregar opción:</Label>
      <div class="flex w-full items-start gap-2">
        <div class="flex-1">
          <Input
            v-if="!multiLineMode"
            :model-value="newOption"
            @update:model-value="(value) => $emit('update:newOption', String(value))"
            @keypress.enter.prevent="$emit('addOption')"
            type="text"
            placeholder="Escribe una opción..."
            class="w-full"
          />

          <Textarea
            v-else
            :model-value="multiText"
            @update:model-value="(value) => $emit('update:multiText', String(value))"
            @keydown.ctrl.enter.prevent="$emit('addOption')"
            placeholder="Pega o escribe opciones, una por línea (Ctrl+Enter para añadir)"
            class="min-h-[60px]"
          />
        </div>

        <div class="flex flex-col gap-2">
          <Button
            @click="$emit('addOption')"
            variant="secondary"
            class="whitespace-nowrap"
            title="Agregar opción(es)"
          >
            <Plus class="mr-2 h-4 w-4" />
            Agregar
          </Button>

          <Button
            @click="$emit('toggleMultiLineMode')"
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
    <div class="mt-6">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-lg font-medium">
          Opciones ({{ options.length }})
          <Badge v-if="hasExtraOptions" variant="secondary" class="ml-2">
            +{{ options.length - totalCells }} extra
          </Badge>
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
            @click="$emit('removeOption', index)"
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
        <p class="mt-1 text-xs text-muted-foreground">
          Agrega al menos {{ totalCells }} opciones para generar el bingo
        </p>
        <p class="mt-2 text-xs text-muted-foreground/70">
          Consejo: puedes pegar varias líneas en el modo 'Multi' para añadir varias opciones a la vez.
        </p>
      </div>

      <div v-if="hasExtraOptions && bingoGridLength === 0" class="mt-2 rounded-lg border bg-muted/30 p-3">
        <p class="text-sm">
          <Lightbulb class="mr-2 inline h-4 w-4" />
          <strong>¡Genial!</strong> Tienes {{ options.length - totalCells }} opciones extra. 
          Cada vez que generes o reordenes el tablero, se seleccionarán {{ totalCells }} opciones aleatorias.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  Plus, 
  FileText, 
  FileQuestion, 
  Lightbulb
} from 'lucide-vue-next'

interface Props {
  options: string[]
  newOption: string
  multiText: string
  multiLineMode: boolean
  totalCells: number
  bingoGridLength: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:newOption': [value: string]
  'update:multiText': [value: string]
  'addOption': []
  'removeOption': [index: number]
  'toggleMultiLineMode': []
}>()

const hasExtraOptions = computed(() => props.options.length > props.totalCells)

const percentOptions = computed(() => {
  if (props.totalCells <= 0) return 0
  const pct = Math.round((props.options.length / props.totalCells) * 100)
  return Math.min(100, Math.max(0, pct))
})
</script>