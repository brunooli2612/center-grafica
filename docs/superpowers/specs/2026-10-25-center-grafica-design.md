# Center Gráfica — Documento de Design & Estratégia (Spec)

**Data:** 2026-10-25
**Cliente:** Center Gráfica (`@centergrafica`)
**Localização Física:** Av. Walter Alencar, 1700 - Macaúba, Teresina - PI
**Abrangência:** Atendimento local em Teresina-PI e envio para todo o Brasil
**Canal Principal de Conversão:** WhatsApp `(86) 98854-5141` (`https://wa.me/5586988545141`)
**Canais Secundários:** Fixo `(86) 3229-5141` | WhatsApp secundário `(86) 99510-5888` | Instagram `@centergrafica`

---

## 1. Diagnóstico Estratégico (`agency-business-strategist`)

### Posicionamento de Mercado
A Center Gráfica atua em um ponto forte que poucas gráficas locais dominam: combina **parque gráfico Offset** (ideal para médias e grandes tiragens com custo unitário baixo, como sacolas, catálogos e agendas), **Impressão Digital** (para demandas rápidas e tiragens menores) e **Comunicação Visual / Frotas** (adesivagem de veículos comerciais, lonas e sinalização).

### Problema de Conversão Atual
Quando o cliente clica direto no link da bio do Instagram sem contexto, o vendedor no WhatsApp precisa fazer sempre as mesmas 6 perguntas antes de conseguir passar um preço:
1. Qual é o produto?
2. Qual a quantidade (tiragem)?
3. Qual o tamanho ou acabamento?
4. Você já tem a arte finalizada em PDF/Corel/Illustrator ou precisa de criação?
5. É para retirada em Teresina-PI ou envio para outra cidade/estado?
6. Qual o seu nome/empresa?

### Solução Estratégica do Site
O site funciona como uma **vitrine de autoridade + pré-vendedor técnico automatizado**:
1. Prova a qualidade real com os trabalhos do portfólio da Center Gráfica (sacolas personalizadas, envelopamento de frotas, cadernos e agendas corporativas, impressos offset/digitais).
2. Permite ao cliente **simular e montar seu pedido de orçamento em menos de 1 minuto**, escolhendo categoria, produto, tiragem, acabamento, situação da arte e modalidade de entrega.
3. Gera uma **mensagem técnica pronta e formatada** direto para o WhatsApp `(86) 98854-5141`, acelerando o fechamento para a equipe comercial.

---

## 2. Arquitetura de Oferta & Lead Magnet (`agency-offer-lead-gen-strategist`)

### Equação de Valor
- **Resultado Desejado:** Impressos, embalagens e frotas com cores fiéis e acabamento profissional que valorizam a marca da empresa.
- **Probabilidade Percebida:** Portfólio real visível, endereço físico claro em Teresina (`Av. Walter Alencar, 1700`), mais de 3.800 seguidores e envio nacional.
- **Redução do Tempo de Espera:** Montador de Orçamento Express que envia o briefing técnico completo para o WhatsApp em um clique.
- **Redução de Esforço:** Consultor Interativo de Papel & Acabamento + Checklist Rápido de Fechamento de Arquivo (ensina o cliente em 30 segundos se o arquivo dele está pronto para impressão ou se deve pedir ajuste de arte para a Center).

---

## 3. Arquitetura de UX, UI e Design System (`agency-ux-architect` & `agency-ui-designer`)

### Paleta de Cores (Extraída da Identidade `@centergrafica`)
- **Primary (Center Royal Blue):** `#0044CC` / `#0055FF` (inspirado no fundo institucional e nos posts da marca)
- **Accent (CMYK Magenta):** `#E6007E` (inspirado nos posts de destaque de frotas e selos de ação)
- **Cyan Print:** `#00B4D8` (apoio visual CMYK)
- **Yellow Print:** `#FFB703` (apoio visual CMYK e selos de destaque)
- **WhatsApp Conversion Green:** `#16A34A` / `#25D366`
- **Suporte nativo a Temas (`Light` / `Dark` / `System`)** na barra de navegação superior, com contraste WCAG AA garantido em ambos os modos.

### Estrutura das Seções da Página
1. **Topbar de Registro Gráfico CMYK + Header Fixo:**
   - Logo Center Gráfica + Mascote Foguete
   - Links de navegação (`Produtos`, `Portfólio Real`, `Montar Orçamento`, `Guia de Arquivos`, `Localização & FAQ`)
   - Seletor de Tema (`Claro`, `Escuro`, `Sistema`)
   - CTA rápido para WhatsApp `(86) 98854-5141`
2. **Hero Section de Alto Impacto:**
   - Headline direta focada em Gráfica Offset, Digital, Embalagens e Comunicação Visual em Teresina com envio para todo o Brasil.
   - Destaque visual com o mascote oficial do foguete e vitrine rápida das 4 linhas principais.
   - Duplo CTA: `"Montar Orçamento em 1 Minuto"` (ancora no simulador) e `"Falar no WhatsApp Agora"` (link direto `wa.me/5586988545141`).
3. **Catálogo Interativo por Linha de Produção (com Filtro e Seleção Rápida):**
   - Filtro por categoria: `Todos`, `Embalagens & Sacolas`, `Frotas & Comunicação Visual`, `Cadernos & Brindes`, `Offset & Digital`.
   - Cada card traz especificações técnicas reais (papéis recomendados, acabamentos como verniz localizado, laminação fosca, hot stamping, alça cordão, vinil automotivo) e botão `"Orçar este item"` que já preenche o simulador abaixo.
4. **Portfólio Real Center Gráfica ("Feito na Center"):**
   - Exibição dos trabalhos reais extraídos do Instagram da gráfica:
     - Sacolas personalizadas (ex: case *Telego.net - Esperantina*)
     - Personalização de frotas comerciais (ex: case *Picape envelopada com QR Code*)
     - Cadernos e agendas corporativas personalizadas (ex: case *Linha Corporativa & Agenda Terrasco*)
5. **Montador de Orçamento Express + Consultor de Pedido (Envio para WhatsApp):**
   - Seleção de Produto, Quantidade/Tiragem, Acabamento, Status da Arte (`Já tenho arquivo pronto`, `Tenho logo mas preciso montar a arte`, `Quero criação completa`), Entrega (`Retirada em Teresina - Macaúba`, `Entrega em Teresina/Região`, `Envio para outro Estado/Cidade` com campo de UF/Cidade), Nome/Empresa e Observações.
   - Preview em tempo real da mensagem que será enviada para o WhatsApp `(86) 98854-5141`.
6. **Ferramenta Gratuita (Lead Magnet Técnico): Verificador & Checklist de Arquivo para Impressão:**
   - Ferramenta interativa onde o cliente marca 4 itens rápidos (Padrão de cor CMYK, Sangria de 3mm, Fontes em curvas, Resolução mínima 300 DPI) e recebe o diagnóstico imediato se o arquivo está pronto para chapa/impressão ou se a equipe de pré-impressão da Center Gráfica deve revisar.
7. **Localização em Teresina, Envio Nacional & Perguntas Frequentes (FAQ):**
   - Endereço completo (`Av. Walter Alencar, 1700 - Bairro Macaúba, Teresina - PI`), telefones `(86) 98854-5141`, `(86) 99510-5888` e `(86) 3229-5141`, link para Google Maps e Instagram `@centergrafica`.
   - FAQ estruturado para responder dúvidas sobre tiragem mínima, prazos de produção, envio por transportadora/Correios/ônibus para outros estados e formatos de arquivo aceitos.
8. **Botão Flutuante de WhatsApp + Footer Institucional.**

---

## 4. Requisitos Técnicos & SEO (`agency-seo-specialist` & `agency-frontend-developer`)

- **Arquitetura:** HTML5 semântico, CSS3 modular (`design-system.css`, `layout.css`, `components.css`, `main.css`) e JavaScript ES Modules (`catalog-data.js`, `quote-engine.js`, `theme-manager.js`, `main.js`) sem dependências pesadas que atrasem o carregamento.
- **Testabilidade (TDD):** Toda a lógica de negócio (filtragem de catálogo, validação de orçamento, cálculo de checklist de pré-impressão e montagem da URL `https://wa.me/5586988545141`) isolada em funções puras testadas via `node --test`.
- **SEO & Dados Estruturados:** JSON-LD `LocalBusiness` + `FAQPage`, meta tags OpenGraph, atributos `alt` descritivos em todas as imagens e navegação acessível via teclado.
- **Copywriting (`humanizer`):** Textos diretos, sem jargões artificiais de IA, sem travessões excessivos, com vocabulário real do setor gráfico brasileiro (tiragem, gramatura, couché, kraft, verniz UV localizado, laminação BOPP, sangria, faca especial, adesivo vinil polimérico).
