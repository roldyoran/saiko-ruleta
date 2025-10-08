<template>
  <Card
    v-if="showNamesList && isNamesMode"
    class="fixed top-20 right-4 z-40 w-80 p-4 bg-background/95 backdrop-blur-lg shadow-lg"
  >
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
                  variant="icon"
                  size="sm"
                  @click="clearAllNames"
                  class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 class="h-3 w-3" />
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
            placeholder="Ingresa un nombre o pega varios separados por 'Enter'... (Ctrl+Enter para agregar todos de una)"
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
                    class="h-6 w-6 p-0 text-destructive"
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
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'

// Shadcn-vue components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Lucide icons
import { Trash, Trash2, Users, X } from 'lucide-vue-next'

// Props
const props = defineProps({
  showNamesList: {
    type: Boolean,
    default: false,
  },
  isNamesMode: {
    type: Boolean,
    default: false,
  },
  namesList: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['add-name', 'remove-name', 'clear-names'])

// Refs
const newName = ref('')
const namesMultiline = ref(true)

// Métodos
const addName = () => {
  const raw = newName.value.trim()
  if (!raw) return

  // Split by newlines to accept multiple names, also accept single-line input
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  emit('add-name', lines)
  newName.value = ''
}

const removeName = (index) => {
  emit('remove-name', index)
}

const clearAllNames = () => {
  emit('clear-names')
}

// Exponer métodos para que el padre pueda enfocar el input
defineExpose({
  focusInput: () => {
    const el = document.getElementById('newNameInput')
    if (el && typeof el.focus === 'function') el.focus()
  },
})
</script>
