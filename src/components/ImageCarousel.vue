<template>
  <div
    class="image-carousel"
    ref="rootRef"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    role="region"
    :aria-label="ariaLabel"
  >
    <div class="image-stack" :style="{ '--fade-duration': fadeMs }">
      <img
        v-if="currentImage"
        :key="`current-${currentImageKey}`"
        :src="currentImage"
        class="image current"
        :alt="`carousel image ${index + 1}`"
        draggable="false"
        :style="{ transitionDuration: fadeDuration + 'ms' }"
      />

      <img
        v-if="prevIndex !== null && images[prevIndex]"
        :key="`prev-${prevIndex}-${images[prevIndex]}`"
        :src="images[prevIndex]"
        class="image prev"
        :alt="`carousel image ${prevIndex + 1}`"
        draggable="false"
        :class="{ fading: prevFading }"
        :style="{ transitionDuration: fadeDuration + 'ms' }"
      />

      <div v-if="!currentImage" class="empty">No images</div>
    </div>

    <div v-if="showControls" class="controls">
      <button class="ctrl prev" @click="prev" aria-label="Previous image">‹</button>
      <button class="ctrl next" @click="next" aria-label="Next image">›</button>
    </div>

    <div v-if="showIndicators" class="indicators">
      <button
        v-for="(img, i) in images"
        :key="i"
        :class="['dot', { active: i === index }]"
        @click="goTo(i)"
        :aria-current="i === index ? 'true' : 'false'"
        :aria-label="`Go to image ${i + 1}`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  interval: {
    type: Number,
    default: 1000, // ms
  },
  fadeDuration: {
    type: Number,
    default: 300,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  pauseOnHover: {
    type: Boolean,
    default: true,
  },
  showIndicators: {
    type: Boolean,
    default: true,
  },
  showControls: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: 'Image carousel',
  },
})

const emit = defineEmits(['update:currentIndex', 'change'])

const index = ref(0)
const timerId = ref(null)
const hovering = ref(false)
const prevIndex = ref(null)
const prevFading = ref(false)
const rootRef = ref(null)

const images = computed(() => props.images || [])

const currentImage = computed(() => (images.value.length ? images.value[index.value] : null))
const currentImageKey = computed(() => `${index.value}-${currentImage.value}`)
const fadeMs = computed(() => `${props.fadeDuration}ms`)

function startTimer() {
  stopTimer()
  if (!props.autoplay) return
  timerId.value = setInterval(
    () => {
      if (props.pauseOnHover && hovering.value) return
      next()
    },
    Math.max(100, props.interval),
  )
}

function stopTimer() {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
}

function next() {
  if (!images.value.length) return
  // prepare crossfade: show prev image (current), advance index, then trigger fade in next tick
  prevIndex.value = index.value
  prevFading.value = false
  index.value = (index.value + 1) % images.value.length
  emit('update:currentIndex', index.value)
  emit('change', index.value)

  // ensure DOM updated so CSS transition will apply
  nextTick(() => {
    // Try Web Animations API for a smoother crossfade
    const prevImg = rootRef.value && rootRef.value.querySelector('.image.prev')
    if (prevImg && prevImg.animate) {
      prevImg.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: props.fadeDuration,
        easing: 'ease',
      })
      // cleanup after animation
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    } else {
      // fallback to CSS class
      prevFading.value = true
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    }
  })
}

function prev() {
  if (!images.value.length) return
  prevIndex.value = index.value
  prevFading.value = false
  index.value = (index.value - 1 + images.value.length) % images.value.length
  emit('update:currentIndex', index.value)
  emit('change', index.value)

  nextTick(() => {
    const prevImg = rootRef.value && rootRef.value.querySelector('.image.prev')
    if (prevImg && prevImg.animate) {
      prevImg.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: props.fadeDuration,
        easing: 'ease',
      })
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    } else {
      prevFading.value = true
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    }
  })
}

function goTo(i) {
  if (!images.value.length) return
  const target = Math.max(0, Math.min(i, images.value.length - 1))
  if (target === index.value) return
  prevIndex.value = index.value
  prevFading.value = false
  index.value = target
  emit('update:currentIndex', index.value)
  emit('change', index.value)

  nextTick(() => {
    const prevImg = rootRef.value && rootRef.value.querySelector('.image.prev')
    if (prevImg && prevImg.animate) {
      prevImg.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: props.fadeDuration,
        easing: 'ease',
      })
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    } else {
      prevFading.value = true
      setTimeout(() => {
        prevFading.value = false
        prevIndex.value = null
      }, props.fadeDuration)
    }
  })
}

function onMouseEnter() {
  if (props.pauseOnHover) hovering.value = true
}

function onMouseLeave() {
  if (props.pauseOnHover) hovering.value = false
}

// Expose methods so parent can control the carousel
defineExpose({ next, prev, goTo })

watch(
  () => props.images,
  (newVal) => {
    // Reset index if current index out of bounds
    if (!newVal || !newVal.length) {
      index.value = 0
    } else if (index.value >= newVal.length) {
      index.value = 0
    }
    // restart timer so interval resets when images change
    startTimer()
  },
  { immediate: true },
)

watch(
  () => props.interval,
  () => startTimer(),
)
watch(
  () => props.autoplay,
  () => startTimer(),
)

onMounted(() => startTimer())
onBeforeUnmount(() => stopTimer())
</script>

<style scoped>
.image-carousel {
  position: relative;
  display: block;
  overflow: hidden;
  width: 100%;
  /* min-height: 100%; */
  /* keep a stable height using aspect-ratio; fallback min-height for older browsers */
  /* aspect-ratio: 16 / 9; */
  min-height: 580px;
  background: transparent;
}
.image-stack {
  position: absolute;
  inset: 0;
}
.image-stack .image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  opacity: 1;
  transition-property: opacity;
  transition-duration: var(--fade-duration, 300ms);
  will-change: opacity, transform;
  transform: translateZ(0);
}
.image-stack .image.current {
  z-index: 0; /* current sits below previous during fade */
  opacity: 1;
}
.image-stack .image.prev {
  z-index: 1; /* previous image sits on top and fades out */
  opacity: 1;
}
.image-stack .image.prev.fading {
  opacity: 0;
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
}
.dot.active {
  background: white;
  transform: scale(1.15);
}

/* Note: manual crossfade uses .prev.fading (opacity -> 0) and --fade-duration */
</style>
