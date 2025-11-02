<template>
  <div class="flex min-h-screen flex-col items-center px-6 md:px-0">
    <!-- Lava lamp background (gooey blobs) -->
    <LavaLamp />
    <h1
      class="mt-8 mb-10 text-center text-4xl font-extrabold drop-shadow-lg select-none md:text-6xl tracking-wider bg-linear-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
    >
      Animes Vistos
    </h1>

    <!-- Loader -->
    <AnimeLoader v-if="isLoading" />

    <!-- Error -->
    <AnimeError v-else-if="error" :error="error" @retry="fetchAnimeData" />

    <!-- Contenido principal -->
    <div v-else class="w-full">
      <!-- Filtros -->
      <AnimeFilters
        :searchQuery="searchQuery"
        :categoryFilter="categoryFilter"
        @update:searchQuery="(val) => (searchQuery = val)"
        @update:categoryFilter="(val) => (categoryFilter = val)"
        @clear-filters="clearFilters"
      />

      <!-- Paginación -->
      <PaginationControls v-model:current-page="currentPage" :total-pages="totalPages" />

      <!-- Mensaje sin resultados -->
      <AnimeEmpty v-if="filteredAnimes.length === 0" @clear-filters="clearFilters" />

      <!-- Tarjetas de animes -->
      <div
        v-else
        class="mx-auto mb-10 grid max-w-6xl grid-cols-2 gap-6 gap-y-7 p-0 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:px-0"
      >
        <AnimeCard
          v-for="anime in paginatedAnimes"
          :key="anime.id"
          :anime="anime"
          :notaBgClass="notaBgClass"
        />
      </div>

      <!-- Paginación -->
      <PaginationControls v-model:current-page="currentPage" :total-pages="totalPages" />

      <!-- Footer (shadcn Card) -->
      <Card class="mx-auto mt-12 mb-10 max-w-2xl bg-opacity-60 backdrop-blur-sm shadow-lg">
        <CardContent
          class="rounded-2xl px-6 py-4 text-center text-xs font-medium tracking-wide text-rose-200/70"
        >
          Esta lista comprende todos los animes randoms vistos en el canal del Saiko y uno que otro
          anime visto fuera de la dinamica ( puede faltar alguno )
          <br /><br />
          <span class="text-lg font-bold tracking-widest text-rose-400"
            >VIVAN LAS LESBIANAS!!!!</span
          >
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { navigateTo, useRoute } from '#app'
import PaginationControls from '@/components/animelist/PaginationControls.vue'
import AnimeCard from '@/components/animelist/AnimeCard.vue'
import AnimeFilters from '@/components/animelist/AnimeFilters.vue'
import AnimeLoader from '@/components/animelist/AnimeLoader.vue'
import AnimeError from '@/components/animelist/AnimeError.vue'
import AnimeEmpty from '@/components/animelist/AnimeEmpty.vue'
import { Card, CardContent } from '@/components/ui/card'
import LavaLamp from '@/components/backgrounds/lavaLamp.vue'
import { useAppMeta } from '@/composables/useAppMeta'

// Configurar metadatos de la página
const { updateMeta } = useAppMeta({
  title: 'Lista de Animes',
  description: 'Explora nuestra colección completa de animes vistos con filtros y búsqueda avanzada.',
  keywords: ['anime', 'lista', 'manga', 'otaku', 'entretenimiento', 'series'],
  type: 'website'
});

// Usar composable de ruta de Nuxt
const route = useRoute()

const animeData = ref([])
const isLoading = ref(true)
const error = ref(null)

const searchQuery = ref('')
const categoryFilter = ref('todas')
const currentPage = ref(0)
const pageSize = 30

// Función para actualizar la URL usando composables de Nuxt (SSR compatible)
async function updateUrl() {
  const query = {}

  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }

  if (categoryFilter.value !== 'todas') {
    query.category = categoryFilter.value
  }

  if (currentPage.value > 0) {
    query.page = (currentPage.value + 1).toString()
  }

  // Usar navigateTo de Nuxt para actualizar la URL
  await navigateTo({ query }, { replace: true })
}

// Inicializar valores desde la URL usando useRoute (SSR compatible)
function initializeFromUrl() {
  const searchFromUrl = route.query.search?.toString() || ''
  const categoryFromUrl = route.query.category?.toString() || 'todas'
  const pageFromUrl = parseInt(route.query.page?.toString() || '1') || 1

  searchQuery.value = searchFromUrl
  categoryFilter.value = categoryFromUrl
  currentPage.value = pageFromUrl > 0 ? pageFromUrl - 1 : 0 // Convertir de 1-indexed a 0-indexed
}

async function fetchAnimeData() {
  isLoading.value = true
  error.value = null

  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/roldyoran/scrap-tiermaker/master/animes_updated.json',
    )
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    animeData.value = Array.isArray(data) ? data : Object.values(data)
  } catch (err) {
    error.value = err.message
    console.error('Error cargando datos de anime:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Inicializar desde la URL usando useRoute (SSR compatible)
  initializeFromUrl()

  // Cargar los datos
  await fetchAnimeData()

  // Watch para cambios en la ruta (reemplaza el popstate listener)
  watch(() => route.query, () => {
    initializeFromUrl()
  }, { deep: true })
})

// Función JavaScript actualizada
function notaBgClass(nota) {
  const clean = (nota || '')
    .toString()
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .trim()
    .toUpperCase()
  if (clean.includes('GOTY')) return 'goty-gold-animated'
  if (['GOD', 'WENA', 'PIOLA'].some((term) => clean.includes(term))) return 'god-tier-animated'
  if (['NO ME GUSTO', 'MALA'].some((term) => clean.includes(term))) return 'bad-tier-animated'
  if (['HORRIBLE', 'LA PEOR DE TODAS'].some((term) => clean.includes(term)))
    return 'horrible-tier-animated'
  return 'default-tier-animated'
}

// Watchers para actualizar la URL cuando cambian los valores
watch(searchQuery, () => {
  currentPage.value = 0
  updateUrl()
})

watch(categoryFilter, (newCategory) => {
  if (newCategory !== 'todas') {
    searchQuery.value = ''
  }
  currentPage.value = 0
  updateUrl()
})

watch(currentPage, () => {
  updateUrl()
})

const filteredAnimes = computed(() => {
  let filtered = animeData.value

  // Si hay una categoría seleccionada (que no sea "todas"), filtrar solo por categoría
  if (categoryFilter.value !== 'todas') {
    const category = categoryFilter.value.toLowerCase()
    filtered = filtered.filter((anime) => {
      const nota = anime.nota?.toString().toLowerCase() || ''
      return nota.includes(category)
    })
  }
  // Si la categoría es "todas", entonces aplicar filtro de búsqueda
  else if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase().replace(/\s+/g, '-')
    filtered = filtered.filter((anime) => {
      const nombre = anime.nombre?.toLowerCase().replace(/\s+/g, '-') || ''
      return nombre.includes(query)
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredAnimes.value.length / pageSize))

const paginatedAnimes = computed(() => {
  const start = currentPage.value * pageSize
  return filteredAnimes.value.slice(start, start + pageSize)
})

function clearFilters() {
  searchQuery.value = ''
  categoryFilter.value = 'todas'
  currentPage.value = 0
  // La URL se actualizará automáticamente por los watchers
}
</script>

<style>
/* Animaciones */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
h1 {
  animation: slideInFromBottom 0.8s ease-out;
}
.w-full.max-w-2xl > * {
  animation: fadeInScale 0.5s ease-out;
}
.grid > div {
  animation: fadeInScale 0.5s ease-out;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
/* .grid > div:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(251, 146, 60, 0.2);
  } */
button {
  transition: all 0.3s ease;
}
button:not(:disabled):hover {
  transform: scale(1.05);
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
footer {
  animation: slideInFromBottom 1s ease-out;
  transition: background-color 0.3s ease;
}
footer:hover {
  background-color: rgba(39, 39, 42, 0.5);
}
.absolute.top-3 {
  transition: all 0.3s ease;
}
.absolute.top-3:hover {
  transform: scale(1.1) rotate(-2deg);
}

/* Input deshabilitado cuando hay categoría seleccionada */
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(39, 39, 42, 0.5);
}

.goty-gold-animated {
  background: linear-gradient(
    135deg,
    #da570c 0%,
    #ff9800 25%,
    #ff6f00 50%,
    #d46904 75%,
    #e47309 100%
  );
  background-size: 200% 200%;
  animation: goldShimmer 6s ease-in-out infinite;
  position: relative;
  /* Sin efecto de brillo móvil */
}

.god-tier-animated {
  background: linear-gradient(135deg, #038157 0%, #0c8055 50%, #057450 100%);
  background-size: 200% 200%;
  animation: greenPulse 2.5s ease-in-out infinite;
}

.bad-tier-animated {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #991b1b 100%);
  background-size: 200% 200%;
  animation: redPulse 2s ease-in-out infinite;
}

.horrible-tier-animated {
  background: linear-gradient(
    135deg,
    #86198f 0%,
    #c026d3 25%,
    #920e8c 50%,
    #920e8c 75%,
    #c026d3 100%
  );
  background-size: 300% 300%;
  animation: horrorWave 1.5s ease-in-out infinite;
  box-shadow: 0 0 25px rgba(134, 25, 143, 0.5);
}

.default-tier-animated {
  background: linear-gradient(135deg, #3f3f46 0%, #52525b 50%, #18181b 100%);
  background-size: 200% 200%;
  animation: subtleShift 4s ease-in-out infinite;
}

/* Animaciones */
@keyframes goldShimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes greenPulse {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes redPulse {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes horrorWave {
  0%,
  100% {
    background-position: 0% 50%;
    box-shadow: 0 0 25px rgba(134, 25, 143, 0.5);
  }
  33% {
    background-position: 100% 0%;
    box-shadow: 0 0 35px rgba(134, 25, 143, 0.7);
  }
  66% {
    background-position: 0% 100%;
    box-shadow: 0 0 20px rgba(217, 119, 6, 0.6);
  }
}

@keyframes subtleShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Efectos adicionales para hover (opcional)
  .goty-gold-animated:hover {
    animation-duration: 1.5s;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }

  .god-tier-animated:hover {
    animation-duration: 1.5s;
  }

  .bad-tier-animated:hover {
    animation-duration: 1s;
  }

  .horrible-tier-animated:hover {
    animation-duration: 1s;
  } */
</style>
