// Cena de exemplo: duas regiões e o fechamento. Apague e escreva as do seu vídeo no mesmo molde:
// uma região por trecho, posições em coordenadas locais, cada peça ancorada numa palavra.
import React from 'react'
import { A, S } from '../lib/timeline'
import { Arrow, Box, Hand, Line, Note } from '../lib/sketch'
import { At } from '../lib/camera'
import { Card, Count } from '../lib/bits'
import { PASTEL, TINTA } from '../lib/theme'

export const R_A = { x: 0, y: 0 }
export const R_B = { x: 2150, y: 0 }
export const WORLD = { x: -80, y: -80, w: 4300, h: 1300 }

export function Example() {
    return (
        <>
            <At x={R_A.x} y={R_A.y}>
                <Hand x={960} y={120} size={110} align="center" draw={{ at: S('s01') + 0.1, dur: 1 }}>Um quadro que se desenha</Hand>
                <Line x1={420} y1={262} x2={1500} y2={268} look={{ sw: 2.4, single: true }} draw={{ at: S('s01') + 0.9, dur: 0.5 }} />
                <Card x={230} y={480} w={520} h={220} fill={PASTEL.amarelo} title="uma ideia" size={58} draw={{ at: A('s01', 'uma ideia') - 0.2, dur: 0.7 }} />
                <Arrow pts={[[770, 590], [960, 560], [1150, 590]]} draw={{ at: A('s01', 'vira') - 0.1, dur: 0.6 }} />
                <Card x={1170} y={480} w={520} h={220} fill={PASTEL.verde} title="um desenho" size={58} draw={{ at: A('s01', 'desenho') - 0.2, dur: 0.7 }} />
            </At>

            <At x={R_B.x} y={R_B.y}>
                <Hand x={90} y={70} size={70} draw={{ at: S('s02') - 0.3, dur: 0.8 }}>o segredo</Hand>
                <Count x={520} y={300} num="1" label="palavra, 1 traço" size={180} draw={{ at: A('s02', 'cada palavra') - 0.2 }} />
                <Note x={1020} y={330} w={620} h={220} text={'nada aparece\nantes da voz'} size={50} draw={{ at: A('s02', 'nada') - 0.2, dur: 0.7 }} />
                <Box x={1000} y={680} w={660} h={120} look={{ stroke: TINTA.azul, sw: 3 }} draw={{ at: A('s02', 'nada') + 1, dur: 0.6 }} />
            </At>

            <Hand x={2100} y={1040} size={120} align="center" draw={{ at: S('s03') + 1.2, dur: 1.4 }}>o mapa inteiro</Hand>
        </>
    )
}
