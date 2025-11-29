import { promises as fs } from 'fs'
import path from 'path'

export async function readJson<T = any>(relPath: string): Promise<T | null> {
  const filePath = path.join(process.cwd(), relPath)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function writeJson<T = any>(relPath: string, data: T) {
  const filePath = path.join(process.cwd(), relPath)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}