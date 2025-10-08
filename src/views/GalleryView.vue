<template>
  <div>
    <main>
      <section v-for="[temporada, usuarios] in Object.entries(data)" :key="temporada">
        <h1 class="py-4 text-3xl">{{ temporada }}</h1>
        <div class="gallery">
          <template v-for="[usuario, contenido] in Object.entries(usuarios)" :key="usuario">
            <!-- Renderizar imágenes (solo si existen) -->
            <template v-if="Array.isArray(contenido.imagenes)">
              <div
                v-for="imagen in contenido.imagenes"
                :key="`img-${usuario}-${imagen}`"
                class="image-container"
                @click="openModal(`${baseLinkImage}/${usuario}/${imagen}`)"
              >
                <img
                  :src="`${baseLinkImage}/${usuario}/${imagen}`"
                  :alt="`Imagen de ${usuario}`"
                  loading="lazy"
                  class="object-cover rounded-2xl"
                />
                <a
                  :href="`https://www.instagram.com/${usuario}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="instagram-link"
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
                class="image-container"
                @click="openModal(`${baseLinkImage}/${usuario}/${imagen}`)"
              >
                <img
                  :src="`${baseLinkImage}/${usuario}/${imagen}`"
                  :alt="`Sticker de ${usuario}`"
                  loading="lazy"
                  class="object-cover rounded-2xl"
                />
                <a
                  :href="`https://www.instagram.com/${usuario}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="instagram-link"
                  @click.stop
                >
                  @{{ usuario }}
                </a>
              </div>
            </template>
          </template>
        </div>
      </section>

      <section class="my-4 flex flex-col items-center justify-center text-white/40">
        <footer class="mt-6 text-center">VIVAN LAS LESBIANAS!!!!</footer>
      </section>

      <div v-show="showModal" class="modal" @click="closeModal">
        <span class="close" @click="closeModal">&times;</span>
        <img class="modal-content" :src="modalImage" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import data from '@/assets/galeria.json'

// Variables reactivas
const showModal = ref(false)
const modalImage = ref('')
const baseLinkImage = ref('')

// Configuración base de la imagen
const isDev = import.meta.env.DEV || false
baseLinkImage.value = isDev ? '' : '/Saiko_Ruleta'

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
h1 {
  height: auto;
  width: auto;
  font-family: 'Arial Narrow Bold', sans-serif;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  place-items: center;
  background: linear-gradient(to right, rgb(233, 79, 225), rgb(243, 112, 24));
  background-clip: text;
  color: transparent;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.image-container {
  position: relative;
  overflow: hidden;
  margin: 10px;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: flex-end;
  border-radius: 20px;
  /* background: #fffbfb; */
  border: 2px solid rgba(184, 97, 151, 0.1);
  cursor: pointer;
}

@media (max-width: 767px) {
  .image-container {
    width: 150px;
    height: 150px;
    margin: 5px;
  }
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transition: transform 0.4s ease;
}

.image-container:hover img {
  transform: scale(1.1);
}

.instagram-link {
  font-family: system-ui, sans-serif;
  background: #6b0728;
  padding: 8px 16px;
  border-radius: 20px;
  color: #fff;
  text-decoration: none;
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.5s ease;
  z-index: 10;
}

.instagram-link:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #5e36bd, #794acf, #89379e, #9c2a89, #c23363, #e63535);
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.8);
  transition: all;
}

.modal-content {
  margin: auto;
  display: block;
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.close {
  color: #fff;
  position: absolute;
  top: 15px;
  right: 35px;
  font-size: 40px;
  cursor: pointer;
  z-index: 1001;
}

.close:hover,
.close:focus {
  color: #999;
}

/* BARRA DE DESPLAZAMIENTO */
/* Estilos para la barra de desplazamiento en WebKit (Safari, Chrome, Opera) */
:global(html)::-webkit-scrollbar {
  width: 10px;
}

:global(html)::-webkit-scrollbar-track {
  background: #464545;
}

:global(html)::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #5b33b9, #704bb6, #89379e, #b635a0, #b42655, #da2727);
  border-radius: 5px;
}

:global(html)::-webkit-scrollbar-thumb:hover {
  background: #a5a3a3;
}
</style>
