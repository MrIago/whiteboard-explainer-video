// Cria um projeto de vídeo a partir do modelo e instala as dependências.
//   node new-project.mjs <pasta>

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const target = process.argv[2]
if (!target) { console.error('uso: node new-project.mjs <pasta>'); process.exit(1) }
const dir = path.resolve(target)
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`a pasta já tem arquivos: ${dir}`); process.exit(1) }

for (const bin of ['node', 'npm', 'ffmpeg', 'ffprobe']) {
    try { execFileSync(bin, bin === 'ffmpeg' || bin === 'ffprobe' ? ['-version'] : ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' }) }
    catch { console.error(`falta instalar: ${bin}`); process.exit(1) }
}

const template = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'template')
fs.cpSync(template, dir, { recursive: true })
execFileSync('npm', ['install', '--no-fund', '--no-audit'], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' })
console.log(`✓ projeto em ${dir}`)
