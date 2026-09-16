import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'postman')
const auth = {
  type: 'bearer',
  bearer: [{ key: 'token', value: '{{access_token}}', type: 'string' }],
}

for (const file of readdirSync(dir)) {
  if (!file.startsWith('Bold-Support-Etapa-') || !file.endsWith('.json')) continue
  if (file === 'Bold-Support-Etapa-4.postman_collection.json') continue
  const path = join(dir, file)
  const collection = JSON.parse(readFileSync(path, 'utf8'))
  collection.auth = auth
  writeFileSync(path, JSON.stringify(collection, null, 2) + '\n', 'utf8')
  console.log(`updated auth: ${file}`)
}
