<template>
  <div
    class="image-carousel"
    ref="rootRef"
    role="region"
    :aria-label="ariaLabel"
  >
    <div class="image-stack" :style="{ '--fade-duration': fadeMs }">
      <img
        v-if="currentImage"
        :key="`current-${index}`"
        :src="currentImage"
        class="image current absolute h-full w-full object-cover"
        :alt="`carousel image ${index + 1}`"
        draggable="false"
        loading="eager"
        decoding="sync"
        :style="{ transitionDuration: fadeMs, animationDuration: fadeMs }"
        @animationend="onImageAnimationEnd"
      />

      <img
        v-if="prevIndex !== null && images[prevIndex]"
        :key="`prev-${prevIndex}-${images[prevIndex]}`"
        :src="images[prevIndex]"
        class="image prev absolute h-full w-full object-cover"
        :alt="`carousel image ${prevIndex + 1}`"
        draggable="false"
        loading="eager"
        decoding="sync"
        :style="{ transitionDuration: fadeMs, animationDuration: fadeMs }"
        @animationend="onImageAnimationEnd"
      />

      <div v-if="!currentImage" class="empty">No images</div>
    </div>

    <div v-if="showControls" class="controls">
      <button 
        class="ctrl prev" 
        @click="prev" 
        :disabled="isAnimating"
        aria-label="Previous image"
      >‹</button>
      <button 
        class="ctrl next" 
        @click="next" 
        :disabled="isAnimating"
        aria-label="Next image"
      >›</button>
    </div>

    <div v-if="showIndicators" class="indicators">
      <button
        v-for="(img, i) in images"
        :key="i"
        :class="['dot', { active: i === index }]"
        @click="goTo(i)"
        :disabled="isAnimating"
        :aria-current="i === index ? 'true' : 'false'"
        :aria-label="`Go to image ${i + 1}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, type PropType } from 'vue'

const props = defineProps({
  images: { type: Array as PropType<string[]>, default: () => [] as string[] },
  interval: { type: Number, default: 2500 },
  fadeDuration: { type: Number, default: 600 },
  autoplay: { type: Boolean, default: true },
  showIndicators: { type: Boolean, default: true },
  showControls: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Image carousel' },
})

const emit = defineEmits(['update:currentIndex', 'change'])

// State
const index = ref<number>(0)
const prevIndex = ref<number | null>(null)
const isAnimating = ref<boolean>(false)
const rootRef = ref<HTMLElement | null>(null)
const timerId = ref<number | null>(null)
const safetyTimeout = ref<number | null>(null)
const preloaded = new Set<string>()

const images = computed<string[]>(() => props.images || [])
const currentImage = computed<string | null>(() => (images.value.length ? (images.value[index.value] ?? null) : null))
const fadeMs = computed(() => `${props.fadeDuration}ms`)

function preloadNearby(count = 2) {
  if (!images.value.length) return
  for (let i = 1; i <= count; i++) {
    const idx = (index.value + i) % images.value.length
    const src = images.value[idx]
    if (src && !preloaded.has(src)) {
      const img = new Image()
      img.src = src
      preloaded.add(src)
    }
  }
}

function clearSafetyTimeout() {
  if (safetyTimeout.value) {
    clearTimeout(safetyTimeout.value)
    safetyTimeout.value = null
  }
}

function startAutoplay() {
  stopAutoplay()
  if (!props.autoplay || !images.value.length) return
  timerId.value = window.setInterval(() => { go(1) }, Math.max(100, props.interval))
}

function stopAutoplay() {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
}

function beginTransition(newIndex: number) {
  // If already animating, ignore calls
  if (isAnimating.value) return false

  prevIndex.value = index.value
  index.value = newIndex
  isAnimating.value = true

  // safety timeout in case animationend doesn't fire
  clearSafetyTimeout()
  safetyTimeout.value = window.setTimeout(() => {
    isAnimating.value = false
    prevIndex.value = null
    clearSafetyTimeout()
  }, props.fadeDuration + 120)

  return true
}

function go(delta: number) {
  if (!images.value.length) return
  const nextIndex = (index.value + delta + images.value.length) % images.value.length
  if (nextIndex === index.value || isAnimating.value) return
  const changed = beginTransition(nextIndex)
  if (changed) {
    emit('update:currentIndex', index.value)
    emit('change', index.value)
    nextTick(preloadNearby)
  }
}

function next() { go(1) }
function prev() { go(-1) }
function goTo(i: number) { if (!images.value.length) return; if (i === index.value || isAnimating.value) return; beginTransition(Math.max(0, Math.min(i, images.value.length -1))); emit('update:currentIndex', index.value); emit('change', index.value); nextTick(preloadNearby) }

// Expose controls
defineExpose({ next, prev, goTo })

function onImageAnimationEnd() {
  isAnimating.value = false
  prevIndex.value = null
  clearSafetyTimeout()
}

watch(() => props.images, (nv) => {
  if (!nv || !nv.length) {
    index.value = 0
  } else if (index.value >= nv.length) {
    index.value = 0
  }
  startAutoplay()
}, { immediate: true })

watch(() => props.autoplay, startAutoplay)
watch(() => props.interval, startAutoplay)

onMounted(() => {
  startAutoplay()
  preloadNearby()
})

onBeforeUnmount(() => {
  stopAutoplay()
  clearSafetyTimeout()
  preloaded.clear()
})
</script>

<style scoped>
.image-carousel {
  position: relative;
  display: block;
  overflow: hidden;
  height: 500px;
  width: 190px;
  background: rgb(31, 41, 55); /* bg-gray-800 equivalent */
  border-radius: 0.5rem; /* rounded-lg equivalent */
  contain: layout style paint;
  isolation: isolate;
}
.image-stack {
  position: absolute;
  inset: 0;
  perspective: 1000px;
}
.image-stack .image {
  position: absolute;
  height: 100%;
  width: 100%;
  object-fit: cover;
  user-select: none;
  opacity: 1;
  transition-property: opacity, transform;
  transition-duration: var(--fade-duration, 300ms);
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  image-rendering: optimizeQuality;
}
.image-stack .image.current {
  z-index: 1; /* current image sits above */
  opacity: 0; /* starts hidden, fades in */
  animation: fadeIn var(--fade-duration, 300ms) cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.image-stack .image.prev {
  z-index: 0; /* previous image sits below */
  opacity: 1;
}
.image-stack .image.prev.fading {
  opacity: 0;
  animation: fadeOut var(--fade-duration, 300ms) cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateZ(0) scale(1.02);
  }
  to {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateZ(0) scale(0.98);
  }
}
.image-carousel .empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground, #888);
  padding: 1rem;
  background: transparent;
}

.controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}
.ctrl {
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.35);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  margin: 0.5rem;
  border-radius: 4px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.ctrl:hover {
  background: rgba(0, 0, 0, 0.55);
}
.ctrl:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.indicators {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0.5rem;
  display: flex;
  gap: 0.35rem;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}
.dot:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dot.active {
  background: white;
  transform: scale(1.15);
}

</style>