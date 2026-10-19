# Alpendre — Keynote Modular (protótipo 01)

Apresentação cinematográfica em partes, construída sobre o próprio website do repositório. **O site publicado em `dist/` permanece inalterado.**

## Acesso local

A partir da raiz deste repositório:

```powershell
python -m http.server 4381 --bind 127.0.0.1
```

Visite `http://127.0.0.1:4381/presentation/`.

**Importante:** não abra com `file://` porque a apresentação depende de um iframe de mesma origem para executar ações reais em `dist/index.html`. A página usa GSAP 3.15.0 já presente no repositório (`dist/assets/gsap.min.js`). Não há `npm install`.

## O que está implementado

- Stage cinematográfico com perspectiva real (`perspective`, `rotateX`, `rotateY`) e suporte a GSAP.
- 8 módulos com total de 120s: vazio → presença HeyGem → hero → menu → carrossel → matéria → HeyGem → assinatura.
- Preenchimento progressivo de espaço negativo, marcador de progresso, elementos-guia e estética cromática da marca.
- 4 estilos de legendas (`curtain`, `track`, `fill`, `whisper`); palavras entram em sequência por `GSAP`.
- Reprodução, pausa, scrub, salto entre partes, tela cheia e atalhos.
- Inserção local opcional de vídeo em cada momento do apresentador; vídeos não são enviados a servidores. São usados `URL.createObjectURL`.
- Navegação do **site real** incorporado pelo iframe e demonstrações programadas de menu, carrossel, modal e materiais.
- `window.AlpendreKeynote` para inspeção e controle em automações.

## Estado do protótipo e limitações

Este commit é um **protótipo de direção cinematográfica**, não uma exportação final. As interações no iframe são chamadas com `click`, `scrollIntoView` e seletores presentes no `dist/index.html`. A aparência e o sincronismo precisam ser revisados com o site servido localmente; nenhum teste em navegador ou exportação MP4 foi executado como parte deste commit.

Os vídeos do HeyGem ainda não estão incluídos. Os slots permanecem vazios até você carregar takes por meio do controle na interface. Uma navegação manual para outros capítulos reinicia o estado visual daquele módulo, mas não refaz automaticamente todos os eventos intermediários de seu segmento (isso será trabalhado na próxima iteração para render determinístico por frame). A interface incorporada é dimensionada em 1440 × 855 e não funciona adequadamente se o iframe estiver hospedado em outra origem.

O 3º take está previsto criativamente para o encerramento, mas neste protótipo o encerramento é tipográfico. A versão seguinte poderá integrar o take e compor a assinatura.

## Próxima fase (não implementada)

1. Teste pixel a pixel dos seletores e alinhamentos do cursor; ajustes no comportamento de scroll e diálogos.
2. Separar o cursor da imagem em 3D, sincronizando clique, hover verdadeiro e movimentos do enquadramento.
3. Captura determinística a 30/60fps com Playwright.
4. Sincronização do áudio e dos takes HeyGem a partir de timestamps precisos.
5. Composição FFmpeg, mixagem e exportação 1920×1080 ou 3840×2160.

## Arquivos

- `index.html`: palco e controles;
- `style.css`: layout, tipografia, câmera e slots;
- `app.js`: cenas, eventos, timeline, cursor e integração local dos takes.

## Licenças

O protótipo reutiliza os assets e fontes presentes no projeto. Consulte os arquivos de licença originais em `dist/assets/`. Não redistribua os arquivos de fonte separadamente sem verificar essas licenças.
