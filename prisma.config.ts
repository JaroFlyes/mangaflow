import path from 'node:path'
import { defineConfig } from 'prisma/config'

const DIRECT_URL =
  process.env.DIRECT_URL ??
  (() => { throw new Error('DIRECT_URL n\u00e3o encontrada. Verifique seu .env') })()

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    datasourceUrl: DIRECT_URL,
  },
})
