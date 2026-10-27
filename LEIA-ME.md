# TKS Academy — site

Abra `index.html` no navegador para ver localmente. Para mandar para alguém, publique a pasta inteira e envie o link.

## Publicar no GitHub Pages (grátis)

1. Crie um repositório público, por exemplo `tks-academy`.
2. Envie todo o conteúdo desta pasta para a raiz do repositório (o `index.html` precisa ficar na raiz).
3. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve.
4. Em 1–2 minutos o site fica em `https://SEU-USUARIO.github.io/tks-academy/`.

## Prévia no WhatsApp

A imagem do cartão de prévia (`assets/img/og.jpg`) precisa de um endereço completo para o WhatsApp encontrar.
Depois de publicar, troque `content="assets/img/og.jpg"` em `index.html` por
`content="https://SEU-USUARIO.github.io/tks-academy/assets/img/og.jpg"` e acrescente
`<meta property="og:url" content="https://SEU-USUARIO.github.io/tks-academy/">`.

## Estrutura

- `index.html` — a página
- `assets/css/tks.css` — estilos
- `assets/js/` — scripts (o 3D do topo fica dentro do `index.html`)
- `assets/img/armas`, `assets/img/acessorios`, `assets/img/mapas` — imagens do PUBG API Assets, carregadas só quando aparecem na tela
- `assets/img/og.jpg`, `icon-*.png` — prévia de link e ícone

O progresso dos alunos fica salvo no navegador de cada um.
