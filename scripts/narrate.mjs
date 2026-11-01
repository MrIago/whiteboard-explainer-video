// Narração: um áudio por trecho de script/script.md, sem o silêncio do começo, nivelado em -18 LUFS,
// e a transcrição palavra por palavra (as âncoras dos desenhos, em src/data/narration.json).
// Trecho que não mudou (texto e voz) não é gerado de novo.
//
//   node narrate.mjs <projeto>                    gera o que falta
//   node narrate.mjs <projeto> s03 s04            refaz só estes
//   node narrate.mjs <projeto> --samples "frase"  3 amostras de voz em script/samples/
//   node narrate.mjs <projeto> --voices           lista as vozes do provedor
//
// A voz fica em script/voice.json: { "provider": "openrouter|elevenlabs", "model", "voice", "instructions" }.
// Sem esse arquivo, usa o padrão do provedor que tiver chave.
//
// O roteiro tem um trecho por bloco:
//   **s01**
//   Texto falado do trecho, num parágrafo só.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { provider } from './config.mjs'

const OR = 'https://openrouter.ai/api/v1'
const EL = 'https://api.elevenlabs.io/v1'
const OR_STT = 'openai/whisper-large-v3-turbo'
const NARRATOR = 'Narrador de um vídeo explicativo, falando com um colega de trabalho: tom claro, confiante e próximo, ritmo médio, sem exagero.'

const DEFAULTS = {
    openrouter: { model: 'google/gemini-3.8-flash-lite-tts', voice: 'Iapetus', instructions: NARRATOR },
    elevenlabs: { model: 'eleven_multilingual_v2', voice: 'nPczCjzI2devNBz1zQrb' }, // Brian
}
const SAMPLES = {
    openrouter: ['Iapetus', 'Despina', 'Charon'],
    elevenlabs: ['nPczCjzI2devNBz1zQrb', 'EXAVITQu4vr4xnSDxMaL', 'JBFqnCBsd6RMkjVDRZzb'], // Brian, Sarah, George
}

const args = process.argv.slice(2)
const proj = args.shift()
if (!proj) { console.error('uso: node narrate.mjs <projeto> [s01 s02 | --samples "frase" | --voices]'); process.exit(1) }
const P = path.resolve(proj)
const VOICE_FILE = `${P}/script/voice.json`
const saved = fs.existsSync(VOICE_FILE) ? JSON.parse(fs.readFileSync(VOICE_FILE, 'utf8')) : {}
const prov = provider(saved.provider)
const voiceCfg = { ...DEFAULTS[prov.name], ...saved }

function pcmToWav(pcm, rate = 24000) {
    const h = Buffer.alloc(44)
    h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12)
    h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24)
    h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
    return Buffer.concat([h, pcm])
}

async function withRetry(label, fn) {
    for (let i = 1; ; i++) {
        try { return await fn() } catch (e) {
            if (i >= 4) throw new Error(`${label}: ${e.message}`)
            console.error(`${label}: tentativa ${i} falhou (${e.message}), repetindo`)
            await new Promise((r) => setTimeout(r, 2000 * i))
        }
    }
}

/** Devolve { bytes, ext } */
async function speak(text, cfg) {
    return withRetry('voz', async () => {
        if (prov.name === 'elevenlabs') {
            const res = await fetch(`${EL}/text-to-speech/${cfg.voice}?output_format=mp3_44100_128`, {
                method: 'POST', signal: AbortSignal.timeout(45_000),
                headers: { 'xi-api-key': prov.key, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, model_id: cfg.model }),
            })
            if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
            return { bytes: Buffer.from(await res.arrayBuffer()), ext: 'mp3' }
        }
        const google = cfg.model.startsWith('google/')
        const body = { model: cfg.model, input: text, voice: cfg.voice, response_format: google ? 'pcm' : 'mp3' }
        if (cfg.instructions) body.instructions = cfg.instructions
        const res = await fetch(`${OR}/audio/speech`, {
            method: 'POST', signal: AbortSignal.timeout(45_000),
            headers: { Authorization: `Bearer ${prov.key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        const buf = Buffer.from(await res.arrayBuffer())
        if (!res.ok || buf[0] === 0x7b) throw new Error(`OpenRouter HTTP ${res.status}: ${buf.toString('utf8').slice(0, 200)}`)
        return google ? { bytes: pcmToWav(buf), ext: 'wav' } : { bytes: buf, ext: 'mp3' }
    })
}

/** Devolve [{ w, s, e }] */
async function words(file) {
    return withRetry('transcrição', async () => {
        if (prov.name === 'elevenlabs') {
            const form = new FormData()
            form.append('model_id', 'scribe_v1')
            form.append('timestamps_granularity', 'word')
            form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file))
            const res = await fetch(`${EL}/speech-to-text`, { method: 'POST', signal: AbortSignal.timeout(45_000), headers: { 'xi-api-key': prov.key }, body: form })
            if (!res.ok) throw new Error(`ElevenLabs STT HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
            const j = await res.json()
            return j.words.filter((w) => w.type === 'word').map((w) => ({ w: w.text.trim(), s: w.start, e: w.end }))
        }
        const res = await fetch(`${OR}/audio/transcriptions`, {
            method: 'POST', signal: AbortSignal.timeout(45_000),
            headers: { Authorization: `Bearer ${prov.key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OR_STT,
                input_audio: { data: fs.readFileSync(file).toString('base64'), format: 'wav' },
                response_format: 'verbose_json',
                timestamp_granularities: ['word'],
            }),
        })
        if (!res.ok) throw new Error(`OpenRouter STT HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
        const j = await res.json()
        if (!j.words?.length) throw new Error('transcrição sem palavras')
        return j.words.map((w) => ({ w: w.word.trim(), s: +w.start.toFixed(3), e: +w.end.toFixed(3) }))
    })
}

const probe = (f) => +execFileSync('ffprobe', ['-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()

if (args[0] === '--voices') {
    if (prov.name === 'elevenlabs') {
        const j = await (await fetch(`${EL}/voices`, { headers: { 'xi-api-key': prov.key } })).json()
        for (const v of j.voices) console.log(`${v.voice_id}  ${v.name}  ${v.labels?.accent ?? ''} ${v.labels?.gender ?? ''}`)
    } else {
        console.log(`modelo ${voiceCfg.model}. Vozes sugeridas: ${SAMPLES.openrouter.join(', ')}. Outros modelos: openrouter.ai/models?output_modalities=speech`)
    }
    process.exit(0)
}

if (args[0] === '--samples') {
    const text = args[1]
    if (!text) { console.error('uso: --samples "primeira frase do roteiro"'); process.exit(1) }
    const dir = `${P}/script/samples`
    fs.mkdirSync(dir, { recursive: true })
    for (const voice of SAMPLES[prov.name]) {
        const a = await speak(text, { ...voiceCfg, voice })
        const f = `${dir}/${voice}.${a.ext}`
        fs.writeFileSync(f, a.bytes)
        console.log(`${voice}: ${f}`)
    }
    console.log('Depois da escolha, grave a voz em script/voice.json.')
    process.exit(0)
}

const md = fs.readFileSync(`${P}/script/script.md`, 'utf8')
const sections = {}
for (const m of md.matchAll(/\*\*(s\d+)\*\*\s*\n([\s\S]*?)(?=\n\s*\n|\n\*\*s\d+\*\*|$)/g)) sections[m[1]] = m[2].trim()
if (!Object.keys(sections).length) { console.error('roteiro sem trechos: use **s01** + parágrafo'); process.exit(1) }

const dataFile = `${P}/src/data/narration.json`
const data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {}
const audioDir = `${P}/public/audio`
fs.mkdirSync(audioDir, { recursive: true })
const tmp = `${P}/out/narration-raw`
fs.mkdirSync(tmp, { recursive: true })

const fingerprint = (text) => crypto.createHash('sha1').update(JSON.stringify([text, voiceCfg, prov.name])).digest('hex').slice(0, 12)

for (const id of Object.keys(data)) if (!sections[id]) delete data[id]
for (const [id, text] of Object.entries(sections)) {
    const fp = fingerprint(text)
    if (!args.includes(id) && data[id]?.fp === fp && fs.existsSync(`${audioDir}/${id}.wav`)) continue
    const a = await speak(text, voiceCfg)
    const raw = `${tmp}/${id}.${a.ext}`
    fs.writeFileSync(raw, a.bytes)
    const out = `${audioDir}/${id}.wav`
    // corta o silêncio do começo e nivela; a saída é 48 kHz, o que o Remotion mistura sem conversão
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,loudnorm=I=-18:TP=-2:LRA=11', '-ar', '48000', '-ac', '1', out])
    // um trecho por vez: em paralelo, os planos grátis de transcrição devolvem 429
    data[id] = { fp, dur: +probe(out).toFixed(3), text, words: await words(out) }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 1))
    console.log(`${id}: ${data[id].dur}s, ${data[id].words.length} palavras`)
}
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`✓ ${Object.keys(sections).length} trechos em ${dataFile}`)
