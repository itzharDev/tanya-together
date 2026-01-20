import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import Parse from 'parse/node.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod'
const port = process.env.PORT || 5173

// Initialize Parse for sitemap generation
Parse.initialize('480c8e46-1901-44ab-9b6c-b00d0e3c3416', 'smsLaravMyMasterKey')
Parse.serverURL = process.env.PARSE_SERVER_URL || 'http://tanya:3001/parse'
console.log('Parse Server URL:', Parse.serverURL)

async function createServer() {
  const app = express()

  let vite
  if (!isProduction) {
    // Create Vite server in middleware mode
    const { createServer: createViteServer } = await import('vite')
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }))
  }

  // Robots.txt endpoint
  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://tanya.dvarmalchus.co.il/sitemap.xml
`
    res.header('Content-Type', 'text/plain')
    res.status(200).send(robotsTxt)
  })

  // Sitemap endpoint
  app.get('/sitemap.xml', async (req, res) => {
    try {
      console.log('Generating sitemap...')
      const query = new Parse.Query('NewGroup')
      query.limit(10000) // Get all groups
      const groups = await query.find()

      const baseUrl = 'https://tanya.dvarmalchus.co.il'
      const now = new Date().toISOString()

      // Build sitemap XML
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

      // Add homepage
      sitemap += '  <url>\n'
      sitemap += `    <loc>${baseUrl}</loc>\n`
      sitemap += `    <lastmod>${now}</lastmod>\n`
      sitemap += '    <changefreq>daily</changefreq>\n'
      sitemap += '    <priority>1.0</priority>\n'
      sitemap += '  </url>\n'

      // Add feed page
      sitemap += '  <url>\n'
      sitemap += `    <loc>${baseUrl}/feed</loc>\n`
      sitemap += `    <lastmod>${now}</lastmod>\n`
      sitemap += '    <changefreq>daily</changefreq>\n'
      sitemap += '    <priority>0.9</priority>\n'
      sitemap += '  </url>\n'

      // Add all groups
      for (const group of groups) {
        const groupId = group.id
        const updatedAt = group.get('updatedAt') || group.get('createdAt')
        const lastmod = updatedAt ? updatedAt.toISOString() : now
        const isGlobal = group.get('global')
        
        sitemap += '  <url>\n'
        sitemap += `    <loc>${baseUrl}/group/${groupId}</loc>\n`
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`
        sitemap += '    <changefreq>weekly</changefreq>\n'
        // Global groups get higher priority
        sitemap += `    <priority>${isGlobal ? '0.8' : '0.6'}</priority>\n`
        sitemap += '  </url>\n'
      }

      sitemap += '</urlset>'

      console.log(`Sitemap generated with ${groups.length} groups`)
      res.header('Content-Type', 'application/xml')
      res.status(200).send(sitemap)
    } catch (error) {
      console.error('Error generating sitemap:', error)
      res.status(500).send('Error generating sitemap')
    }
  })

  // Main handler for all routes (placed before Vite middlewares so it catches everything)
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl || req.url

    try {
      let template
      let render

      if (!isProduction) {
        // Dev: read and transform index.html
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(url, template)
        const { render: serverRender } = await vite.ssrLoadModule('/src/entry-server.jsx')
        render = serverRender
      } else {
        // Production: use pre-built files
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        )
        const { render: serverRender } = await import('./dist/server/entry-server.js')
        render = serverRender
      }

      // Render the app
      const { html, initialData } = await render(url)

      // Build meta tags based on initial data
      let title, description, image, pageUrl
      
      if (initialData && initialData.name) {
        // Determine book type name
        const bookTypeName = initialData.bookType === '2' ? 'תהילים' : (initialData.bookType === '3' ? 'משניות' : 'תניא')
        const bookTypeNamePlural = initialData.bookType === '2' ? 'תהילים' : (initialData.bookType === '3' ? 'משניות' : 'תניא')
        
        title = `${initialData.name} - ${bookTypeName} מחולק`
        description = initialData.description || `למדו ${bookTypeNamePlural} ${initialData.name} - ${bookTypeName} המחולק`
        // Default images are now set in entry-server.jsx, so bookImage should always have a value
        image = initialData.bookImage
        pageUrl = `https://tanya.dvarmalchus.co.il${url}`
      } else {
        // Default meta tags for non-group pages
        title = 'תניא מחולק ותהילים מחולק - לימוד משותף בקבוצות'
        description = 'תניא מחולק ותהילים מחולק - פלטפורמה ללימוד תניא ותהילים משותף בקבוצות. השלימו את התניא והתהילים ביחד עם חברים ומשפחה. קבוצות קריאה קהילתיות לתניא ותהילים.'
        image = 'https://s3.us-east-1.amazonaws.com/DvarMalchus/ads/group-tanya.png'
        pageUrl = 'https://tanya-together.dvarmalchus.co.il'
      }
      
      const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="תניא מחולק ותהילים מחולק" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${escapeHtml(pageUrl)}" />
    <meta property="twitter:title" content="${escapeHtml(title)}" />
    <meta property="twitter:description" content="${escapeHtml(description)}" />
    <meta property="twitter:image" content="${escapeHtml(image)}" />`

      // Inject rendered HTML and updated meta tags
      const finalHtml = template
        .replace('<!--ssr-outlet-->', html)
        .replace('<!--ssr-meta-tags-->', metaTags)
        .replace(
          '<script type="module" src="/src/entry-client.js"></script>',
          '<script type="module" src="/src/entry-client.jsx"></script>'
        )

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e)
      }
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  // Add Vite middlewares for HMR and asset serving (after catch-all)
  if (!isProduction && vite) {
    app.use(vite.middlewares)
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`✓ Server is running at http://0.0.0.0:${port}`)
  })
}

function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

createServer()
