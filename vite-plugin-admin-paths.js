import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PATH_JSON = path.resolve(__dirname, 'src/assets/4-concrete-route-map/path.json')

async function readPaths() {
  const raw = await fs.readFile(PATH_JSON, 'utf8')
  return JSON.parse(raw)
}

async function writePaths(data) {
  const formatted = `${JSON.stringify(data, null, 4)}\n`
  await fs.writeFile(PATH_JSON, formatted, 'utf8')
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function adminPathsPlugin() {
  return {
    name: 'admin-paths',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/admin/paths')) {
          next()
          return
        }

        try {
          if (req.method === 'GET') {
            const data = await readPaths()
            sendJson(res, 200, data)
            return
          }

          if (req.method === 'PUT') {
            const body = await readBody(req)
            const data = JSON.parse(body)

            if (!data || !Array.isArray(data.paths)) {
              sendJson(res, 400, { error: 'Expected { paths: [...] }' })
              return
            }

            await writePaths({ paths: data.paths })
            sendJson(res, 200, { ok: true, paths: data.paths })
            return
          }

          sendJson(res, 405, { error: 'Method not allowed' })
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })
    },
  }
}
