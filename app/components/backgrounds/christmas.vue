<template>
        <div class="-z-50 snow-scene animate-gradient" >
          <!-- Generate 40 snowflakes for variety -->
          <span v-for="n in 22" :key="n" class="flake" />
        </div>
</template>

<script setup lang="ts">
// No script logic required — pure visual component
</script>

<style scoped>

/* Gradient Animation (reused from background.vue) */
@keyframes gradient {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}

/* Apply a themed, slowly animated gradient to the scene so the snow appears
   over a moving background. We keep the component's z-index low so content
   remains above it. */
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
  animation: gradient 30s ease-in-out infinite;
  position: absolute; /* ensure it fills the parent */
  inset: 0;
  pointer-events: none; /* don't block UI interactions */
}

/* Container covers the whole area of the parent */
.snow-scene {
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  pointer-events: none; /* allow clicks through */
  overflow: hidden;
  --flake-color: rgba(255,255,255,0.9);
}

/* Base style for each flake */
.flake {
  position: absolute;
  top: -10vh; /* start slightly above viewport */
  left: 50%;
  display: block;
  width: 8px;
  height: 8px;
  background: var(--flake-color);
  border-radius: 50%;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.08));
  opacity: 0.9;
  transform: translate3d(-50%, 0, 0) scale(1);
  will-change: transform, opacity;
  animation-name: fall, sway, fade;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

/* Keyframes
   - fall: moves flake from top to bottom
   - sway: horizontal sinus-like movement using translateX
   - fade: gentle opacity change so flakes appear/disappear
*/
@keyframes fall {
  0% { transform: translate3d(var(--start-x, -50%), -10vh, 0) scale(var(--scale,1)); }
  100% { transform: translate3d(var(--end-x, 0%), 110vh, 0) scale(var(--scale,1)); }
}

@keyframes sway {
  0% { transform: translateX(0px); }
  50% { transform: translateX(var(--sway, 30px)); }
  100% { transform: translateX(0px); }
}

@keyframes fade {
  0% { opacity: 0.0; }
  10% { opacity: 0.9; }
  90% { opacity: 0.9; }
  100% { opacity: 0.0; }
}

/* Use nth-child selectors to vary every flake slightly to simulate randomness
   We set variables per flake for: horizontal start (--start-x), horizontal end offset (--end-x),
   fall duration, delay, scale, and sway amplitude.
*/
.flake:nth-child(1)  { left: 2%;  --end-x: 10vw;  --sway: 8px;  --scale: .7;  animation-duration: 9s;  animation-delay: 0s; }
.flake:nth-child(2)  { left: 6%;  --end-x: -8vw;  --sway: 18px; --scale: .9;  animation-duration: 12s; animation-delay: 1s; }
.flake:nth-child(3)  { left: 10%; --end-x: 6vw;   --sway: 24px; --scale: .6;  animation-duration: 14s; animation-delay: -2s; }
.flake:nth-child(4)  { left: 14%; --end-x: -12vw; --sway: 28px; --scale: 1.1; animation-duration: 11s; animation-delay: 0.6s; }
.flake:nth-child(5)  { left: 18%; --end-x: 8vw;   --sway: 10px; --scale: .8;  animation-duration: 10s; animation-delay: -1s; }
.flake:nth-child(6)  { left: 22%; --end-x: -6vw;  --sway: 22px; --scale: .5;  animation-duration: 16s; animation-delay: 2s; }
.flake:nth-child(7)  { left: 26%; --end-x: 12vw;  --sway: 12px; --scale: .95; animation-duration: 13s; animation-delay: -3s; }
.flake:nth-child(8)  { left: 30%; --end-x: -4vw;  --sway: 30px; --scale: .6;  animation-duration: 18s; animation-delay: 0.2s; }
.flake:nth-child(9)  { left: 34%; --end-x: 6vw;   --sway: 14px; --scale: .75; animation-duration: 12.5s; animation-delay: -0.5s; }
.flake:nth-child(10) { left: 38%; --end-x: -10vw; --sway: 20px; --scale: .85; animation-duration: 15s; animation-delay: 1.2s; }
.flake:nth-child(11) { left: 42%; --end-x: 10vw;  --sway: 26px; --scale: .5;  animation-duration: 9.5s; animation-delay: -2.2s; }
.flake:nth-child(12) { left: 46%; --end-x: -8vw;  --sway: 8px;  --scale: 1.05;animation-duration: 11.4s; animation-delay: 0.8s; }
.flake:nth-child(13) { left: 50%; --end-x: 5vw;   --sway: 16px; --scale: .9;  animation-duration: 13.2s; animation-delay: -1.1s; }
.flake:nth-child(14) { left: 54%; --end-x: -6vw;  --sway: 22px; --scale: .7;  animation-duration: 17s; animation-delay: 0.4s; }
.flake:nth-child(15) { left: 58%; --end-x: 8vw;   --sway: 20px; --scale: .6;  animation-duration: 12.8s; animation-delay: -0.3s; }
.flake:nth-child(16) { left: 62%; --end-x: -12vw; --sway: 28px; --scale: 1.2; animation-duration: 14.6s; animation-delay: 2.1s; }
.flake:nth-child(17) { left: 66%; --end-x: 6vw;   --sway: 10px; --scale: .8;  animation-duration: 10.9s; animation-delay: -1.8s; }
.flake:nth-child(18) { left: 70%; --end-x: -4vw;  --sway: 18px; --scale: .65; animation-duration: 16.3s; animation-delay: 0.9s; }
.flake:nth-child(19) { left: 74%; --end-x: 12vw;  --sway: 24px; --scale: .9;  animation-duration: 13.7s; animation-delay: -0.6s; }
.flake:nth-child(20) { left: 78%; --end-x: -10vw; --sway: 32px; --scale: .55; animation-duration: 19s; animation-delay: 1.7s; }
.flake:nth-child(21) { left: 82%; --end-x: 8vw;   --sway: 14px; --scale: .85; animation-duration: 11.1s; animation-delay: -2.5s; }
.flake:nth-child(22) { left: 86%; --end-x: -6vw;  --sway: 20px; --scale: .7;  animation-duration: 15.4s; animation-delay: 0.5s; }
.flake:nth-child(23) { left: 90%; --end-x: 6vw;   --sway: 26px; --scale: .95; animation-duration: 14.2s; animation-delay: -1.3s; }
.flake:nth-child(24) { left: 94%; --end-x: -8vw;  --sway: 12px; --scale: .6;  animation-duration: 12.6s; animation-delay: 0.3s; }
.flake:nth-child(25) { left: 4%;  --end-x: -12vw; --sway: 22px; --scale: .8;  animation-duration: 10.7s; animation-delay: -0.9s; }
.flake:nth-child(26) { left: 12%; --end-x: 6vw;   --sway: 16px; --scale: .6;  animation-duration: 13.9s; animation-delay: 1.1s; }
.flake:nth-child(27) { left: 20%; --end-x: -4vw;  --sway: 30px; --scale: 1.0; animation-duration: 17.2s; animation-delay: -2.8s; }
.flake:nth-child(28) { left: 28%; --end-x: 10vw;  --sway: 18px; --scale: .7;  animation-duration: 12.3s; animation-delay: 0.6s; }
.flake:nth-child(29) { left: 36%; --end-x: -6vw;  --sway: 24px; --scale: .9;  animation-duration: 15.8s; animation-delay: -0.4s; }
.flake:nth-child(30) { left: 44%; --end-x: 8vw;   --sway: 14px; --scale: .5;  animation-duration: 11.9s; animation-delay: 2.4s; }
.flake:nth-child(31) { left: 52%; --end-x: -10vw; --sway: 20px; --scale: .8;  animation-duration: 13.0s; animation-delay: -1.6s; }
.flake:nth-child(32) { left: 60%; --end-x: 6vw;   --sway: 28px; --scale: 1.1; animation-duration: 16.7s; animation-delay: 0.9s; }
.flake:nth-child(33) { left: 68%; --end-x: -4vw;  --sway: 12px; --scale: .6;  animation-duration: 14.9s; animation-delay: -0.2s; }
.flake:nth-child(34) { left: 76%; --end-x: 12vw;  --sway: 30px; --scale: .95; animation-duration: 18.1s; animation-delay: 1.5s; }
.flake:nth-child(35) { left: 84%; --end-x: -8vw;  --sway: 16px; --scale: .7;  animation-duration: 12.2s; animation-delay: -2.1s; }
.flake:nth-child(36) { left: 92%; --end-x: 6vw;   --sway: 22px; --scale: .55; animation-duration: 15.6s; animation-delay: 0.2s; }
.flake:nth-child(37) { left: 16%; --end-x: -6vw;  --sway: 26px; --scale: .9;  animation-duration: 13.3s; animation-delay: -0.7s; }
.flake:nth-child(38) { left: 24%; --end-x: 8vw;   --sway: 10px; --scale: .6;  animation-duration: 11.7s; animation-delay: 0.1s; }
.flake:nth-child(39) { left: 32%; --end-x: -12vw; --sway: 18px; --scale: 1.05;animation-duration: 17.6s; animation-delay: -1.9s; }
.flake:nth-child(40) { left: 40%; --end-x: 10vw;  --sway: 24px; --scale: .8;  animation-duration: 14.4s; animation-delay: 0.7s; }

/* Compose animations: fall handles vertical + horizontal via CSS vars; apply sway by layering with animation shorthand
   We overlay sway by using animation for transform as well; to avoid conflicts we encode sway using transform translateX via a nested pseudo element.
*/
.flake::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  animation-name: sway;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-duration: calc(var(--sway-duration, 3s) + (var(--scale) * 2s));
  opacity: 0.95;
}

/* To ensure fall animation controls final vertical position and base horizontal offsets
   we set the fall animation on the element itself; for horizontal drift we rely on start/end x variables
*/
.flake { animation-name: fall, fade; animation-duration: var(--duration, 12s), var(--duration, 12s); animation-delay: var(--delay, 0s), var(--delay, 0s); }

/* Performance tweak for reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  .flake, .flake::before {
    animation: none !important;
    opacity: 0.9;
  }
}

</style>
