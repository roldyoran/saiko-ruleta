<script setup lang="ts">
// import { RouterLink } from 'vue-router'
import { h, defineComponent } from 'vue'
import { Play, Image, List, Dices } from '@lucide/vue'

const InstagramIcon = defineComponent({
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
      h('path', { d: 'M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8' }),
      h('path', { d: 'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' }),
      h('path', { d: 'M16.5 7.5v.01' })
    ])
  }
})
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
  href?: string
  to?: string
  ariaLabel: string
  icon: any
  targetBlank?: boolean
  iconClass?: string
  tooltip?: string // tooltip text (falls back to ariaLabel)
}

const props = withDefaults(
  defineProps<{
    items?: NavItem[]
    class?: string
  }>(),
  {},
)

const defaultItems: NavItem[] = [
  {
    href: 'https://www.instagram.com/roldyoran',
    ariaLabel: 'Instagram',
    icon: InstagramIcon,
    targetBlank: true,
    iconClass: 'text-rose-500 w-6 h-6',
    tooltip: 'Ver Instagram',
  },
  //   { ariaLabel: 'Play music', icon: Play, iconClass: 'text-cyan-500 w-6 h-6', tooltip: 'Reproducir música' },
  {
    to: '/gallery',
    ariaLabel: 'Galería',
    icon: Image,
    iconClass: 'hover:text-purple-400 w-6 h-6',
    tooltip: 'Ver galería',
  },
  {
    to: '/animelist',
    ariaLabel: 'Animes vistos',
    icon: List,
    iconClass: 'hover:text-orange-400 w-6 h-6',
    tooltip: 'Lista de animes',
  },
  {
    to: '/bingo',
    ariaLabel: 'Bingo',
    icon: Dices,
    iconClass: 'hover:text-emerald-500 w-6 h-6',
    tooltip: 'Jugar bingo',
  },
]

const items = props.items || defaultItems
</script>

<template>
  <TooltipProvider>
    <div :class="['flex flex-col space-y-6', props.class]">
      <template v-for="(item, idx) in items" :key="idx">
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="inline-flex items-center justify-center transition-all hover:scale-125"
              :aria-label="item.ariaLabel"
            >
              <component :is="item.icon" :class="item.iconClass || 'w-6 h-6 text-current'" />
            </NuxtLink>

            <a
              v-else-if="item.href"
              :href="item.href"
              :target="item.targetBlank ? '_blank' : undefined"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center transition-all hover:scale-125"
              :aria-label="item.ariaLabel"
            >
              <component :is="item.icon" :class="item.iconClass || 'w-6 h-6 text-current'" />
            </a>

            <button
              v-else
              class="inline-flex items-center justify-center transition-all hover:scale-125 bg-transparent border-0 p-0"
              :aria-label="item.ariaLabel"
            >
              <component :is="item.icon" :class="item.iconClass || 'w-6 h-6 text-current'" />
            </button>
          </TooltipTrigger>

          <TooltipContent side="right" class="opacity-95">
            {{ item.tooltip || item.ariaLabel }}
          </TooltipContent>
        </Tooltip>
      </template>
    </div>
  </TooltipProvider>
</template>
