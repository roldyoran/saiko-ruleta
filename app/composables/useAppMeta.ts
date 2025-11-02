import { useHead, useRoute } from '#imports'
import { siteConfig, generateJsonLd } from '@/lib/seo-config'

interface PageMetadata {
    title?: string
    description?: string
    keywords?: string[]
    image?: string
    url?: string
    type?: string
    siteName?: string
    twitterCard?: string
    author?: string
}

interface MetaDefaults {
    siteName: string
    description: string
    keywords: string[]
    image: string
    domain: string
    twitterCard: string
    author: string
    locale: string
}

/**
 * Composable centralizado para manejar metadatos de la aplicación
 * Proporciona una configuración unificada para SEO y Open Graph
 */
export const useAppMeta = (pageMetadata: PageMetadata = {}) => {
    // Configuración por defecto de la aplicación (usando siteConfig centralizado)
    const defaults: MetaDefaults = {
        siteName: siteConfig.name,
        description: siteConfig.description,
        keywords: siteConfig.keywords,
        image: siteConfig.images.og,
        domain: siteConfig.url,
        twitterCard: 'summary_large_image',
        author: siteConfig.author,
        locale: 'es_ES'
    }    // Función para construir URL completa
    const buildUrl = (path?: string) => {
        const route = useRoute()
        const currentPath = path || route.path
        return `${defaults.domain}${currentPath}`
    }

    // Función para construir título completo
    const buildTitle = (pageTitle?: string) => {
        if (!pageTitle) return defaults.siteName
        return `${pageTitle} | ${defaults.siteName}`
    }

    // Función para combinar keywords
    const buildKeywords = (pageKeywords: string[] = []) => {
        return [...defaults.keywords, ...pageKeywords].join(', ')
    }

    // Configurar metadatos usando useHead
    useHead({
        title: buildTitle(pageMetadata.title),
        meta: [
            // Meta básicos
            {
                name: 'description',
                content: pageMetadata.description || defaults.description
            },
            {
                name: 'keywords',
                content: buildKeywords(pageMetadata.keywords)
            },
            {
                name: 'author',
                content: pageMetadata.author || defaults.author
            },
            {
                name: 'robots',
                content: 'index, follow'
            },
            {
                name: 'language',
                content: 'Spanish'
            },

            // Open Graph
            {
                property: 'og:title',
                content: buildTitle(pageMetadata.title)
            },
            {
                property: 'og:description',
                content: pageMetadata.description || defaults.description
            },
            {
                property: 'og:type',
                content: pageMetadata.type || 'website'
            },
            {
                property: 'og:url',
                content: buildUrl(pageMetadata.url)
            },
            {
                property: 'og:image',
                content: pageMetadata.image || defaults.image
            },
            {
                property: 'og:site_name',
                content: pageMetadata.siteName || defaults.siteName
            },
            {
                property: 'og:locale',
                content: defaults.locale
            },

            // Twitter Card
            {
                name: 'twitter:card',
                content: pageMetadata.twitterCard || defaults.twitterCard
            },
            {
                name: 'twitter:title',
                content: buildTitle(pageMetadata.title)
            },
            {
                name: 'twitter:description',
                content: pageMetadata.description || defaults.description
            },
            {
                name: 'twitter:image',
                content: pageMetadata.image || defaults.image
            },

            // Viewport y móvil
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                name: 'theme-color',
                content: '#e11d48' // Color rosa de tu tema
            }
        ],

        // Links adicionales
        link: [
            {
                rel: 'canonical',
                href: buildUrl(pageMetadata.url)
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.ico'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/apple-touch-icon.png'
            }
        ],

        // JSON-LD estructurado
        script: [
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify(generateJsonLd(pageMetadata.type === 'website' ? 'webapp' : 'website'))
            }
        ]
    })    // Función para actualizar metadatos dinámicamente
    const updateMeta = (newMetadata: Partial<PageMetadata>) => {
        useHead({
            title: buildTitle(newMetadata.title),
            meta: [
                {
                    name: 'description',
                    content: newMetadata.description || defaults.description
                },
                {
                    property: 'og:title',
                    content: buildTitle(newMetadata.title)
                },
                {
                    property: 'og:description',
                    content: newMetadata.description || defaults.description
                },
                {
                    property: 'og:url',
                    content: buildUrl(newMetadata.url)
                }
            ]
        })
    }

    return {
        defaults,
        buildTitle,
        buildUrl,
        buildKeywords,
        updateMeta
    }
}