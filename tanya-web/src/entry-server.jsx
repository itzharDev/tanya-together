import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, Route, Routes, Navigate } from 'react-router-dom'
import Parse from 'parse/node.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { SSRProvider } from './context/SSRContext.jsx'
import Login from './pages/Login.jsx'
import Feed from './pages/Feed.jsx'
import Reader from './pages/Reader.jsx'
import App from './App.jsx'

// Initialize Parse for SSR
// Use internal Docker network URL or environment variable
Parse.initialize('480c8e46-1901-44ab-9b6c-b00d0e3c3416', 'smsLaravMyMasterKey')
Parse.serverURL = process.env.PARSE_SERVER_URL || 'http://tanya:3001/parse'
console.log('SSR: Using Parse Server URL:', Parse.serverURL)

export async function render(url) {
  try {
    // Extract groupId from URL if it's a group route
    const groupMatch = url.match(/\/group\/([a-zA-Z0-9]+)/)
    let initialData = null

    if (groupMatch) {
      const groupId = groupMatch[1]
      try {
        console.log('SSR: Fetching group data for:', groupId)
        const query = new Parse.Query('NewGroup')
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
        
        const group = await Promise.race([
          query.get(groupId),
          timeoutPromise
        ])

        initialData = {
          id: group.id,
          name: group.get('name'),
          description: group.get('description') || null,
          bookImage: group.get('bookImage') || null,
        }
        console.log('SSR: Successfully fetched group:', initialData.name)
      } catch (error) {
        console.error('SSR: Failed to fetch group data:', error.message)
        console.error('SSR: Parse Server URL:', Parse.serverURL)
        // Don't throw error - allow SSR to continue without initial data
        // The client-side will load the data when it mounts
      }
    }

    // Import AppContent to avoid BrowserRouter
    const { default: App } = await import('./App.jsx')
    
    // Get the Routes from App by rendering AppContent with StaticRouter
    // We need to render the routes without BrowserRouter
    const html = renderToString(
      <SSRProvider data={initialData}>
        <AuthProvider>
          <StaticRouter location={url}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/feed" element={
                <SocketProvider>
                  <Feed />
                </SocketProvider>
              } />
              <Route path="/group/:groupId" element={<Reader />} />
              <Route path="/" element={<Navigate to="/feed" replace />} />
              <Route path="*" element={<Navigate to="/feed" replace />} />
            </Routes>
          </StaticRouter>
        </AuthProvider>
      </SSRProvider>
    )

    return { html, initialData }
  } catch (error) {
    console.error('SSR render error:', error)
    // Return empty html instead of throwing to prevent server crashes
    return { html: '<div>Loading...</div>', initialData: null }
  }
}
