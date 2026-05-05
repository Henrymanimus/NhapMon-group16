import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

const disableTailwind = process.env.DISABLE_TAILWIND === '1'

export default defineConfig(async () => {
  const plugins = [react()]

  if (!disableTailwind) {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    plugins.push(tailwindcss())
  }

  return {
    plugins,
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
