import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const CONNECT_SRC = /connect-src 'self' [^\s;"]+/

export function htaccessWithApiOrigin(template: string, apiUrl: string | undefined): string {
  if (!apiUrl) {
    throw new Error('VITE_API_BASE_URL is not set, cannot build connect-src for dist/.htaccess')
  }
  const origin = new URL(apiUrl).origin
  if (!CONNECT_SRC.test(template)) {
    throw new Error(".htaccess has no \"connect-src 'self' <origin>\" directive to update")
  }
  return template.replace(CONNECT_SRC, `connect-src 'self' ${origin}`)
}

function htaccessCsp(apiUrl: string | undefined): Plugin {
  return {
    name: 'htaccess-csp',
    apply: 'build',
    closeBundle() {
      const template = fs.readFileSync(path.resolve(__dirname, '.htaccess'), 'utf8')
      const outDir = path.resolve(__dirname, 'dist')
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessWithApiOrigin(template, apiUrl), 'utf8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  return {
    plugins: [react(), htaccessCsp(env.VITE_API_BASE_URL)],
    build: {
      assetsInlineLimit: (file: string) => (/\.(woff2?|ttf|otf|eot)$/i.test(file) ? false : undefined),
    },
  }
})
