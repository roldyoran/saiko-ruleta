<template>
  <div class="mx-auto mb-8 flex w-full max-w-2xl flex-col gap-4 md:flex-row">
    <div class="flex md:flex-1">
      <div class="relative w-full max-w-full items-center">
        <Input
          id="search"
          v-model="localSearch"
          type="text"
          placeholder="Buscar por nombre..."
          class="pl-10"
          :disabled="localCategory !== 'todas'"
        />
        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
          <Search class="size-5 text-muted-foreground" />
        </span>
      </div>
    </div>

    <div class="w-full md:w-40">
      <Select v-model:modelValue="localCategory">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="goty">GOTY</SelectItem>
          <SelectItem value="god">GOD</SelectItem>
          <SelectItem value="wena">WENA</SelectItem>
          <SelectItem value="piola">PIOLA</SelectItem>
          <SelectItem value="no me gusto">NO ME GUSTO</SelectItem>
          <SelectItem value="mala">MALA</SelectItem>
          <SelectItem value="horrible">HORRIBLE</SelectItem>
          <SelectItem value="la peor de todas">LA PEOR DE TODAS</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="w-full items-center justify-center flex md:w-auto flex-shrink-0">
      <Button variant="ghost" size="sm" @click="clearFilters">
        <Trash2 class="size-4 mr-1" />
        Limpiar
      </Button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  searchQuery: { type: String, required: true },
  categoryFilter: { type: String, required: true },
})
const emit = defineEmits(['update:searchQuery', 'update:categoryFilter', 'clear-filters'])

// Use shadcn Input / Select / Button
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Trash2, Search } from 'lucide-vue-next'

// Local v-model proxies so we can use v-model in template while keeping
// the parent-driven props and emitting updates consistently.
const localSearch = ref(props.searchQuery)
const localCategory = ref(props.categoryFilter)

watch(localSearch, (v) => emit('update:searchQuery', v))
watch(localCategory, (v) => emit('update:categoryFilter', v))

function clearFilters() {
  localSearch.value = ''
  localCategory.value = 'todas'
  emit('clear-filters')
}
</script>
