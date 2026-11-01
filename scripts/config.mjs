// Chave de voz. Basta UMA: OPENROUTER_API_KEY (voz e transcrição) ou ELEVENLABS_API_KEY.
// Fica em ~/.config/whiteboard-explainer/.env, fora de qualquer repositório.
//   node config.mjs                       mostra o que está configurado, sem revelar a chave
//   node config.mjs OPENROUTER_API_KEY=…  salva

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DIR = path.join(os.homedir(), '.config', 'whiteboard-explainer')
const FILE = path.join(DIR, '.env')
export const KEYS = ['OPENROUTER_API_KEY', 'ELEVENLABS_API_KEY']

function readFile() {
    if (!fs.existsSync(FILE)) return {}
    return Object.fromEntries(fs.readFileSync(FILE, 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }))
}

export const get = (name) => process.env[name] || readFile()[name] || ''

/** Qual provedor usar: o pedido, ou o primeiro que tiver chave. */
export function provider(wanted) {
    if (wanted) {
        const key = wanted === 'elevenlabs' ? get('ELEVENLABS_API_KEY') : get('OPENROUTER_API_KEY')
        if (!key) throw new Error(`falta a chave de ${wanted}: node scripts/config.mjs ${wanted === 'elevenlabs' ? 'ELEVENLABS_API_KEY' : 'OPENROUTER_API_KEY'}=...`)
        return { name: wanted, key }
    }
    if (get('OPENROUTER_API_KEY')) return { name: 'openrouter', key: get('OPENROUTER_API_KEY') }
    if (get('ELEVENLABS_API_KEY')) return { name: 'elevenlabs', key: get('ELEVENLABS_API_KEY') }
    throw new Error('nenhuma chave de voz. Peça à pessoa uma chave da OpenRouter (openrouter.ai/keys) ou da ElevenLabs (elevenlabs.io/app/settings/api-keys) e rode: node scripts/config.mjs OPENROUTER_API_KEY=...')
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const pairs = process.argv.slice(2).filter((a) => a.includes('='))
    if (pairs.length) {
        const cur = readFile()
        for (const p of pairs) {
            const i = p.indexOf('=')
            const k = p.slice(0, i)
            if (!KEYS.includes(k)) { console.error(`chave desconhecida: ${k} (${KEYS.join(', ')})`); process.exit(1) }
            cur[k] = p.slice(i + 1)
        }
        fs.mkdirSync(DIR, { recursive: true })
        fs.writeFileSync(FILE, Object.entries(cur).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 })
    }
    for (const k of KEYS) console.log(`${k}: ${get(k) ? 'configurada' : 'faltando'}`)
    const ok = KEYS.some(get)
    console.log(ok ? 'pronto: basta uma das duas.' : 'falta uma chave: OpenRouter (openrouter.ai/keys) ou ElevenLabs (elevenlabs.io/app/settings/api-keys).')
    process.exit(ok ? 0 : 1)
}
