<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <!-- <header>
    <div class="wrapper">
      <nav>
        <Button as-child>
          <RouterLink to="/">Home</RouterLink>
        </Button>
        <Button as-child>
          <RouterLink to="/galeria">About</RouterLink>
        </Button>
        <Button as-child>
          <RouterLink to="/animelist">AnimeList</RouterLink>
        </Button>
        <Button as-child>
          <RouterLink to="/bingo">Bingo</RouterLink>
        </Button>
        
      </nav>
    </div>
  </header> -->

  <RouterView />
  <Toaster class="pointer-events-auto" />
</template>
