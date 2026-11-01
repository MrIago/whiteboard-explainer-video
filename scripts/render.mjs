// Render final: vídeo em out/video.mp4, com o master de áudio nivelado em -15,5 LUFS.
//   node render.mjs <projeto>                  o vídeo inteiro
//   node render.mjs <projeto> --frames=0-299   um pedaço, sem master, em out/test.mp4
// No Linux usa --gl=angle-egl: com outros modos, pedaços do quadro saíram duplicados no render
// sequencial. Mude com GL=<modo> (angle, vulkan, swangle...). Confira sempre com qa.mjs sheet.

import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const [proj, ...rest] = process.argv.slice(2)
if (!proj) { console.error('uso: node render.mjs <projeto> [--frames=a-b]'); process.exit(1) }
const P = path.resolve(proj)
const partial = rest.some((a) => a.startsWith('--frames'))
const gl = process.env.GL ?? (process.platform === 'linux' ? 'angle-egl' : '')
const out = `${P}/out/${partial ? 'test' : 'raw'}.mp4`
fs.mkdirSync(`${P}/out`, { recursive: true })

execFileSync('npx', ['remotion', 'render', 'src/index.ts', 'Whiteboard', out,
    `--concurrency=${Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2)))}`,
    ...(gl ? [`--gl=${gl}`] : []), ...rest], { cwd: P, stdio: 'inherit', shell: process.platform === 'win32' })

if (partial) { console.log(`✓ ${out}`); process.exit(0) }
const final = `${P}/out/video.mp4`
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-c:v', 'copy', '-af', 'loudnorm=I=-15.5:TP=-2:LRA=11,alimiter=limit=0.8:level=false', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final])
fs.rmSync(out)
console.log(`✓ ${final}`)
