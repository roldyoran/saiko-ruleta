<template>
  <main class="flex h-screen items-center justify-center p-6">
    <Card class="w-full max-w-lg">
      <div class="flex flex-col items-center gap-4 p-6 text-center">
        <AlertCircle class="h-16 w-16 text-destructive" />
        <CardTitle class="text-2xl">Página no encontrada</CardTitle>
        <CardDescription class="text-sm text-muted-foreground max-w-md">
          Lo sentimos — la ruta que intentas acceder no existe o fue movida.
        </CardDescription>

        <div class="mt-4 flex gap-3">
          <RouterLink to="/">
            <Button>Ir al inicio</Button>
          </RouterLink>
          <!-- <RouterLink to="/help"> 
            <Button variant="outline">Ayuda</Button>
          </RouterLink> -->
        </div>
      </div>
    </Card>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-vue-next'
</script>
