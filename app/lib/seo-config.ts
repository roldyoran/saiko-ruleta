// Configuración centralizada de metadatos y SEO para la aplicación
export const siteConfig = {
    name: 'Saiko Ruleta',
    description: 'Aplicación de ruleta interactiva, bingo y más juegos divertidos para streamers y comunidades.',
    url: 'https://saiko-ruleta.vercel.app',
    keywords: [
        'ruleta',
        'bingo',
        'juegos',
        'streaming',
        'interactivo',
        'sorteo',
        'entretenimiento',
        'comunidad'
    ],
    author: '@roldyoran',
    social: {
        twitter: '@roldyoran',
        instagram: '@roldyoran',
    },
    images: {
        og: '/og-image.jpg',
        logo: '/logo.png',
        favicon: '/favicon.ico'
    }
}

// Configuración específica por página
export const pageConfigs = {
    home: {
        title: 'Inicio',
        description: 'Ruleta interactiva para sorteos y entretenimiento. Perfecto para streamers y comunidades.',
        keywords: ['ruleta', 'sorteo', 'streaming', 'juegos', 'entretenimiento']
    },
    bingo: {
        title: 'Bingo',
        description: 'Crea y juega bingo personalizado con opciones personalizables. Perfecto para eventos y entretenimiento.',
        keywords: ['bingo', 'juego', 'personalizable', 'entretenimiento', 'sorteo']
    },
    gallery: {
        title: 'Galería',
        description: 'Explora nuestra galería de imágenes organizadas por temporadas y creadores.',
        keywords: ['galería', 'imágenes', 'fotos', 'temporadas', 'colección']
    },
    animelist: {
        title: 'Lista de Animes',
        description: 'Explora nuestra colección completa de animes vistos con filtros y búsqueda avanzada.',
        keywords: ['anime', 'lista', 'manga', 'otaku', 'entretenimiento', 'series']
    }
}

// Función helper para obtener configuración de página
export function getPageConfig(page: keyof typeof pageConfigs) {
    return pageConfigs[page]
}

// Función para generar JSON-LD estructurado
export function generateJsonLd(type: 'website' | 'organization' | 'webapp' = 'website') {
    const baseSchema = {
        '@context': 'https://schema.org',
        '@type': type === 'webapp' ? 'WebApplication' : 'WebSite',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        author: {
            '@type': 'website',
            name: siteConfig.author
        }
    }

    if (type === 'webapp') {
        return {
            ...baseSchema,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web Browser',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
            }
        }
    }

    return baseSchema
}