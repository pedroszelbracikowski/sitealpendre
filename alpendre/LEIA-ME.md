# Alpendre — Arquitetura para pertencer

Site conceitual de portfólio criado com Sites para um estúdio de arquitetura contemporânea brasileira. Nome, marca e narrativa originais para este estudo. As imagens de arquitetura foram fornecidas pelo usuário; sua autoria e origem não foram informadas. Casa da Mata, Casa do Pátio e Casa Clara são estudos editoriais, sem atribuição de autoria arquitetônica ou alegação de obras realizadas. Os nomes não identificam os edifícios fotografados.

## Editar e executar

- `dist/index.html`: conteúdo e estrutura.
- `dist/style.css`: identidade, composição e responsividade.
- `dist/app.js`: GSAP, menu, carrossel de projetos, detalhes das casas e materiais.
- `dist/assets`: imagens WebP em versões horizontal e vertical, fontes locais, licenças e GSAP 3.15.0.
- `brand`: logos vetoriais e guia da identidade.
- `.openai/hosting.json`: identificação do projeto Sites.

Nenhuma instalação ou etapa de build é necessária. Para executar localmente, na pasta do projeto:

```powershell
python -m http.server 4381 --bind 127.0.0.1 --directory dist
```

Depois, abrir `http://127.0.0.1:4381/`.

## Experiência

Abertura com folhas em camadas, fotografia imersiva, apresentação do estúdio, transição para a paisagem, carrossel com três casas e seus conceitos arquitetônicos, seleção de materiais e encerramento. Menu com abertura e fechamento animados, hover nos botões e hierarquia entre Instrument Serif (títulos expressivos) e Manrope (leitura, navegação e informações).

O carrossel não avança sozinho: aceita deslize, botões e as teclas esquerda/direita, Home e End. Cada projeto abre um diálogo com partido, estratégia e materiais. Navegação por teclado, retorno do foco ao fechar, diálogos nativos, imagens WebP, fontes locais e alternativa com movimento reduzido. Não há formulários ou contatos fictícios conectados.

Em “03 / A matéria”, a sanfona anima a altura e a presença do texto ao abrir e fechar. A próxima fotografia se revela de baixo para cima sobre a anterior, com um movimento discreto de enquadramento. Cliques rápidos preservam a última seleção; a troca aguarda a imagem ficar pronta para evitar quadros vazios. A preferência por movimento reduzido aplica as mudanças imediatamente, e a sanfona continua utilizável sem JavaScript.

Esta atualização preserva o acesso público configurado pelo proprietário no Sites.

A barra de rolagem do desktop usa trilho areia e puxador verde, com largura discreta e rolagem nativa. A personalização se aplica a telas acima de 800 px com mouse; dispositivos de toque e o modo de alto contraste mantêm o comportamento da plataforma.

## Filme da hero

Montagem silenciosa de 20,75 segundos com os cinco vídeos fornecidos pelo usuário, em 24 fps. A sequência visita entrada, sala, varanda, cozinha e pedra, retornando ao primeiro plano. Fontes locais H.264 com faststart: `dist/assets/hero-desktop.mp4` (1280 × 720) e `hero-mobile.mp4` (404 × 720). O vídeo de fundo é automático, sem botão visível, conforme solicitado. Pausa fora da área visível e quando a página fica em segundo plano; respeita redução de movimento e economia de dados. Se o navegador bloquear autoplay ou o vídeo falhar, a fotografia continua disponível.

## Refinamento da interface — 8 de outubro de 2026

Espaçamentos de seção, intervalos entre colunas, legendas e controles usam medidas compartilhadas. Textos corridos têm 16 px; legendas e metadados, 12–13 px; ações, 14 px e altura mínima de 48 px. As cores de texto principal e secundário foram reforçadas. Fotografias dos projetos usam proporção 16:10 no desktop e 4:5 no celular. A seção de materiais utiliza as composições verticais fornecidas em todos os tamanhos, evitando o corte excessivo dos arquivos horizontais. Os textos apresentam o estúdio, os conceitos das casas e o papel dos materiais com mais clareza, mantendo a identificação dos estudos conceituais.
