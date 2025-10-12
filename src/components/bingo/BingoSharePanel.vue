<template>
  <div class="w-full">
    <h3 class="mb-2 flex items-center text-sm font-medium">
      <Link class="mr-2 h-4 w-4" />
      Compartir Opciones
    </h3>

    <div class="mb-2 flex gap-2">
      <Button @click="$emit('generateOptionsLink')" variant="secondary" size="sm">
        <Share class="mr-1 h-3 w-3" />
        Compartir Opciones
      </Button>

      <Button
        v-if="hasBingoGrid"
        @click="$emit('generateBoardLink')"
        variant="secondary"
        size="sm"
        title="Compartir el tablero (incluye marcas)"
      >
        <Share class="mr-1 h-3 w-3" />
        Compartir Tablero
      </Button>

      <Button 
        v-if="shareLink" 
        @click="$emit('copyToClipboard')" 
        variant="outline" 
        size="sm" 
        :class="{ 'bg-accent': copied }"
      >
        <Copy class="mr-1 h-3 w-3" />
        {{ copied ? 'Copiado' : 'Copiar' }}
      </Button>
    </div>

    <div class="space-y-1">
      <Input :model-value="shareLink" readonly class="text-xs" />
      <p class="text-xs text-muted-foreground">
        Comparte este enlace para que otros puedan usar las mismas opciones
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, Share, Copy } from 'lucide-vue-next'

interface Props {
  shareLink: string
  copied: boolean
  hasBingoGrid: boolean
}

defineProps<Props>()

defineEmits<{
  'generateOptionsLink': []
  'generateBoardLink': []
  'copyToClipboard': []
}>()
</script>