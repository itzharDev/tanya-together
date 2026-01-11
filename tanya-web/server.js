import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod'
const port = process.env.PORT || 5173

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
      let title, description, image
      
      if (initialData && initialData.name) {
        title = `ספר ${initialData.name} - תניא המחולק`
        description = `קרא את ספר ${initialData.name} - תניא המחולק`
        image = initialData.bookImage || 'https://tanya-together.dvarmalchus.co.il/tanya-logo-preview.png'
      } else {
        // Default meta tags for non-group pages
        title = 'תניא המחולק'
        description = 'קרא והשלם ספרים בקבוצה'
        image = 'https://tanya-together.dvarmalchus.co.il/tanya-logo-preview.png'
      }
      
      const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${escapeHtml(title)}" />
    <meta property="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta property="twitter:image" content="${escapeHtml(image)}" />` : ''}`

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
