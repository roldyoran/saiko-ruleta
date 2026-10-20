<template>
  <div class="snow-scene" aria-hidden="true">
    <!-- Copos fijos: sin JS, solo animación CSS (transform + opacity = GPU) -->
    <span v-for="n in 14" :key="n" class="flake" />
  </div>
</template>

<script setup lang="ts">
// Sin lógica: visual puro y optimizado.
</script>

<style scoped>
/* Caída con vaivén lateral: un solo keyframe por copo */
@keyframes snowfall {
  0% {
    transform: translate3d(0, -5vh, 0);
    opacity: 0;
  }
  8% {
    opacity: var(--peak, 0.85);
  }
  25% {
    transform: translate3d(var(--sway, 20px), 25vh, 0);
  }
  50% {
    transform: translate3d(calc(var(--sway, 20px) * -0.6), 55vh, 0);
    opacity: var(--peak, 0.85);
  }
  75% {
    transform: translate3d(var(--sway, 20px), 80vh, 0);
  }
  92% {
    opacity: var(--peak, 0.85);
  }
  100% {
    transform: translate3d(calc(var(--sway, 20px) * -0.3), 105vh, 0);
    opacity: 0;
  }
}

/* Parpadeo sutil para algunos copos (segunda animación, misma capa) */
@keyframes twinkle {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.6);
  }
}

.snow-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.flake {
  position: absolute;
  top: 0;
  display: block;
  border-radius: 9999px;
  background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.7) 60%, transparent 100%);
  will-change: transform, opacity;
  animation: snowfall linear infinite;
}

/* Variaciones: posición, tamaño, vaivén, duración y brillo máximo */
.flake:nth-child(1) {
  left: 4%;
  width: 5px;
  height: 5px;
  --sway: 24px;
  --peak: 0.9;
  animation-duration: 11s;
}
.flake:nth-child(2) {
  left: 12%;
  width: 3px;
  height: 3px;
  --sway: -18px;
  --peak: 0.6;
  animation-duration: 14s;
  animation-delay: 2s;
  filter: blur(0.6px);
}
.flake:nth-child(3) {
  left: 20%;
  width: 6px;
  height: 6px;
  --sway: 30px;
  --peak: 0.95;
  animation-duration: 10s;
  animation-delay: 1s;
  animation-name: snowfall, twinkle;
  animation-duration: 10s, 3s;
}
.flake:nth-child(4) {
  left: 28%;
  width: 4px;
  height: 4px;
  --sway: -24px;
  --peak: 0.75;
  animation-duration: 13s;
  animation-delay: 4s;
}
.flake:nth-child(5) {
  left: 36%;
  width: 3px;
  height: 3px;
  --sway: 16px;
  --peak: 0.55;
  animation-duration: 16s;
  animation-delay: 0.5s;
  filter: blur(0.6px);
}
.flake:nth-child(6) {
  left: 44%;
  width: 7px;
  height: 7px;
  --sway: -30px;
  --peak: 1;
  animation-duration: 9s;
  animation-delay: 1.5s;
  animation-name: snowfall, twinkle;
  animation-duration: 9s, 2.4s;
}
.flake:nth-child(7) {
  left: 52%;
  width: 4px;
  height: 4px;
  --sway: 20px;
  --peak: 0.7;
  animation-duration: 12s;
  animation-delay: 3s;
}
.flake:nth-child(8) {
  left: 60%;
  width: 5px;
  height: 5px;
  --sway: -16px;
  --peak: 0.85;
  animation-duration: 11s;
  animation-delay: 0.8s;
}
.flake:nth-child(9) {
  left: 68%;
  width: 3px;
  height: 3px;
  --sway: 26px;
  --peak: 0.5;
  animation-duration: 15s;
  animation-delay: 2.5s;
  filter: blur(0.6px);
}
.flake:nth-child(10) {
  left: 76%;
  width: 6px;
  height: 6px;
  --sway: -22px;
  --peak: 0.9;
  animation-duration: 10s;
  animation-delay: 5s;
  animation-name: snowfall, twinkle;
  animation-duration: 10s, 3.6s;
}
.flake:nth-child(11) {
  left: 84%;
  width: 4px;
  height: 4px;
  --sway: 18px;
  --peak: 0.7;
  animation-duration: 13s;
  animation-delay: 1.2s;
}
.flake:nth-child(12) {
  left: 91%;
  width: 5px;
  height: 5px;
  --sway: -28px;
  --peak: 0.85;
  animation-duration: 12s;
  animation-delay: 3.8s;
}
.flake:nth-child(13) {
  left: 8%;
  width: 4px;
  height: 4px;
  --sway: 22px;
  --peak: 0.65;
  animation-duration: 14s;
  animation-delay: 6s;
  filter: blur(0.6px);
}
.flake:nth-child(14) {
  left: 96%;
  width: 6px;
  height: 6px;
  --sway: -20px;
  --peak: 0.9;
  animation-duration: 11s;
  animation-delay: 2.2s;
  animation-name: snowfall, twinkle;
  animation-duration: 11s, 2.8s;
}

@media (prefers-reduced-motion: reduce) {
  .flake {
    animation: none;
    opacity: 0.25;
  }
}

/* En móvil, la mitad de copos: menos píxeles a componer */
@media (max-width: 768px) {
  .flake:nth-child(n + 8) {
    display: none;
  }
}
</style>
