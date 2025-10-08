<template>
  <div v-if="totalPages > 1" class="mb-8 flex flex-col items-center gap-4 px-4">
    <!-- Información de página (móvil) -->
    <div class="flex w-full items-center justify-center sm:hidden">
      <div class="flex items-center gap-2 rounded-full border px-4 py-2">
        <span class="text-sm font-medium text-muted-foreground">Página</span>
        <span class="font-semibold">{{ currentPage + 1 }}</span>
        <span class="text-sm text-muted-foreground">de</span>
        <span class="font-semibold">{{ totalPages }}</span>
      </div>
    </div>

    <!-- Controles principales -->
    <div class="flex w-full max-w-md items-center justify-center gap-2">
      <!-- Botón primera página -->
      <Button variant="ghost" size="sm" @click="goToFirstPage" :disabled="currentPage === 0">
        <ChevronsLeft class="size-4 mr-0 sm:mr-1" />
        <span class="hidden sm:inline">Primera</span>
      </Button>

      <!-- Botón anterior -->
      <Button variant="ghost" size="sm" @click="prevPage" :disabled="currentPage === 0">
        <ChevronLeft class="size-4 sm:hidden" />
        <span class="hidden sm:inline">Anterior</span>
      </Button>

      <!-- Selector de página (desktop) -->
      <div class="hidden items-center gap-3 px-4 sm:flex ">
        <span class="text-sm font-medium text-muted-foreground">Página</span>
        <Select v-model:modelValue="localPage" >
          <SelectTrigger class="min-w-[80px] border-2 border-pink-500/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="page in totalPages" :key="page" :value="page - 1">{{
              page
            }}</SelectItem>
          </SelectContent>
        </Select>
        <span class="flex gap-1.5 text-sm font-medium text-muted-foreground"
          >de {{ totalPages }}</span
        >
      </div>

      <!-- Indicador de página móvil central -->
      <div
        class="flex min-w-[60px] items-center justify-center rounded-lg border px-3 py-2 sm:hidden"
      >
        <span class="text-sm font-bold">{{ currentPage + 1 }}/{{ totalPages }}</span>
      </div>

      <!-- Botón siguiente -->
      <Button variant="ghost" size="sm" @click="nextPage" :disabled="currentPage >= totalPages - 1">
        <span class="hidden sm:inline">Siguiente</span>
        <ChevronRight class="size-4 sm:hidden" />
      </Button>

      <!-- Botón última página -->
      <Button
        variant="ghost"
        size="sm"
        @click="goToLastPage"
        :disabled="currentPage >= totalPages - 1"
      >
        <ChevronsRight class="size-4 mr-0 sm:mr-1" />
        <span class="hidden sm:inline">Última</span>
      </Button>
    </div>

    <!-- Selector de página móvil -->
    <div class="flex w-full max-w-xs sm:hidden">
      <Select v-model:modelValue="localPage">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Seleccionar página" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="page in totalPages" :key="page" :value="page - 1"
            >Página {{ page }}</SelectItem
          >
        </SelectContent>
      </Select>
    </div>

    <!-- Indicador de progreso -->
    <div class="w-full max-w-xs sm:max-w-sm">
      <Progress :model-value="((currentPage + 1) / totalPages) * 100" class="h-2" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage'])
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const localPage = ref(props.currentPage)
watch(localPage, (v) => emit('update:currentPage', v))

function goToFirstPage() {
  emit('update:currentPage', 0)
}

function goToLastPage() {
  emit('update:currentPage', props.totalPages - 1)
}

function prevPage() {
  if (props.currentPage > 0) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

function nextPage() {
  if (props.currentPage < props.totalPages - 1) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

function handlePageSelect(event) {
  const newPage = parseInt(event.target.value)
  emit('update:currentPage', newPage)
}

// Keep localPage in sync when parent updates currentPage externally
watch(
  () => props.currentPage,
  (v) => {
    if (v !== localPage.value) localPage.value = v
  },
)
</script>
