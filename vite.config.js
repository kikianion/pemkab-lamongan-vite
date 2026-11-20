import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

function terminalTitlePlugin() {
  const setTitle = (title) => {
    // OSC 2 (Set window title) escape sequence supported across Windows Terminal, PowerShell, CMD, Mintty, etc.
    process.stdout.write(`\x1b]2;${title}\x07`)
  }

  return {
    name: 'vite-terminal-title',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer.address()
        const port = typeof address === 'object' && address ? address.port : (server.config.server.port || 5173)
        const projectName = pkg.name || 'vite-project'
        setTitle(`${projectName} : ${port}`)
      })
    },
    configurePreviewServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer.address()
        const port = typeof address === 'object' && address ? address.port : (server.config.preview.port || 4173)
        const projectName = pkg.name || 'vite-project'
        setTitle(`${projectName} : ${port}`)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), terminalTitlePlugin()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

