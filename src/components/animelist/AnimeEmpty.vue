<script setup lang="ts">
import { Info, Rocket } from 'lucide-vue-next'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
</script>

<template>
  <div class="my-20 items-center gap-4 px-4">

    <Alert class="mx-auto max-w-xl">
      <Info class="h-4 w-4" />
      <AlertTitle>No se encontraron animes</AlertTitle>
      <AlertDescription>Prueba con otros filtros o ajusta la búsqueda para ver resultados.</AlertDescription>
    </Alert>
  </div>
</template>
