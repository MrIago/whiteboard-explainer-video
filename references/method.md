# O método do quadro desenhado

## O mundo e o mapa

- O quadro é UM espaço. Cada trecho ganha uma **região** com origem fixa (`R_X = { x, y }`), do tamanho de uma tela (1920×1080) e com folga entre elas: colunas a cada 2150 e linhas a cada 1300 a 1600.
- Organize por parte do vídeo: cada parte numa grade própria. No afastamento final, cada parte vira uma área com nome.
- O que já apareceu continua no lugar. O que já foi explicado vai para ~0,45 de opacidade (`Fade`), sem sumir.
- Cada região fica em `<At x y w h>`. `w`/`h` precisam cobrir tudo o que ela desenha (padrão 2000×1150), senão parte dela some quando a câmera centraliza além da caixa.

## A linha do tempo mora nas palavras

Tudo se ancora numa palavra dita, nunca em segundos chutados.

- `A('s05', 'dois clientes')`: segundo em que a frase começa. `E`: em que termina. `S`/`Z`: início e fim do trecho. `NEXT`: início do próximo. `A(id, frase, 2)`: segunda vez que a frase aparece.
- **A âncora usa a grafia da TRANSCRIÇÃO.** Nome próprio, sigla e número costumam vir diferentes do roteiro ("vinte" vira "20"). O erro mostra o trecho transcrito: copie de lá.
- Peça entra 0,1 a 0,3 s antes da palavra (`A(...) - 0.2`); título de região em `S(id) - 0.3`.
- `src/sections.ts` encadeia os trechos: `lead` (silêncio antes), `pad` (depois) e `breaks: [{ after: 'frase', pause: 1.4 }]` (pausa depois de uma frase, para a imagem ter tempo).
- Trocar a voz = rodar `narrate.mjs` de novo: os desenhos ressincronizam sozinhos.

## As peças

Toda peça recebe `draw = { at, dur, out?, outDur? }` em segundos globais. Em `src/lib/sketch.tsx` e `bits.tsx`:

| Peça | Uso |
|---|---|
| `Box`, `Ellipse`, `Line`, `Arrow` (curva com 3 pontos ou mais; `both` = duas pontas) | vocabulário básico |
| `Hand` | texto à mão, que se escreve da esquerda para a direita (`font={MONO}` para arquivo, comando e endereço) |
| `Note` | bilhete torto: regra, decisão, aviso |
| `Card`, `Chip`, `Count` | caixa com título e subtítulo; etiqueta; número grande com legenda |
| `Marker` | marca-texto atrás de uma palavra |
| `Check`, `Cross`, `Strike` | ✓, ✗ e o X sobre uma alternativa recusada |
| `Person`, `Lock`, `Key`, `Folder`, `Chat`, `Db`, `Browser`, `Doc`, `Container`, `Moon`, `Clock`, `Eye`, `Envelope`, `Terminal` | ícones com as mesmas primitivas |
| `Pop` | entrada com escala para o que não se desenha; use `ox`/`oy` no centro do elemento |
| `Fade` | holofote: opacidade por chaves `[t, valor]` |
| `Screen`, `Footage`, `Picture` | gravação ou imagem numa janela desenhada |

Peça nova: faça com `Rough`, com semente fixa (sem ela o traço treme a cada quadro). Largura de texto na Virgil ≈ letras × tamanho × 0,56 (`textW`): use para posicionar o vizinho.

## Cor

Papel `#FBFAF6`, tinta `#2B2B2B`. Cada pastel tem **um significado no vídeo inteiro**: por exemplo verde = certo, rosa = risco, amarelo = regra, lilás = IA. Tinta forte só no destaque. Logo ou marca só na abertura e no cartão final.

## Câmera

Chaves `{ t, x, y, z, d }` em `src/Video.tsx`:

- Chegada numa região: `S('s05') - 1` (chega antes de a voz começar), `d` de 1,2 a 2,4 s.
- Detalhe: chave numa palavra, zoom 1,18 a 1,3 no ponto citado.
- Região mais larga que a tela: zoom 0,88 a 0,92.
- Fechamento: até a caixa do mundo inteiro em ~3,6 s, zoom `min(1920 / (W + 300), 1080 / (H + 240))`.

**De longe, texto normal não se lê.** No afastamento, cada parte ganha um contorno com traço 20 a 26 px e um nome com 210 a 300 px, escritos na hora em que a voz fecha aquela parte. Setas grossas mostram como as partes se ligam. Em vídeo curto com mundo pequeno, ajuste pela conta do zoom: o tamanho na tela é `px × zoom`, mire acima de 28 px.

Fixos na tela, fora da `Camera`: barra de capítulos (canto superior DIREITO, à esquerda moram os títulos) e cartão final.

## Defeitos que só a prancha mostra

| Defeito | Correção |
|---|---|
| Pedaço do quadro duplicado e deslocado em todo quadro | modo de GL: no Linux `angle-egl`. Só aparece no render sequencial, não em still |
| Título coberto pela barra de capítulos | barra à direita |
| Imagem "vindo do canto" no `Pop` | `ox`/`oy` no centro do elemento |
| Etiqueta encavalada no texto vizinho | posição calculada com `textW` |
| Bilhete cobrindo o que a tela mostra | ao lado da janela, com `out` |
| Rótulos ilegíveis no afastamento | conta do zoom acima |
| Fonte errada | a Virgil não carregou: confira num still |
| Fundo gigante em ladrilhos | nunca um `div` do tamanho do mundo; a grade de pontos da `Camera` já anda no espaço da tela |
| Quadro branco parado muito tempo | mais peças por frase, ou zoom num detalhe; `qa.mjs scan`, mire menos de 5% parado |

## Render

- Pedaço primeiro (`--frames=0-299`), prancha, depois o inteiro.
- Com NVIDIA ou Mac, acrescente `--hardware-acceleration=if-possible --video-bitrate=8M` ao `render.mjs`: a codificação fica bem mais rápida.
- Música, se vier, entra depois por ffmpeg 11 a 20 dB abaixo da voz, sem renderizar de novo.
- Áudio dentro de `<Sequence>` usa o `Audio` do pacote `remotion`, como no modelo. O do `@remotion/media` ignora o `from`.
