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
        :key="`current-${currentImageKey}`"
        :src="currentImage"
        class="image current absolute h-full w-full object-cover"
        :alt="`carousel image ${index + 1}`"
        draggable="false"
        loading="eager"
        decoding="sync"
        :style="{ 
          transitionDuration: fadeDuration + 'ms',
          animationDuration: fadeDuration + 'ms'
        }"
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
        :class="{ fading: prevFading }"
        :style="{ 
          transitionDuration: fadeDuration + 'ms',
          animationDuration: fadeDuration + 'ms'
        }"
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

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { animate, stagger, delay, spring } from 'motion'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  interval: {
    type: Number,
    default: 2500, // Longer interval for better UX
  },
  fadeDuration: {
    type: Number,
    default: 600, // Increased for smoother transition
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  useStaggeredAnimation: {
    type: Boolean,
    default: false, // Enable your staggered animation pattern
  },
  staggerDelay: {
    type: Number,
    default: 5, // Stagger delay in seconds (matching your example)
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
const prevIndex = ref(null)
const prevFading = ref(false)
const rootRef = ref(null)
const isAnimating = ref(false)
const animationTimeoutId = ref(null)
const preloadedImages = new Set()

const images = computed(() => props.images || [])

const currentImage = computed(() => (images.value.length ? images.value[index.value] : null))
const currentImageKey = computed(() => `${index.value}-${currentImage.value}`)
const fadeMs = computed(() => `${props.fadeDuration}ms`)

// Preload next images using JavaScript (avoids browser warnings)
function preloadNextImages() {
  if (!images.value.length) return
  
  for (let i = 1; i <= 3; i++) {
    const nextIndex = (index.value + i) % images.value.length
    const imageSrc = images.value[nextIndex]
    
    if (imageSrc && !preloadedImages.has(imageSrc)) {
      const img = new Image()
      img.src = imageSrc
      preloadedImages.add(imageSrc)
    }
  }
}

// Staggered animation similar to your example
function startStaggeredAnimation() {
  const carouselImages = rootRef.value?.querySelectorAll('.image')
  if (!carouselImages || carouselImages.length === 0) return
  
  delay(() => {
    // Apply the fade-in animation with stagger
    animate(carouselImages, { opacity: [0, 1] }, { duration: 1, delay: stagger(props.staggerDelay) });
  }, props.staggerDelay);
  
  // Apply the fade-out animation for all images
  animate(carouselImages, { opacity: [1, 0], duration: 1 });
}

// Auto-start staggered animation with interval (similar to your setInterval pattern)
function startStaggeredInterval() {
  if (!props.useStaggeredAnimation || !props.autoplay) return
  
  // Initial animation
  startStaggeredAnimation()
  
  // Repeat animation (21 seconds in your example, but using the interval prop for flexibility)
  const staggerInterval = Math.max(props.interval * 8, 21000) // Default to 21s like your example
  setInterval(startStaggeredAnimation, staggerInterval)
}

function startTimer() {
  stopTimer()
  if (!props.autoplay) return
  timerId.value = setInterval(
    () => {
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



function clearAnimationState() {
  if (animationTimeoutId.value) {
    clearTimeout(animationTimeoutId.value)
    animationTimeoutId.value = null
  }
  prevFading.value = false
  prevIndex.value = null
  isAnimating.value = false
}

function triggerTransition() {
  // Prevent rapid clicks during animation
  if (isAnimating.value) return false
  
  // If staggered animation is enabled, use the staggered pattern instead
  if (props.useStaggeredAnimation) {
    startStaggeredAnimation()
    // Set a timeout to clear animation state based on stagger timing
    animationTimeoutId.value = setTimeout(() => {
      clearAnimationState()
    }, (props.staggerDelay * 1000) + (props.fadeDuration * 2))
    isAnimating.value = true
    return true
  }
  
  isAnimating.value = true
  
  nextTick(() => {
    const currentImg = rootRef.value?.querySelector('.image.current')
    const prevImg = rootRef.value?.querySelector('.image.prev')
    
    if (currentImg && prevImg) {
      try {
        // Use motion library for smoother crossfade animations
        const fadeInPromise = animate(
          currentImg, 
          { opacity: [0, 1] }, 
          { 
            duration: props.fadeDuration / 1000, // motion uses seconds
            easing: spring({ stiffness: 300, damping: 30 })
          }
        )
        
        const fadeOutPromise = animate(
          prevImg, 
          { opacity: [1, 0] }, 
          { 
            duration: props.fadeDuration / 1000, // motion uses seconds
            easing: spring({ stiffness: 300, damping: 30 })
          }
        )
        
        // Use Promise.all for better synchronization
        Promise.all([
          fadeInPromise.finished,
          fadeOutPromise.finished
        ]).then(() => {
          clearAnimationState()
        }).catch(() => {
          // Fallback cleanup
          clearAnimationState()
        })
        
        // Safety timeout
        animationTimeoutId.value = setTimeout(() => {
          clearAnimationState()
        }, props.fadeDuration + 100)
        
      } catch (error) {
        console.warn('Motion animation failed, using CSS fallback:', error)
        // Enhanced CSS fallback with better timing
        prevFading.value = true
        
        // Use requestAnimationFrame for smoother timing
        requestAnimationFrame(() => {
          animationTimeoutId.value = setTimeout(() => {
            clearAnimationState()
          }, props.fadeDuration)
        })
      }
    } else {
      // Enhanced CSS fallback with better timing
      prevFading.value = true
      
      // Use requestAnimationFrame for smoother timing
      requestAnimationFrame(() => {
        animationTimeoutId.value = setTimeout(() => {
          clearAnimationState()
        }, props.fadeDuration)
      })
    }
  })
  
  return true
}

function next() {
  if (!images.value.length || isAnimating.value) return
  
  prevIndex.value = index.value
  prevFading.value = false
  index.value = (index.value + 1) % images.value.length
  emit('update:currentIndex', index.value)
  emit('change', index.value)
  
  triggerTransition()
  preloadNextImages()
}

function prev() {
  if (!images.value.length || isAnimating.value) return
  
  prevIndex.value = index.value
  prevFading.value = false
  index.value = (index.value - 1 + images.value.length) % images.value.length
  emit('update:currentIndex', index.value)
  emit('change', index.value)
  
  triggerTransition()
}

function goTo(i) {
  if (!images.value.length || isAnimating.value) return
  
  const target = Math.max(0, Math.min(i, images.value.length - 1))
  if (target === index.value) return
  
  prevIndex.value = index.value
  prevFading.value = false
  index.value = target
  emit('update:currentIndex', index.value)
  emit('change', index.value)
  
  triggerTransition()
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

onMounted(() => {
  if (props.useStaggeredAnimation) {
    startStaggeredInterval()
  } else {
    startTimer()
  }
  preloadNextImages()
})
onBeforeUnmount(() => {
  stopTimer()
  clearAnimationState()
  preloadedImages.clear()
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

/* Note: manual crossfade uses .prev.fading (opacity -> 0) and --fade-duration */
</style>