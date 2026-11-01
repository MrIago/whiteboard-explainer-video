// Linha do tempo: os trechos da narração em sequência, com pausas inseridas no meio de um trecho
// (depois de uma frase) quando a imagem precisa de tempo. Tudo que aparece no vídeo se ancora numa
// PALAVRA da narração: A('s05', 'dois clientes') = segundo global em que a voz diz "dois clientes".
// Trocar a voz = transcrever de novo; os desenhos ressincronizam sozinhos.

import narr from '../data/narration.json'
import { SECTIONS } from '../sections'

type Word = { w: string; s: number; e: number }
type Narr = Record<string, { dur: number; text: string; words: Word[] }>
const N = narr as unknown as Narr

export type Brk = { after: string; n?: number; pause: number }
export type Sec = { id: string; lead?: number; pad?: number; breaks?: Brk[] }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
const toks = (p: string) => p.split(/\s+/).map(norm).filter(Boolean)

function findPhrase(id: string, phrase: string, n = 1): [number, number] {
    const sec = N[id]
    if (!sec) throw new Error(`trecho ${id} não existe na narração`)
    const ws = sec.words.map((w) => norm(w.w))
    const tk = toks(phrase)
    let found = 0
    for (let i = 0; i + tk.length <= ws.length; i++) {
        let ok = true
        for (let j = 0; j < tk.length; j++) if (ws[i + j] !== tk[j]) { ok = false; break }
        if (ok && ++found === n) return [i, i + tk.length - 1]
    }
    throw new Error(`âncora "${phrase}" (#${n}) não achada em ${id}: ${sec.words.map((w) => w.w).join(' ')}`)
}

type Part = { id: string; from: number; to: number; at: number }
type Placed = { start: number; end: number; parts: Part[] }

const placed: Record<string, Placed> = {}
const audioParts: Part[] = []
let cursor = 0
for (const s of SECTIONS as Sec[]) {
    const sec = N[s.id]
    if (!sec) throw new Error(`trecho ${s.id} sem narração: rode scripts/narrate.mjs`)
    const start = cursor + (s.lead ?? 0)
    const cuts = (s.breaks ?? []).map((b) => {
        const [, last] = findPhrase(s.id, b.after, b.n)
        const w = sec.words[last]
        const next = sec.words[last + 1]
        const cut = next ? (w.e + next.s) / 2 : w.e + 0.05
        return { cut, pause: b.pause }
    }).sort((a, b) => a.cut - b.cut)
    const parts: Part[] = []
    let from = 0
    let at = start
    for (const c of cuts) {
        parts.push({ id: s.id, from, to: c.cut, at })
        at += c.cut - from + c.pause
        from = c.cut
    }
    parts.push({ id: s.id, from, to: sec.dur, at })
    const end = at + (sec.dur - from)
    placed[s.id] = { start, end, parts }
    audioParts.push(...parts)
    cursor = end + (s.pad ?? 0.5)
}

export const TOTAL = cursor
export const AUDIO = audioParts

function mapLocal(id: string, local: number) {
    const p = placed[id]
    let best = p.parts[0]
    for (const part of p.parts) if (local >= part.from - 1e-6) best = part
    return best.at + (local - best.from)
}

/** segundo global em que a frase começa a ser dita (escreva como está na transcrição) */
export function A(id: string, phrase: string, n = 1) {
    const [i] = findPhrase(id, phrase, n)
    return mapLocal(id, N[id].words[i].s)
}

/** segundo global em que a frase termina */
export function E(id: string, phrase: string, n = 1) {
    const [, j] = findPhrase(id, phrase, n)
    return mapLocal(id, N[id].words[j].e)
}

/** início e fim globais de um trecho, com as pausas */
export const S = (id: string) => placed[id].start
export const Z = (id: string) => placed[id].end

/** fim do trecho incluindo a folga até o próximo */
export function NEXT(id: string) {
    const list = SECTIONS as Sec[]
    const i = list.findIndex((s) => s.id === id)
    const nx = list[i + 1]
    return nx ? placed[nx.id].start - (nx.lead ?? 0) : TOTAL
}
