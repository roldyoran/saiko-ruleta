# Sistema Centralizado de Metadatos para SEO

Este sistema proporciona una solución completa para manejar metadatos de SEO, Open Graph y Twitter Cards de forma centralizada en tu aplicación Nuxt 3.

## 🚀 Características

- ✅ Metadatos centralizados y reutilizables
- ✅ Auto-configuración de Open Graph y Twitter Cards
- ✅ Soporte para JSON-LD estructurado
- ✅ Títulos y descripciones dinámicas
- ✅ URLs canónicas automáticas
- ✅ Configuración específica por página
- ✅ Funciones helper para casos avanzados

## 📁 Estructura del Sistema

```
app/
├── composables/
│   └── useAppMeta.ts          # Composable principal
├── lib/
│   └── seo-config.ts          # Configuración centralizada
└── pages/                     # Páginas con metadatos aplicados
    ├── index.vue             # Ejemplo: Página de inicio
    ├── bingo.vue             # Ejemplo: Página de bingo
    ├── gallery.vue           # Ejemplo: Galería
    └── animelist.vue         # Ejemplo: Lista de animes
```

## 1. USO BÁSICO EN UNA PÁGINA

```vue
<script setup>
// Configuración básica de metadatos
const { updateMeta } = useAppMeta({
  title: 'Mi Página',
  description: 'Descripción específica de esta página',
  keywords: ['palabra1', 'palabra2', 'palabra3'],
  type: 'website'
});
</script>
```

## 2. USO DINÁMICO CON PARÁMETROS DE RUTA

```vue
<script setup>
const route = useRoute()
const { updateMeta } = useAppMeta()

// Actualizar metadatos cuando cambien los parámetros
watch(() => route.params.id, (newId) => {
  updateMeta({
    title: `Elemento ${newId}`,
    description: `Detalles del elemento ${newId}`,
    url: `/elemento/${newId}`
  })
}, { immediate: true })
</script>
```

## 3. USO CON DATOS ASYNC

```vue
<script setup>
const { data: post } = await $fetch(`/api/posts/${route.params.id}`)

const { updateMeta } = useAppMeta({
  title: post.title,
  description: post.excerpt,
  image: post.featured_image,
  keywords: post.tags,
  type: 'article'
});
</script>
```

## 4. METADATOS ESPECÍFICOS POR TIPO DE CONTENIDO

```javascript
// Página de producto
useAppMeta({
  title: 'Nombre del Producto',
  description: 'Descripción del producto',
  type: 'product',
  image: '/producto-imagen.jpg'
});

// Página de artículo/blog
useAppMeta({
  title: 'Título del Artículo',
  description: 'Resumen del artículo',
  type: 'article',
  author: 'Nombre del Autor',
  keywords: ['blog', 'artículo', 'contenido']
});
```

## 5. PERSONALIZACIÓN COMPLETA

```javascript
const { defaults, buildTitle, buildUrl } = useAppMeta()

// Usar las funciones helper
const customTitle = buildTitle('Mi Página Custom')
const fullUrl = buildUrl('/mi-ruta-especial')
```

## ⚙️ Configuración Inicial

### 1. Configurar dominio y imágenes

Edita `app/lib/seo-config.ts` para ajustar tu configuración:

```typescript
export const siteConfig = {
  name: 'Tu Sitio Web',
  description: 'Descripción de tu sitio web',
  url: 'https://tu-dominio.com', // ⚠️ CAMBIAR por tu dominio real
  // ... resto de configuración
}
```

### 2. Crear imágenes Open Graph

Crea estas imágenes en la carpeta `public/`:

- `/og-image.jpg` (1200x630px) - Imagen principal para redes sociales
- `/favicon.ico` - Favicon del sitio
- `/apple-touch-icon.png` (180x180px) - Ícono para dispositivos Apple

### 3. Verificar metadatos globales

Los metadatos base se configuran automáticamente en `nuxt.config.ts`.

## 🔍 Testing y Validación

### Herramientas recomendadas:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

### Ver metadatos en desarrollo:
```bash
# Inspeccionar el <head> en DevTools
# Buscar por: meta, og:, twitter:, application/ld+json
```

## 📚 NOTAS IMPORTANTES

1. **Importación requerida**: Como el auto-import está deshabilitado, importa manualmente:
   ```typescript
   import { useAppMeta } from '@/composables/useAppMeta'
   ```

2. **Llamada en setup**: El composable debe llamarse en el `<script setup>` de cada página

3. **Metadatos automáticos**: Se aplican usando `useHead` internamente

4. **Sobrescritura dinámica**: Usa `updateMeta()` para cambios durante la ejecución

5. **Configuración global**: Para metadatos que no cambian, úsalos en `nuxt.config.ts`

6. **Contenido dinámico**: Usa `watch()` para actualizar cuando cambien los datos

7. **JSON-LD**: Se genera automáticamente para mejorar SEO estructurado