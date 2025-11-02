<template>
        <div class="-z-50 snow-scene animate-gradient" >
          <!-- Reduced snowflakes for better performance -->
          <span v-for="n in 8" :key="n" class="flake" />
        </div>
</template>

<script setup lang="ts">
// No script logic required — pure visual component
</script>

<style scoped>

/* Simplified gradient animation - reduced complexity */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Simpler gradient with reduced animation complexity */
.animate-gradient {
  background: linear-gradient(
    45deg,
    var(--background) 0%,
    var(--muted) 50%,
    var(--background) 100%
  );
  background-size: 200% 200%;
  animation: gradient 60s ease-in-out infinite;
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Container covers the whole area of the parent */
.snow-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  --flake-color: rgba(255, 255, 255, 0.9);
}

/* Simplified flake style - reduced visual effects for better performance */
.flake {
  position: absolute;
  top: -5vh;
  display: block;
  width: 4px;
  height: 4px;
  background: var(--flake-color);
  border-radius: 50%;
  opacity: 0.8;
  will-change: transform;
  animation: fall linear infinite;
}

/* Simplified animation - only vertical fall with slight horizontal drift */
@keyframes fall {
  0% { 
    transform: translateY(-5vh) translateX(0);
    opacity: 0;
  }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { 
    transform: translateY(105vh) translateX(var(--drift, 20px));
    opacity: 0;
  }
}

/* Simplified flake variations - only 8 flakes with basic positioning */
.flake:nth-child(1) { left: 10%; --drift: 15px; animation-duration: 8s; animation-delay: 0s; }
.flake:nth-child(2) { left: 25%; --drift: -10px; animation-duration: 12s; animation-delay: 2s; }
.flake:nth-child(3) { left: 40%; --drift: 25px; animation-duration: 10s; animation-delay: 1s; }
.flake:nth-child(4) { left: 55%; --drift: -20px; animation-duration: 14s; animation-delay: 3s; }
.flake:nth-child(5) { left: 70%; --drift: 12px; animation-duration: 9s; animation-delay: 0.5s; }
.flake:nth-child(6) { left: 85%; --drift: -15px; animation-duration: 11s; animation-delay: 1.5s; }
.flake:nth-child(7) { left: 20%; --drift: 30px; animation-duration: 13s; animation-delay: 2.5s; }
.flake:nth-child(8) { left: 75%; --drift: -25px; animation-duration: 15s; animation-delay: 0.8s; }

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .flake, .animate-gradient {
    animation: none !important;
  }
  .flake {
    opacity: 0.3;
  }
}

/* Additional mobile optimizations */
@media (max-width: 768px) {
  .flake {
    width: 3px;
    height: 3px;
    opacity: 0.6;
  }
  .animate-gradient {
    animation-duration: 120s; /* Slower animation on mobile */
  }
}

/* Reduce animations on low-end devices */
@media (max-width: 480px) {
  .snow-scene {
    display: none; /* Hide on very small screens to save resources */
  }
}

</style>
