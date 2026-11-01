# Telas reais dentro do quadro

## Gravar

`scripts/rec.mjs` é a bancada: Chrome headless em 1280×720 @1,5 (quadros de 1920×1080), cursor desenhado e uma marca em cada acontecimento. Instale no projeto: `npm i playwright && npx playwright install chromium`. Exemplo de tomada:

```js
import { launch, actor, take, go, clickOn } from '<skill>/scripts/rec.mjs'
const b = await launch()
const { page } = await actor(b)            // com { email, password } entra pela rota de login do app
const t = take('login')
await go(t, page, '/')                     // navega com a câmera pausada
await t.film(page); t.start()
await clickOn(page, page.getByRole('button', { name: 'Entrar' }))
t.mark('entrou')
await page.waitForTimeout(2000)
await t.stop(); await b.close()
```

Ambiente: `APP_URL`, `LOGIN_PATH`, `TAKES_ROOT` (a pasta `public` do projeto). Senha só por variável de ambiente, e só de conta de teste. As tomadas ficam em `public/takes/<nome>.mp4` + `.json` com as marcas.

- Espere o carregamento antes de filmar e o texto final antes de parar.
- Segure 1,5 a 3 s depois de cada acontecimento: a edição precisa de folga.
- Gravar mexe no app: anote o que criou e limpe no fim.
- Reduza para 720p: a tela aparece pequena ou média e o render fica bem mais rápido.

## Montar

`Screen` = janela desenhada com a gravação dentro:

```tsx
<Screen x={120} y={200} w={1100} src="takes/login.mp4" label="meu-app.com/login"
    draw={{ at: A('s05', 'a tela') - 0.3 }} clips={[{ at: A('s05', 'a tela'), from: mark(take, 'entrou') - 1, to: mark(take, 'entrou') + 2 }]} />
```

- `clips`: `{ at, from, to?, rate? }`. Toca a partir de `from` em `at`; com `to`, a velocidade se ajusta (0,4× a 4×) e o último quadro fica parado até o próximo trecho.
- `crop: { x, y, w, h }` (px de 1920×1080): só aquele retângulo vira a janela.
- Em `Video.tsx`, envolva o quadro em `<MediaMode.Provider value={{ fast: true }}>`: o `<Video>` do `@remotion/media` rende ~3× mais rápido que o `OffthreadVideo`.
- Marcas no lugar de segundos: regravou, continua certo.
- Pausa com `breaks` depois da frase que apresenta a tela.
- Bilhete que explica a tela fica ao lado, nunca por cima.
- Comparar papéis ou casos: colunas recortadas lado a lado, a câmera para em cada uma e no fim se afasta.
