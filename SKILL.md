---
name: whiteboard-explainer-video
description: Cria vídeos explicativos de quadro branco desenhado à mão (traço de Excalidraw) que se desenham junto com a narração, com uma câmera passeando por um quadro único e um afastamento final que mostra o mapa inteiro. Roteiro, voz por OpenRouter ou ElevenLabs, sincronia palavra por palavra e render em MP4 16:9 com Remotion. Use sempre que pedirem um vídeo explicativo, whiteboard, quadro desenhado, explainer ou um vídeo que explique um sistema, produto, processo, livro ou ideia, mesmo sem citar a skill.
---

# Vídeo explicativo de quadro branco

Um quadro branco que se desenha enquanto o narrador fala. A pessoa sai com o mapa inteiro na cabeça.

O que faz o estilo funcionar, e não pode ser cortado:

- Tudo se desenha na hora em que a voz fala daquilo. Nada aparece pronto.
- Um quadro só: a câmera passeia e o que foi explicado continua no lugar.
- O afastamento final mostra o quadro inteiro e vira o resumo do vídeo. Ele só funciona se o mapa for planejado antes de desenhar.
- Se existe um app ou algo real, a gravação de tela dentro de uma janela desenhada prova o que o desenho afirma.

`SD` abaixo é a pasta desta skill. Comandos: `node "$SD/scripts/..."`.

## Antes de começar

1. `node "$SD/scripts/config.mjs"`. Sem chave, peça à pessoa **uma** destas e salve sem repetir o valor no chat:
   - OpenRouter (openrouter.ai/keys), que faz voz e transcrição: `node "$SD/scripts/config.mjs" OPENROUTER_API_KEY=...`
   - ElevenLabs (elevenlabs.io/app/settings/api-keys): `node "$SD/scripts/config.mjs" ELEVENLABS_API_KEY=...`
2. Precisa de Node 20+ e ffmpeg. Falta algo: diga como instalar no sistema dela.
3. Antes de construir, combine: assunto, para quem, duração, idioma e o que o vídeo precisa deixar claro. Com o pedido já claro, siga sem perguntar.

## A ordem de produção

| # | Passo | Sai |
|---|---|---|
| 1 | `node "$SD/scripts/new-project.mjs" <pasta>` | projeto Remotion |
| 2 | Roteiro em trechos curtos, um assunto por trecho, sem número inventado | `script/script.md` |
| 3 | Vídeo acima de 1 min: 3 amostras (`narrate.mjs <pasta> --samples "primeira frase"`) e a pessoa escolhe. Grave em `script/voice.json`. Teste curto usa o padrão | a voz |
| 4 | `node "$SD/scripts/narrate.mjs" <pasta>` | `public/audio/`, `src/data/narration.json` |
| 5 | Encadear os trechos em `src/sections.ts` | linha do tempo |
| 6 | Mapa do mundo: uma região por trecho, agrupadas por parte do vídeo | constantes `R_*` |
| 7 | Uma região por vez: desenhar, ancorar nas palavras, conferir num still | `src/scenes/*.tsx` |
| 8 | Câmera e fechamento | `src/Video.tsx` |
| 9 | `npx remotion studio src/index.ts` para a pessoa assistir, se ela quiser revisar | ok |
| 10 | Render de um pedaço, prancha, render inteiro, prancha, loudness | `out/video.mp4` |

A cena `src/scenes/Example.tsx` é só um molde: apague e desenhe o quadro do assunto. Cada vídeo tem o próprio desenho.

Leia `references/method.md` antes do passo 6. Tem gravação de tela no vídeo: leia também `references/screens.md`.

## Roteiro

```
**s01**
Texto falado do trecho, num parágrafo só.
```

- Frase de fala, não de texto. Pontuação simples: travessão e reticência criam silêncio estranho.
- Número por extenso quando a leitura importa.
- Cada trecho deve dar um desenho. Se não dá para desenhar, reescreva.
- Sem data no vídeo se ele deve durar, e todo número precisa de fonte.

## Conferir: você não assiste, então leia quadros

```bash
npx remotion still src/index.ts Whiteboard /tmp/f.png --frame=N --scale=0.5
node "$SD/scripts/render.mjs" <pasta> --frames=0-299
node "$SD/scripts/qa.mjs" sheet <pasta>/out/video.mp4 24    # prancha: procure pedaço repetido e sobreposição
node "$SD/scripts/qa.mjs" scan  <pasta>/out/video.mp4       # segundos parados, quadro preto, quadro que pisca
node "$SD/scripts/qa.mjs" loud  <pasta>/out/video.mp4       # mire -14 a -16 LUFS, pico até -1 dBTP
```

O `scan` mede o que o olho sente: acima de 5% parado, o vídeo parece slide. Corrija antes de entregar, mesmo em teste, com mais peças por frase e chaves de câmera nos detalhes; a respiração da câmera sozinha conta como parado.

Abra as imagens. Não diga que ficou bom sem ter visto a prancha e medido o áudio.

Só use efeito de `useCurrentFrame`: CSS `transition` e `animation` não saem no render.
