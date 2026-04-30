import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config()

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter(env) {
      const { Pool } = await import('pg')
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const connectionString = env.DIRECT_URL ?? process.env.DIRECT_URL
      if (!connectionString) {
        throw new Error('DIRECT_URL n\u00e3o encontrada no .env')
      }
      const pool = new Pool({ connectionString })
      return new PrismaPg(pool)
    },
  },
})
