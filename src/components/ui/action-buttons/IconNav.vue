<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Instagram, Play, Image, List, Dice1 } from 'lucide-vue-next'
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
  {}
)

const defaultItems: NavItem[] = [
  { href: 'https://www.instagram.com/roldyoran', ariaLabel: 'Instagram', icon: Instagram, targetBlank: true, iconClass: 'text-rose-500 w-6 h-6', tooltip: 'Ver Instagram' },
//   { ariaLabel: 'Play music', icon: Play, iconClass: 'text-cyan-500 w-6 h-6', tooltip: 'Reproducir música' },
  { to: '/galeria', ariaLabel: 'Galería', icon: Image, iconClass: 'text-purple-400 w-6 h-6', tooltip: 'Ver galería' },
  { to: '/animelist', ariaLabel: 'Animes vistos', icon: List, iconClass: 'text-orange-400 w-6 h-6', tooltip: 'Lista de animes' },
  { to: '/bingo', ariaLabel: 'Bingo', icon: Dice1, iconClass: 'text-emerald-500 w-6 h-6', tooltip: 'Jugar bingo' },
]

const items = props.items || defaultItems
</script>

<template>
  <TooltipProvider>
    <div :class="['flex flex-col space-y-6', props.class]">
      <template v-for="(item, idx) in items" :key="idx">
        <Tooltip>
          <TooltipTrigger as-child>
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="inline-flex items-center justify-center transition-transform hover:scale-125"
              :aria-label="item.ariaLabel"
            >
              <component
                :is="item.icon"
                :class="item.iconClass || 'w-6 h-6 text-current'"
              />
            </RouterLink>
            
            <a
              v-else-if="item.href"
              :href="item.href"
              :target="item.targetBlank ? '_blank' : undefined"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center transition-transform hover:scale-125"
              :aria-label="item.ariaLabel"
            >
              <component
                :is="item.icon"
                :class="item.iconClass || 'w-6 h-6 text-current'"
              />
            </a>
            
            <button
              v-else
              class="inline-flex items-center justify-center transition-transform hover:scale-125 bg-transparent border-0 p-0"
              :aria-label="item.ariaLabel"
            >
              <component
                :is="item.icon"
                :class="item.iconClass || 'w-6 h-6 text-current'"
              />
            </button>
          </TooltipTrigger>
          
          <TooltipContent side="right" class="opacity-90">
            {{ item.tooltip || item.ariaLabel }}
          </TooltipContent>
        </Tooltip>
      </template>
    </div>
  </TooltipProvider>
</template>
