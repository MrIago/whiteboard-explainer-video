// Cores e medidas do quadro. Cada pastel tem UM significado no vídeo inteiro: defina o de cada um
// no começo do vídeo e não troque no meio. Tinta forte só no destaque (anel, ✓, ✗, seta de fluxo).

export const FPS = 30

export const PAPER = '#FBFAF6'
export const INK = '#2B2B2B'
export const INK_SOFT = '#6B6B6B'
export const INK_FAINT = '#B8B4AC'

export const PASTEL = {
    azul: '#A5D8FF',
    azulClaro: '#E7F5FF',
    verde: '#B2F2BB',
    amarelo: '#FFEC99',
    rosa: '#FFC9C9',
    lilas: '#D0BFFF',
    pessego: '#FFD8A8',
    turquesa: '#99E9F2',
    cinza: '#F1F3F5',
    branco: '#FFFFFF',
} as const

export const TINTA = {
    azul: '#1971C2',
    verde: '#2F9E44',
    vermelho: '#E03131',
    laranja: '#F08C00',
    lilas: '#7048E8',
} as const

export const HAND = 'Virgil, "Segoe Print", cursive'
export const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace'

export const sec = (s: number) => Math.round(s * FPS)
