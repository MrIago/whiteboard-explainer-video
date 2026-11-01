# whiteboard-explainer-video

Skill do Claude Code que cria vídeos explicativos de quadro branco desenhado à mão: o traço de Excalidraw se desenha junto com a narração, a câmera passeia por um quadro único e, no fim, se afasta para mostrar o mapa inteiro.

Sai um MP4 16:9, feito em código com [Remotion](https://www.remotion.dev).

## Instalar e fazer o primeiro vídeo

Cole isto no Claude Code:

```text
Instale a skill de https://github.com/MrIago/whiteboard-explainer-video clonando o repositório em ~/.claude/skills/whiteboard-explainer-video.
Leia o SKILL.md dela e confira se tenho Node 20+ e ffmpeg; se faltar algo, me diga como instalar.
Me peça UMA chave para a voz, da OpenRouter ou da ElevenLabs, e salve com o scripts/config.mjs.
Depois crie um vídeo de teste de uns 30 segundos, em português, explicando como funciona um semáforo, siga a skill até o MP4 final, confira a prancha de quadros e me diga onde ele está.
```

## O que precisa

- [Claude Code](https://claude.com/claude-code)
- Node 20 ou mais novo e [ffmpeg](https://ffmpeg.org)
- Uma chave para a voz. Basta uma:

| Provedor | Onde pegar | Observação |
|---|---|---|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | padrão, faz voz e transcrição, com várias vozes e modelos |
| ElevenLabs | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) | precisa das permissões de Text to Speech e Speech to Text |

A chave fica em `~/.config/whiteboard-explainer/.env`, fora de qualquer repositório. Para salvar à mão:

```bash
node ~/.claude/skills/whiteboard-explainer-video/scripts/config.mjs OPENROUTER_API_KEY=sua-chave
```

## Como usar depois

Peça normalmente:

> Faz um vídeo explicativo de quadro branco de 3 minutos sobre como funciona o nosso processo de vendas.

A skill escreve o roteiro, gera a voz, sincroniza cada desenho com a palavra falada e renderiza. Para revisar antes do render: `npx remotion studio src/index.ts`, dentro da pasta do projeto.

## Licenças

Código sob [MIT](LICENSE), © MrIago. Inclui [rough.js](https://github.com/rough-stuff/rough) (MIT) e a fonte [Virgil](https://github.com/excalidraw/virgil) (OFL 1.1). Veja [THIRD_PARTY.md](THIRD_PARTY.md). O [Remotion](https://www.remotion.dev/license) tem licença própria: empresas maiores podem precisar de uma licença paga.
