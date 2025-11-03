<template>
  <Card class="bg-neutral-800">
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
              :model-value="boardSize"
              @update:model-value="(value) => $emit('update:boardSize', Number(value))"
              type="number"
              :min="2"
              :max="10"
              aria-label="Tamaño del tablero (número)"
              class="w-20"
              placeholder="Ej: 5"
            />

            <Slider
              :model-value="boardSizeSlider"
              @update:model-value="(value) => value && $emit('update:boardSizeSlider', value)"
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

      <!-- Botones de acción (principal) -->
      <div class="flex flex-wrap gap-4" role="toolbar" aria-label="Acciones principales">
        <Button
          @click="$emit('generateBingo')"
          :disabled="!canGenerateBingo"
          aria-label="Generar bingo"
          class="px-6 py-3"
        >
          <Dice6 class="mr-2 h-4 w-4" />
          Generar Bingo
        </Button>

        <Button
          @click="$emit('clearAllOptions')"
          variant="ghost"
          aria-label="Limpiar todas las opciones"
          class="px-4 py-3"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Limpiar Opciones
        </Button>

        <div class="ml-auto flex items-center gap-2 text-xs">
          <Badge variant="outline">Opciones: {{ optionsCount }}</Badge>
          <Badge variant="outline">Necesarias: {{ totalCells }}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Settings, Dice6, Trash2 } from 'lucide-vue-next'

interface Props {
  boardSize: number
  boardSizeSlider: number[]
  optionsCount: number
  canGenerateBingo: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:boardSize': [value: number]
  'update:boardSizeSlider': [value: number[]]
  'generateBingo': []
  'clearAllOptions': []
}>()

const totalCells = computed(() => props.boardSize * props.boardSize)
</script>