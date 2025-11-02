<template>
  <main>
    <LavaLamp />
    <section v-for="[temporada, usuarios] in Object.entries(data)" :key="temporada">
      <h1
        class="py-4 text-3xl bg-clip-text text-transparent bg-linear-to-r from-[#e94fe1] to-[#f37018] font-extrabold flex items-center justify-center"
      >
        {{ temporada }}
      </h1>
      <div class="gallery flex flex-wrap items-center justify-center">
        <template v-for="[usuario, contenido] in Object.entries(usuarios)" :key="usuario">
          <!-- Renderizar imágenes (solo si existen) -->
          <template v-if="Array.isArray(contenido.imagenes)">
            <div
              v-for="imagen in contenido.imagenes"
              :key="`img-${usuario}-${imagen}`"
              class="group m-2 relative cursor-pointer"
              @click="openModal(`${baseLinkImage}/${usuario}/${imagen}`)"
            >
              <ImageSkeleton
                :src="`${baseLinkImage}/${usuario}/${imagen}`"
                :alt="`Imagen de ${usuario}`"
                wrapperClass="relative overflow-hidden flex items-end rounded-lg md:w-72 md:h-72 w-36 h-36 border-2 border-pink-200/10"
              />
              <a
                :href="`https://www.instagram.com/${usuario}`"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute bg-rose-950 bottom-2 left-2 z-10 px-3 py-1.5 rounded-md text-white font-semibold text-sm shadow transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-linear-to-br hover:from-purple-600 hover:via-indigo-500 hover:to-pink-500"
                @click.stop
              >
                @{{ usuario }}
              </a>
            </div>
          </template>

          <!-- Renderizar stickers (solo si existen) -->
          <template v-if="Array.isArray(contenido.stickers)">
            <div
              v-for="imagen in contenido.stickers"
              :key="`sticker-${usuario}-${imagen}`"
              class="group m-2 relative cursor-pointer"
              @click="openModal(`${baseLinkImage}/${usuario}/${imagen}`)"
            >
              <ImageSkeleton
                :src="`${baseLinkImage}/${usuario}/${imagen}`"
                :alt="`Sticker de ${usuario}`"
                wrapperClass="relative overflow-hidden flex items-end rounded-lg md:w-72 md:h-72 w-36 h-36 border-2 border-pink-200/10"
              />
              <a
                :href="`https://www.instagram.com/${usuario}`"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute bg-rose-950 bottom-2 left-2 z-10 px-3 py-1.5 rounded-md text-white font-semibold text-sm shadow transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-linear-to-br hover:from-purple-600 hover:via-indigo-500 hover:to-pink-500"
                @click.stop
              >
                @{{ usuario }}
              </a>
            </div>
          </template>
        </template>
      </div>
    </section>

    <div
      v-show="showModal"
      class="fixed inset-0 z-1000 left-0 top-0 w-full h-full overflow-auto bg-[rgba(0,0,0,0.8)] transition-all"
      @click="closeModal"
    >
      <span
        class="absolute top-4 right-9 text-4xl text-white cursor-pointer z-1001 hover:text-gray-400"
        @click="closeModal"
        >&times;</span
      >
      <img
        class="block max-w-full max-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        :src="modalImage"
      />
    </div>
  </main>
  <footer class="my-6 text-center no-hover">VIVAN LAS LESBIANAS!!!!</footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import data from '@/assets/galeria.json'
import LavaLamp from '@/components/backgrounds/lavaLamp.vue'
import ImageSkeleton from '@/components/ImageSkeleton.vue'
import { useAppMeta } from '@/composables/useAppMeta'

// Configurar metadatos de la página
const { updateMeta } = useAppMeta({
  title: 'Galería',
  description: 'Explora nuestra galería de imágenes organizadas por temporadas y creadores.',
  keywords: ['galería', 'imágenes', 'fotos', 'temporadas', 'colección'],
  type: 'website'
});

// Variables reactivas
const showModal = ref(false)
const modalImage = ref('')
const baseLinkImage = ref('')

// Funciones del modal
const openModal = (imageSrc) => {
  modalImage.value = imageSrc
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  showModal.value = false
  document.body.style.overflow = 'auto'
}

// Cerrar modal con ESC
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Mantener sólo la regla necesaria para anular el hover global del footer */
footer.no-hover,
footer.no-hover:hover {
  background-color: transparent !important;
}
</style>
