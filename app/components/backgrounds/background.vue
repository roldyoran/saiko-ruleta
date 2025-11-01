<template>
  <!--- Animación de olas --->
  <div class="waves-container min-h-screen w-full animate-gradient">
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
  </div>
</template>

<style>
/* Gradient Animation */
@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

/* Use theme variables (defined in src/assets/main.css) so the gradient
   adapts to light/dark mode. The variables used are present in :root
   and overridden in .dark (e.g. --background, --sidebar, --card, --muted,
   --accent). */
.animate-gradient {
  background: linear-gradient(
    120deg,
    var(--background) 0%,
    var(--sidebar) 25%,
    var(--card) 50%,
    var(--muted) 75%,
    var(--card) 100%
  );
  background-size: 500% 500%;
  /* keep a slow, subtle transition that matches the original feel */
  animation: gradient 30s ease-in-out infinite;
}

/* Wave Styles */
.waves-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}

.wave {
  /* Fallback for older browsers, then prefer a theme-aware color using color-mix */
  background: rgba(255, 255, 255, 0.04);
  /* subtle wave highlight using the popover-foreground color with low alpha */
  background: color-mix(in srgb, var(--popover-foreground) 6%, transparent);
  border-radius: 1000% 1000% 0 0;
  position: fixed;
  width: 200%;
  height: 9em;
  animation: wave 10s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
  z-index: -10;
}

.wave:nth-of-type(2) {
  bottom: -1.25em;
  animation: wave 18s linear reverse infinite;
  opacity: 0.8;
}

.wave:nth-of-type(3) {
  bottom: -3em;
  animation: wave 20s -1s reverse infinite;
  opacity: 0.9;
}

/* Wave Animation */
@keyframes wave {
  2% {
    transform: translateX(1);
  }
  25% {
    transform: translateX(-25%);
  }
  50% {
    transform: translateX(-50%);
  }
  75% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(1);
  }
}
</style>
