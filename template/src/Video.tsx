// O vídeo: um quadro único, a câmera passeando por ele e a narração por trechos.
// Troque as regiões, as cenas e as chaves da câmera pelas do seu vídeo.

import React, { useState } from 'react'
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile } from 'remotion'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'
import { A, AUDIO, S, TOTAL } from './lib/timeline'
import { Camera, Key } from './lib/camera'
import { PAPER } from './lib/theme'
import { Example, R_A, R_B, WORLD } from './scenes/Example'

export const ID = 'Whiteboard'
export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080
export const DURATION = Math.ceil(TOTAL * FPS)

loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] })

let fontsLoaded = false
function useHandFont() {
    useState(() => {
        if (fontsLoaded || typeof document === 'undefined') return null
        fontsLoaded = true
        const handle = delayRender('Virgil')
        const face = new FontFace('Virgil', `url(${staticFile('fonts/Virgil.woff2')}) format('woff2')`)
        face.load()
            .then((f) => { document.fonts.add(f); return document.fonts.ready })
            .then(() => continueRender(handle))
            .catch(() => continueRender(handle))
        return null
    })
}

const at = (r: { x: number; y: number }, dx = 960, dy = 540) => ({ x: r.x + dx, y: r.y + dy })

function keys(): Key[] {
    const k: Key[] = [{ t: 0, ...at(R_A), z: 1 }]
    const go = (t: number, p: { x: number; y: number }, z = 1, d = 1.8) => k.push({ t, d, ...p, z })
    go(A('s01', 'uma ideia') - 0.2, at(R_A, 960, 620), 1.15, 1.3)
    go(S('s02') - 1, at(R_B))
    // o quadro inteiro
    go(S('s03') - 0.3, { x: WORLD.x + WORLD.w / 2, y: WORLD.y + WORLD.h / 2 }, Math.min(1920 / (WORLD.w + 300), 1080 / (WORLD.h + 240)), 3.2)
    return k
}

const KEYS = keys()

export const Video: React.FC = () => {
    useHandFont()
    return (
        <AbsoluteFill style={{ background: PAPER }}>
            <Camera keys={KEYS}>
                <Example />
            </Camera>
            {AUDIO.map((p, i) => (
                <Sequence key={i} from={Math.round(p.at * FPS)} durationInFrames={Math.max(1, Math.round((p.to - p.from) * FPS))}>
                    <Audio src={staticFile(`audio/${p.id}.wav`)} trimBefore={Math.round(p.from * FPS)} />
                </Sequence>
            ))}
        </AbsoluteFill>
    )
}
