(function () {
  'use strict';

  const PRIMARY_WHATSAPP_NUMBER = '5586988545141';
  const PRIMARY_WHATSAPP_DISPLAY = '(86) 98854-5141';
  const SECONDARY_WHATSAPP_DISPLAY = '(86) 99510-5888';
  const LANDLINE_DISPLAY = '(86) 3229-5141';
  const COMPANY_ADDRESS = 'Av. Walter Alencar, 1700 - Macaúba, Teresina - PI';
  const INSTAGRAM_URL = 'https://instagram.com/centergrafica/';

  const PRODUCT_CATEGORIES = [
    { id: 'todos', label: 'Todos (8)' },
    { id: 'embalagens', label: 'Sacolas & Embalagens' },
    { id: 'comunicacao-visual', label: 'Frotas & Lonas' },
    { id: 'brindes-corporativos', label: 'Agendas & Papelaria' },
    { id: 'offset-digital', label: 'Cartões, Rótulos & Panfletos' }
  ];

  const CATALOG_PRODUCTS = [
    {
      id: 'sacola-personalizada',
      specCode: 'IMP-01',
      name: 'Sacolas Personalizadas',
      category: 'embalagens',
      categoryLabel: 'Sacolas & Embalagens',
      process: 'Impressão Offset + Corte/Vinco + Ilhós',
      substrate: 'Offset 180g/240g ou Kraft',
      minQty: 250,
      suggestedQuantities: [250, 500, 1000, 3000],
      specs: 'Sacolas estruturadas em papel Offset, Duplex ou Kraft com reforço de fundo, ilhós metálico e alça de cordão ou gorgurão.',
      finishes: [
        'Laminação Fosca + Alça Cordão',
        'Laminação Brilho + Verniz UV Localizado',
        'Kraft Natural de Alta Resistência',
        'Hot Stamping Metálico'
      ],
      badge: 'Mais Pedido',
      leadTime: 'Envio para todo o Brasil',
      icon: 'shopping-bag'
    },
    {
      id: 'caixa-embalagem-personalizada',
      specCode: 'IMP-02',
      name: 'Caixas e Embalagens Sob Medida',
      category: 'embalagens',
      categoryLabel: 'Sacolas & Embalagens',
      process: 'Offset Industrial + Faca Especial',
      substrate: 'Triplex / Duplex 250g a 350g',
      minQty: 500,
      suggestedQuantities: [500, 1000, 2500, 5000],
      specs: 'Embalagens em papel Cartão Triplex ou Duplex com faca de corte e vinco personalizada para lojas, cosméticos, alimentos e envios.',
      finishes: [
        'Laminação Fosca + Verniz Localizado UV',
        'Plastificação Brilho Protetora',
        'Cartão Triplex Impressão Direta',
        'Faca Especial com Visor'
      ],
      badge: 'Sob Medida',
      leadTime: 'Produção seriada em Offset',
      icon: 'box'
    },
    {
      id: 'personalizacao-frotas',
      specCode: 'CV-03',
      name: 'Envelopamento e Adesivagem de Frotas',
      category: 'comunicacao-visual',
      categoryLabel: 'Frotas & Lonas',
      process: 'Impressão Alta Definição + Proteção UV',
      substrate: 'Vinil Automotivo de Alta Performance',
      minQty: 1,
      suggestedQuantities: [1, 3, 5, 10],
      specs: 'Identidade visual para picapes, utilitários e carros comerciais em vinil automotivo resistente ao sol e chuva.',
      finishes: [
        'Envelopamento Parcial (Laterais + Traseira)',
        'Vinil Automotivo + Laminação UV',
        'Envelopamento Total + Perfurado no Vidro',
        'Kit Adesivos de Portas e Capô'
      ],
      badge: 'Alta Durabilidade',
      leadTime: 'Aplicação em Teresina ou envio do kit',
      icon: 'truck'
    },
    {
      id: 'lonas-banners-fachadas',
      specCode: 'CV-04',
      name: 'Lonas, Banners e Adesivos de Vitrine',
      category: 'comunicacao-visual',
      categoryLabel: 'Frotas & Lonas',
      process: 'Plotter Grande Formato 1440 DPI',
      substrate: 'Lona 440g • Vinil Brilho/Fosco/Perfurado',
      minQty: 1,
      suggestedQuantities: [1, 5, 10, 20],
      specs: 'Lonas 440g com ilhós ou bastão, banners promocionais e adesivos para vitrines, fachadas e sinalização interna.',
      finishes: [
        'Lona 440g com Ilhós Metálico',
        'Banner Completo com Bastão e Corda',
        'Adesivo Vinil com Recorte Eletrônico',
        'Adesivo Perfurado para Vitrine'
      ],
      badge: 'Entrega Rápida',
      leadTime: 'Qualquer metragem',
      icon: 'flag'
    },
    {
      id: 'cadernos-agendas-corporativas',
      specCode: 'ED-05',
      name: 'Cadernos e Agendas Personalizadas',
      category: 'brindes-corporativos',
      categoryLabel: 'Agendas & Papelaria',
      process: 'Capa Dura Empastada + Wire-o',
      substrate: 'Capa Dura Laminada + Miolo Offset',
      minQty: 50,
      suggestedQuantities: [50, 100, 300, 500],
      specs: 'Cadernos e agendas capa dura com a marca da sua empresa, encadernação Wire-o metálico, cartela de adesivos e bolso interno.',
      finishes: [
        'Laminação Fosca + Verniz UV na Logo',
        'Laminação Brilho + Elástico',
        'Acabamento Soft Touch + Hot Stamping',
        'Miolo Personalizado com sua Marca'
      ],
      badge: 'Brinde Premium',
      leadTime: 'Kits corporativos e eventos',
      icon: 'book'
    },
    {
      id: 'pastas-blocos-papelaria',
      specCode: 'ED-06',
      name: 'Pastas com Bolsa, Blocos e Receituários',
      category: 'brindes-corporativos',
      categoryLabel: 'Agendas & Papelaria',
      process: 'Impressão Offset + Corte e Vinco',
      substrate: 'Couché 300g (Pastas) • Offset 90g (Blocos)',
      minQty: 100,
      suggestedQuantities: [100, 250, 500, 1000],
      specs: 'Papelaria completa para clínicas, escritórios e empresas: pastas com bolsa interna, blocos de anotação, envelopes e receituários.',
      finishes: [
        'Pasta com Bolsa Colada + Laminação Fosca',
        'Pasta com Orelha + Verniz UV Total',
        'Blocos de Anotação 50 Folhas',
        'Receituários e Talões Numerados'
      ],
      badge: 'Papelaria B2B',
      leadTime: 'Padronização corporativa',
      icon: 'folder'
    },
    {
      id: 'cartao-visita-tags-rotulos',
      specCode: 'OF-07',
      name: 'Cartões de Visita, Tags e Rótulos Adesivos',
      category: 'offset-digital',
      categoryLabel: 'Cartões, Rótulos & Panfletos',
      process: 'Offset / Digital + Meio-Corte',
      substrate: 'Couché 300g • Adesivo BOPP / Vinil',
      minQty: 250,
      suggestedQuantities: [250, 500, 1000, 5000],
      specs: 'Cartões de visita e tags de roupas em Couché 300g, além de rótulos e etiquetas em BOPP resistentes à água e geladeira.',
      finishes: [
        'Couché 300g + Laminação Fosca + Verniz Localizado',
        'Couché 250g + Verniz Total Brilho',
        'Tag de Confecção com Furo + Corte Especial',
        'Rótulo Adesivo BOPP / Vinil Recortado'
      ],
      badge: 'Alto Giro',
      leadTime: 'Tiragens rápidas ou industriais',
      icon: 'id-card'
    },
    {
      id: 'panfleto-couché-catalogos',
      specCode: 'OF-08',
      name: 'Panfletos, Folders, Catálogos e Revistas',
      category: 'offset-digital',
      categoryLabel: 'Cartões, Rótulos & Panfletos',
      process: 'Impressão Offset de Alta Velocidade',
      substrate: 'Couché Brilho/Fosco 115g a 250g',
      minQty: 1000,
      suggestedQuantities: [1000, 2500, 5000, 10000],
      specs: 'Panfletos promocionais, folders com dobras e catálogos de produtos com cores vivas e excelente custo por milheiro.',
      finishes: [
        'Panfleto Couché Brilho 115g (Frente e Verso)',
        'Folder em Couché 150g com Dobras',
        'Catálogo com Grampo Canoa',
        'Catálogo com Lombada Quadrada'
      ],
      badge: 'Melhor Custo/Milheiro',
      leadTime: 'Produção Offset rápida',
      icon: 'layers'
    }
  ];

  const PORTFOLIO_ITEMS = [
    {
      id: 'case-sacolas-telego',
      title: 'Sacolas Personalizadas em Offset',
      client: 'Telego.net',
      category: 'Embalagens',
      substrate: 'Papel Offset 240g com ilhós e alça cordão',
      image: 'assets/images/portfolio-sacolas.png',
      description: 'Impressão frente e verso com cores sólidas, acabamento laminado e reforço estrutural.',
      productRef: 'sacola-personalizada'
    },
    {
      id: 'case-frotas-strada',
      title: 'Personalização de Frota Comercial',
      client: 'Frota Fiat Strada',
      category: 'Comunicação Visual',
      substrate: 'Vinil automotivo com proteção solar UV',
      image: 'assets/images/portfolio-frotas.png',
      description: 'Adesivagem de picapes comerciais com recorte eletrônico e QR Code integrado.',
      productRef: 'personalizacao-frotas'
    },
    {
      id: 'case-cadernos-center',
      title: 'Cadernos e Agendas Corporativas',
      client: 'Linha Executiva Center',
      category: 'Brindes & Papelaria',
      substrate: 'Capa dura laminada + encadernação Wire-o',
      image: 'assets/images/portfolio-agendas.png',
      description: 'Agendas personalizadas para empresas, clínicas e kits de fim de ano.',
      productRef: 'cadernos-agendas-corporativas'
    },
    {
      id: 'case-agenda-terrasco',
      title: 'Caderno Capa Dura com Verniz UV',
      client: 'Terrasco',
      category: 'Brindes & Papelaria',
      substrate: 'Capa dura revestida + garra Wire-o preta',
      image: 'assets/images/portfolio-terrasco.png',
      description: 'Acabamento sofisticado em tom carmim com grafismo e marca em destaque.',
      productRef: 'cadernos-agendas-corporativas'
    }
  ];

  const PREPRESS_CHECKLIST_ITEMS = [
    {
      id: 'cmyk',
      label: 'Cores em padrão CMYK',
      detail: 'Evita variação de tonalidade na impressão.'
    },
    {
      id: 'bleed3mm',
      label: 'Margem de sangria de 3mm',
      detail: 'Evita filetes brancos após o corte.'
    },
    {
      id: 'outlinedFonts',
      label: 'Textos convertidos em curvas (ou PDF fechado)',
      detail: 'Garante que nenhuma fonte seja trocada.'
    },
    {
      id: 'dpi300',
      label: 'Imagens em alta resolução (300 DPI)',
      detail: 'Garante nitidez total nas fotos e logotipos.'
    }
  ];

  function normalizeText(str = '') {
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function filterProducts({ category = 'todos', query = '' } = {}) {
    const normalizedQuery = normalizeText(query);

    return CATALOG_PRODUCTS.filter((product) => {
      const matchesCategory =
        !category || category === 'todos' ? true : product.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeText(
        `${product.id} ${product.name} ${product.categoryLabel} ${product.specs} ${product.finishes.join(' ')}`
      );

      return haystack.includes(normalizedQuery);
    });
  }

  function recommendPrintProcess(productId = '', quantity = 0) {
    const numericQty = Number(quantity);
    const matchedProduct = CATALOG_PRODUCTS.find((p) => p.id === productId);
    const recommendedMinQty = matchedProduct ? matchedProduct.minQty : 100;

    if (!Number.isFinite(numericQty) || numericQty <= 0) {
      return {
        process: matchedProduct ? matchedProduct.process : 'Consultoria Técnica Center Gráfica',
        recommendedMinQty,
        note: `Informe uma quantidade válida (sugestão inicial a partir de ${recommendedMinQty} un.) para calcularmos o melhor aproveitamento de papel.`
      };
    }

    if (matchedProduct?.category === 'comunicacao-visual') {
      return {
        process: 'Impressão Digital Grande Formato / Vinil Automotivo',
        recommendedMinQty,
        note:
          numericQty >= 3
            ? 'Condição especial para frotas ou múltiplas peças de comunicação visual.'
            : 'Impressão em alta resolução resistente a sol e chuva.'
      };
    }

    if (numericQty >= 500 || productId.includes('panfleto') || productId.includes('caixa')) {
      return {
        process: 'Impressão Offset Industrial (Melhor custo unitário)',
        recommendedMinQty,
        note: `Para ${numericQty} unidades, a produção em máquina Offset reduz drasticamente o valor por unidade e garante fidelidade de cor na tiragem inteira.`
      };
    }

    return {
      process: 'Impressão Digital Expressa / Offset Compacto',
      recommendedMinQty,
      note: `Para ${numericQty} unidades, avaliamos entre impressão Digital rápida e montagem coletiva Offset para entregar o melhor prazo e custo.`
    };
  }

  function validateQuoteRequest(payload = {}) {
    const errors = [];
    const productName = String(payload.productName || '').trim();
    const quantity = Number(payload.quantity);
    const customerName = String(payload.customerName || '').trim();
    const deliveryMode = String(payload.deliveryMode || 'retirada-teresina').trim();
    const cityState = String(payload.cityState || '').trim();

    if (!productName) {
      errors.push('Selecione ou informe o produto que deseja orçar.');
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push('Informe uma quantidade válida maior que zero.');
    }

    if (!customerName) {
      errors.push('Informe seu nome ou o nome da sua empresa.');
    }

    if (deliveryMode === 'envio-nacional' && !cityState) {
      errors.push('Informe a Cidade e Estado (UF) para cálculo do envio.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  const DELIVERY_LABELS = {
    'retirada-teresina': 'Retirada no balcão em Teresina-PI (Av. Walter Alencar, 1700 - Macaúba)',
    'entrega-teresina': 'Entrega local em Teresina / Timon',
    'envio-nacional': 'Envio para outra Cidade / Estado (Vendemos para todo o Brasil)'
  };

  function buildWhatsAppMessage(payload = {}) {
    const productName = String(payload.productName || 'Orçamento Personalizado').trim();
    const quantity = Number(payload.quantity) > 0 ? Number(payload.quantity) : 'A definir';
    const finish = String(payload.finish || 'Padrão recomendado pela gráfica').trim();
    const artworkStatus = String(payload.artworkStatus || 'Já tenho a arte pronta').trim();
    const deliveryMode = String(payload.deliveryMode || 'retirada-teresina').trim();
    const cityState = String(payload.cityState || '').trim();
    const customerName = String(payload.customerName || 'Cliente pelo Site').trim();
    const notes = String(payload.notes || '').trim();

    const deliveryDescription =
      deliveryMode === 'envio-nacional' && cityState
        ? `Envio para ${cityState}`
        : DELIVERY_LABELS[deliveryMode] || deliveryMode;

    const lines = [
      'Olá, equipe da *Center Gráfica*! Vim pelo site e gostaria de solicitar um orçamento:',
      '',
      `• *Cliente / Empresa:* ${customerName}`,
      `• *Produto:* ${productName}`,
      `• *Quantidade (Tiragem):* ${quantity}`,
      `• *Acabamento / Especificação:* ${finish}`,
      `• *Situação da Arte:* ${artworkStatus}`,
      `• *Modalidade de Entrega:* ${deliveryDescription}`
    ];

    if (notes) {
      lines.push(`• *Observações / Medidas:* ${notes}`);
    }

    lines.push('', 'Aguardo o retorno com valores e prazo de produção. Obrigado!');

    return lines.join('\n');
  }

  function buildWhatsAppUrl(payload = {}, phone = PRIMARY_WHATSAPP_NUMBER) {
    const cleanPhone = String(phone).replace(/\D/g, '') || PRIMARY_WHATSAPP_NUMBER;
    const text = buildWhatsAppMessage(payload);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  function evaluatePrepressChecklist(checks = {}) {
    const total = PREPRESS_CHECKLIST_ITEMS.length;
    const missingLabels = [];
    let score = 0;

    for (const item of PREPRESS_CHECKLIST_ITEMS) {
      if (Boolean(checks[item.id])) {
        score += 1;
      } else {
        missingLabels.push(item.label);
      }
    }

    const ready = score === total;
    const recommendation = ready
      ? 'Arquivo pronto para pré-impressão! Você pode enviar seu PDF/X-1a, CDR ou AI direto no WhatsApp da Center Gráfica.'
      : `Faltam ${missingLabels.length} ajuste(s) técnico(s) no arquivo. Não se preocupe: marque a opção "Preciso revisar ou criar minha arte" no orçamento que nossa equipe de pré-impressão ajusta para você antes de rodar.`;

    return {
      ready,
      score,
      total,
      missingLabels,
      recommendation
    };
  }

  const THEME_STORAGE_KEY = 'center_grafica_theme_pref';

  const ICONS = {
    'shopping-bag': `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    box: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    book: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
    'id-card': `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`
  };

  const state = {
    activeCategory: 'todos',
    searchQuery: '',
    selectedProductId: CATALOG_PRODUCTS[0].id,
    quantity: CATALOG_PRODUCTS[0].minQty,
    finish: CATALOG_PRODUCTS[0].finishes[0],
    artworkStatus: 'Já tenho a arte pronta (PDF/CDR/AI)',
    deliveryMode: 'retirada-teresina',
    cityState: '',
    customerName: '',
    notes: '',
    prepressChecks: {
      cmyk: true,
      bleed3mm: true,
      outlinedFonts: true,
      dpi300: true
    }
  };

  function initThemeSwitcher() {
    const htmlEl = document.documentElement;
    const buttons = Array.from(document.querySelectorAll('[data-theme-option]'));
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';

    function applyTheme(mode) {
      htmlEl.setAttribute('data-theme', mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      buttons.forEach((btn) => {
        const isSelected = btn.getAttribute('data-theme-option') === mode;
        btn.setAttribute('aria-checked', String(isSelected));
      });
    }

    applyTheme(savedTheme);

    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        applyTheme(btn.getAttribute('data-theme-option'));
      });

      btn.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const next = buttons[(index + 1) % buttons.length];
          next.focus();
          applyTheme(next.getAttribute('data-theme-option'));
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const prev = buttons[(index - 1 + buttons.length) % buttons.length];
          prev.focus();
          applyTheme(prev.getAttribute('data-theme-option'));
        }
      });
    });
  }

  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('primary-nav');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open', !expanded);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });
  }

  function renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = PORTFOLIO_ITEMS.map(
      (item) => `
      <article class="portfolio-card" data-tilt-card>
        <div class="portfolio-card__media">
          <img
            src="${item.image}"
            alt="${item.title} — ${item.client}"
            loading="lazy"
            width="640"
            height="480"
          />
          <span class="portfolio-card__tag">${item.category}</span>
        </div>
        <div class="portfolio-card__body">
          <span class="portfolio-card__client">Cliente: ${item.client}</span>
          <h3 class="portfolio-card__title">${item.title}</h3>
          <p class="portfolio-card__desc">${item.description}</p>
          <div class="portfolio-card__footer">
            <span class="portfolio-card__substrate">${item.substrate}</span>
            <button
              type="button"
              class="btn btn-secondary"
              data-select-product="${item.productRef}"
              aria-label="Orçar projeto similar a ${item.title}"
            >
              Quero um igual
            </button>
          </div>
        </div>
      </article>
    `
    ).join('');

    initTiltCards();
  }

  function initTiltCards() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('[data-tilt-card]');
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        const rotateY = ((x / rect.width) - 0.5) * 6;
        const rotateX = (0.5 - (y / rect.height)) * 6;

        card.style.setProperty('--sheen-x', `${pctX.toFixed(1)}%`);
        card.style.setProperty('--sheen-y', `${pctY.toFixed(1)}%`);
        card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function renderCategoryPills() {
    const container = document.getElementById('catalog-category-pills');
    if (!container) return;

    container.innerHTML = PRODUCT_CATEGORIES.map(
      (cat) => `
      <button
        type="button"
        class="filter-pill"
        data-category="${cat.id}"
        aria-pressed="${state.activeCategory === cat.id}"
      >
        ${cat.label}
      </button>
    `
    ).join('');

    container.querySelectorAll('[data-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.getAttribute('data-category');
        renderCategoryPills();
        renderCatalogGrid();
      });
    });
  }

  function renderCatalogGrid() {
    const grid = document.getElementById('catalog-grid');
    const countEl = document.getElementById('catalog-results-count');
    if (!grid) return;

    const filtered = filterProducts({
      category: state.activeCategory,
      query: state.searchQuery
    });

    if (countEl) {
      countEl.textContent =
        filtered.length === 1
          ? '1 solução encontrada'
          : `${filtered.length} soluções encontradas`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty" role="status">
          <h3>Nenhum item encontrado para "${state.searchQuery}"</h3>
          <p>Produzimos projetos gráficos sob medida. Limpe o filtro ou peça seu orçamento personalizado abaixo.</p>
          <button type="button" class="btn btn-secondary" id="reset-catalog-btn">
            Mostrar todos os produtos
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-catalog-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.activeCategory = 'todos';
          state.searchQuery = '';
          const searchInput = document.getElementById('catalog-search-input');
          if (searchInput) searchInput.value = '';
          renderCategoryPills();
          renderCatalogGrid();
        });
      }
      return;
    }

    grid.innerHTML = filtered
      .map((product) => {
        const isSelected = product.id === state.selectedProductId;
        return `
        <article class="product-card ${isSelected ? 'is-selected' : ''}" data-product-card="${product.id}">
          <div class="product-card__top">
            <div class="product-card__icon">
              ${ICONS[product.icon] || ICONS.layers}
            </div>
            <span class="product-card__badge">${product.badge}</span>
          </div>

          <div>
            <span class="product-card__category">${product.categoryLabel}</span>
            <h3 class="product-card__title">${product.name}</h3>
          </div>

          <p class="product-card__specs">${product.specs}</p>

          <div class="product-card__finishes" aria-label="Acabamentos mais pedidos">
            ${product.finishes
              .slice(0, 3)
              .map((fin) => `<span class="finish-chip">${fin}</span>`)
              .join('')}
          </div>

          <div class="product-card__footer">
            <div class="product-card__min">
              <span>Tiragem sugerida</span>
              <strong>A partir de ${product.minQty} un.</strong>
            </div>
            <button
              type="button"
              class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'}"
              data-select-product="${product.id}"
            >
              ${isSelected ? 'Selecionado' : 'Orçar este item'}
            </button>
          </div>
        </article>
      `;
      })
      .join('');
  }

  function populateProductSelect() {
    const selectEl = document.getElementById('quote-product-select');
    if (!selectEl) return;

    selectEl.innerHTML =
      CATALOG_PRODUCTS.map(
        (prod) => `<option value="${prod.id}">${prod.name}</option>`
      ).join('') +
      `<option value="projeto-sob-medida">Outro material personalizado (Sob medida)</option>`;

    selectEl.value = state.selectedProductId;
  }

  function updateProductDependentFields(productId, preserveQuantity = false) {
    const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
    const finishSelect = document.getElementById('quote-finish-select');
    const qtyInput = document.getElementById('quote-quantity-input');
    const presetsContainer = document.getElementById('quantity-presets');

    if (product) {
      if (!preserveQuantity) {
        state.quantity = product.minQty;
        if (qtyInput) qtyInput.value = String(product.minQty);
      }

      if (finishSelect) {
        finishSelect.innerHTML =
          product.finishes
            .map((fin) => `<option value="${fin}">${fin}</option>`)
            .join('') +
          `<option value="Quero recomendação técnica da Center Gráfica">Quero recomendação da Center Gráfica</option>`;
        state.finish = product.finishes[0];
        finishSelect.value = state.finish;
      }

      if (presetsContainer) {
        presetsContainer.innerHTML = product.suggestedQuantities
          .map(
            (qty) => `
            <button
              type="button"
              class="qty-chip"
              data-preset-qty="${qty}"
              aria-pressed="${Number(state.quantity) === qty}"
            >
              ${qty} un.
            </button>
          `
          )
          .join('');

        presetsContainer.querySelectorAll('[data-preset-qty]').forEach((chip) => {
          chip.addEventListener('click', () => {
            const val = Number(chip.getAttribute('data-preset-qty'));
            state.quantity = val;
            if (qtyInput) qtyInput.value = String(val);
            updateProductDependentFields(state.selectedProductId, true);
            syncQuoteUI();
          });
        });
      }
    } else {
      if (finishSelect) {
        finishSelect.innerHTML = `
          <option value="Quero recomendação da Center Gráfica">Quero recomendação da Center Gráfica</option>
          <option value="Impressão Offset + Acabamento Laminado">Impressão Offset + Acabamento Laminado</option>
          <option value="Comunicação Visual (Vinil / Lona)">Comunicação Visual (Vinil / Lona)</option>
        `;
        state.finish = finishSelect.value;
      }
      if (presetsContainer) {
        presetsContainer.innerHTML = '';
      }
    }
  }

  function syncQuoteUI() {
    const productObj = CATALOG_PRODUCTS.find((p) => p.id === state.selectedProductId);
    const productName = productObj ? productObj.name : 'Projeto Gráfico Sob Medida';

    const recommendation = recommendPrintProcess(state.selectedProductId, state.quantity);
    const recBadge = document.getElementById('process-recommendation-title');
    const recNote = document.getElementById('process-recommendation-note');
    if (recBadge) recBadge.textContent = recommendation.process;
    if (recNote) recNote.textContent = recommendation.note;

    const cityFieldWrapper = document.getElementById('city-state-wrapper');
    if (cityFieldWrapper) {
      cityFieldWrapper.hidden = state.deliveryMode !== 'envio-nacional';
    }

    const payload = {
      productName,
      quantity: state.quantity,
      finish: state.finish,
      artworkStatus: state.artworkStatus,
      deliveryMode: state.deliveryMode,
      cityState: state.cityState,
      customerName: state.customerName || 'Sua Empresa',
      notes: state.notes
    };

    const previewEl = document.getElementById('whatsapp-message-preview');
    if (previewEl) {
      previewEl.textContent = buildWhatsAppMessage(payload);
    }

    const directLink = document.getElementById('whatsapp-direct-preview-link');
    if (directLink) {
      directLink.href = buildWhatsAppUrl(payload);
    }
  }

  function selectProductAndScroll(productId, shouldScroll = true) {
    state.selectedProductId = productId;
    const selectEl = document.getElementById('quote-product-select');
    if (selectEl) selectEl.value = productId;

    updateProductDependentFields(productId, false);
    renderCatalogGrid();
    syncQuoteUI();

    if (shouldScroll) {
      const quoteSection = document.getElementById('orcamento');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function renderPrepressChecklist() {
    const container = document.getElementById('prepress-checklist-items');
    if (!container) return;

    container.innerHTML = PREPRESS_CHECKLIST_ITEMS.map(
      (item) => `
      <label class="checklist-item" for="check-${item.id}">
        <input
          type="checkbox"
          id="check-${item.id}"
          data-check-id="${item.id}"
          ${state.prepressChecks[item.id] ? 'checked' : ''}
        />
        <span class="checklist-item__text">
          <strong>${item.label}</strong>
          <span>${item.detail}</span>
        </span>
      </label>
    `
    ).join('');

    container.querySelectorAll('[data-check-id]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const id = checkbox.getAttribute('data-check-id');
        state.prepressChecks[id] = checkbox.checked;
        updatePrepressStatus();
      });
    });

    updatePrepressStatus();
  }

  function updatePrepressStatus() {
    const statusEl = document.getElementById('prepress-status-box');
    if (!statusEl) return;

    const evaluation = evaluatePrepressChecklist(state.prepressChecks);
    statusEl.className = `prepress-status ${evaluation.ready ? 'is-ready' : 'needs-help'}`;
    statusEl.textContent = evaluation.recommendation;
  }

  function bindEvents() {
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderCatalogGrid();
      });
    }

    document.addEventListener('click', (event) => {
      const selectBtn = event.target.closest('[data-select-product]');
      if (selectBtn) {
        const prodId = selectBtn.getAttribute('data-select-product');
        triggerPressSpring(selectBtn);
        selectProductAndScroll(prodId, true);
      }
    });

    const productSelect = document.getElementById('quote-product-select');
    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        state.selectedProductId = e.target.value;
        updateProductDependentFields(state.selectedProductId, false);
        renderCatalogGrid();
        syncQuoteUI();
      });
    }

    const qtyInput = document.getElementById('quote-quantity-input');
    if (qtyInput) {
      qtyInput.addEventListener('input', (e) => {
        state.quantity = Number(e.target.value);
        updateProductDependentFields(state.selectedProductId, true);
        syncQuoteUI();
      });
    }

    const finishSelect = document.getElementById('quote-finish-select');
    if (finishSelect) {
      finishSelect.addEventListener('change', (e) => {
        state.finish = e.target.value;
        syncQuoteUI();
      });
    }

    const artworkSelect = document.getElementById('quote-artwork-select');
    if (artworkSelect) {
      artworkSelect.addEventListener('change', (e) => {
        state.artworkStatus = e.target.value;
        syncQuoteUI();
      });
    }

    const deliverySelect = document.getElementById('quote-delivery-select');
    if (deliverySelect) {
      deliverySelect.addEventListener('change', (e) => {
        state.deliveryMode = e.target.value;
        syncQuoteUI();
      });
    }

    const cityInput = document.getElementById('quote-city-input');
    if (cityInput) {
      cityInput.addEventListener('input', (e) => {
        state.cityState = e.target.value;
        syncQuoteUI();
      });
    }

    const customerInput = document.getElementById('quote-customer-input');
    if (customerInput) {
      customerInput.addEventListener('input', (e) => {
        state.customerName = e.target.value;
        syncQuoteUI();
      });
    }

    const notesInput = document.getElementById('quote-notes-input');
    if (notesInput) {
      notesInput.addEventListener('input', (e) => {
        state.notes = e.target.value;
        syncQuoteUI();
      });
    }

    const quoteForm = document.getElementById('quote-builder-form');
    const feedbackEl = document.getElementById('quote-form-feedback');

    if (quoteForm) {
      quoteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const productObj = CATALOG_PRODUCTS.find((p) => p.id === state.selectedProductId);
        const productName = productObj ? productObj.name : 'Projeto Gráfico Sob Medida';

        const payload = {
          productName,
          quantity: state.quantity,
          finish: state.finish,
          artworkStatus: state.artworkStatus,
          deliveryMode: state.deliveryMode,
          cityState: state.cityState,
          customerName: state.customerName,
          notes: state.notes
        };

        const validation = validateQuoteRequest(payload);
        if (!validation.valid) {
          if (feedbackEl) {
            feedbackEl.hidden = false;
            feedbackEl.className = 'form-feedback is-error';
            feedbackEl.textContent = validation.errors.join(' ');
          }
          return;
        }

        if (feedbackEl) {
          feedbackEl.hidden = false;
          feedbackEl.className = 'form-feedback is-success';
          feedbackEl.textContent =
            'Abrindo o WhatsApp da Center Gráfica (86) 98854-5141 com seu pedido preenchido...';
        }

        const url = buildWhatsAppUrl(payload);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }

    const copyBtn = document.getElementById('copy-quote-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        triggerPressSpring(copyBtn);
        const previewEl = document.getElementById('whatsapp-message-preview');
        if (!previewEl) return;
        try {
          await navigator.clipboard.writeText(previewEl.textContent);
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Resumo copiado!';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 2200);
        } catch {
          // Fallback silencioso
        }
      });
    }
  }

  function triggerPressSpring(buttonEl, glowEl = null) {
    if (
      typeof window.gsap === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const gsap = window.gsap;
    const tl = gsap.timeline();
    tl.to(buttonEl, {
      scale: 0.92,
      duration: 0.12,
      ease: 'power1.in'
    }).to(buttonEl, {
      scale: 1,
      duration: 0.45,
      ease: 'back.out(2.0)'
    });

    if (glowEl) {
      gsap.fromTo(
        glowEl,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 0.75,
          scale: 1.25,
          duration: 0.28,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        }
      );
    }
  }

  /**
   * Motor autônomo do Ticker do Hero (OpenMontage vertical-spring-ticker):
   * Executa em loop contínuo e resiliente em desktop e mobile,
   * mesmo se o CDN do GSAP falhar, demorar para carregar ou for bloqueado por ad-blocker.
   */
  function initVerticalSpringTicker() {
    const tickerStack = document.getElementById('hf-ticker-stack');
    if (!tickerStack) return;

    const items = tickerStack.querySelectorAll('.hf-ticker-item');
    const stepCount = items.length - 1;
    if (stepCount <= 0) return;

    let currentIndex = 0;
    let isCycling = false;

    function advance() {
      if (isCycling) return;
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const slotHeight = items[0].getBoundingClientRect().height || 54;
      currentIndex++;

      if (isReduced) {
        tickerStack.style.transition = 'opacity 250ms ease';
        tickerStack.style.opacity = '0';
        setTimeout(() => {
          tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;
          tickerStack.style.opacity = '1';
          if (currentIndex >= stepCount) {
            currentIndex = 0;
            tickerStack.style.transform = 'translateY(0px)';
          }
        }, 260);
        return;
      }

      // Curva física OpenMontage: back.out(1.7) overshoot com cubic-bezier
      tickerStack.style.transition = 'transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;

      if (currentIndex >= stepCount) {
        isCycling = true;
        setTimeout(() => {
          tickerStack.style.transition = 'none';
          tickerStack.style.transform = 'translateY(0px)';
          currentIndex = 0;
          isCycling = false;
        }, 580);
      }
    }

    // Avança a cada 2.5 segundos
    setInterval(advance, 2500);

    // Recalcula deslocamento no redimensionamento da janela
    window.addEventListener('resize', () => {
      const slotHeight = items[0].getBoundingClientRect().height || 54;
      tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;
    });
  }

  function initOpenMontageMotion() {
    // 1. O Ticker do Hero é executado de forma autônoma e garantida
    initVerticalSpringTicker();

    // 2. Feedback tátil de clique com press-release-spring
    const heroBtn = document.getElementById('hero-primary-cta');
    const heroGlow = document.getElementById('hero-cta-glow');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        triggerPressSpring(heroBtn, heroGlow);
      });
    }

    // 3. Melhorias opcionais via GSAP (se disponível e permitido pelo usuário)
    if (
      typeof window.gsap === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const gsap = window.gsap;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    // Sublinhado manuscrito em "todo o Brasil"
    const scribblePath = document.getElementById('hf-scribble-path');
    if (scribblePath) {
      gsap.to(scribblePath, {
        strokeDashoffset: 0,
        duration: 0.9,
        delay: 0.45,
        ease: 'power2.inOut'
      });
    }

    // Mesa Gráfica Hero: entrada com profundidade e perspectiva editorial
    const specimenStage = document.getElementById('hero-specimen-stage');
    if (specimenStage) {
      gsap.fromTo(
        specimenStage,
        { y: 26, opacity: 0, rotateY: 4 },
        { y: 0, opacity: 1, rotateY: 0, duration: 0.75, delay: 0.2, ease: 'power2.out' }
      );
    }

    // 5. Faixa de especialidades: loop em CSS (@keyframes hf-marquee-scroll).
    //    A velocidade no hover é controlada por initMarqueeHoverSpeed(), fora deste bloco.

    // 6. ScrollTrigger suave para cards
    if (window.ScrollTrigger) {
      gsap.utils.toArray('.portfolio-card, .feature-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          y: 24,
          opacity: 0,
          duration: 0.55,
          delay: (i % 4) * 0.07,
          ease: 'power2.out'
        });
      });
    }
  }

  function initVerticalTabs() {
    const showcase = document.getElementById('vtabs-showcase');
    if (!showcase) return;

    const tabs = Array.from(showcase.querySelectorAll('[data-vtab-index]'));
    const slides = Array.from(showcase.querySelectorAll('[data-vtab-slide]'));
    const progresses = Array.from(showcase.querySelectorAll('[data-vtab-progress]'));
    const stage = document.getElementById('vtabs-stage');
    const prevBtn = document.getElementById('vtabs-prev');
    const nextBtn = document.getElementById('vtabs-next');

    if (tabs.length === 0 || slides.length === 0) return;

    const AUTO_PLAY_MS = 5000;
    let activeIndex = 0;
    let isPaused = false;
    let progressTween = null;
    let fallbackTimer = null;

    function resetAllProgressBars() {
      progresses.forEach((bar) => {
        if (window.gsap) {
          window.gsap.killTweensOf(bar);
          window.gsap.set(bar, { height: '0%' });
        } else {
          bar.style.height = '0%';
        }
      });
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    }

    function startAutoPlayCycle() {
      resetAllProgressBars();
      if (isPaused) return;

      const currentBar = progresses[activeIndex];
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (window.gsap && currentBar && !reducedMotion) {
        progressTween = window.gsap.fromTo(
          currentBar,
          { height: '0%' },
          {
            height: '100%',
            duration: AUTO_PLAY_MS / 1000,
            ease: 'none',
            onComplete: () => {
              if (!isPaused) {
                goToSlide((activeIndex + 1) % tabs.length, 1);
              }
            }
          }
        );
      } else {
        if (currentBar) currentBar.style.height = '100%';
        fallbackTimer = setTimeout(() => {
          if (!isPaused) {
            goToSlide((activeIndex + 1) % tabs.length, 1);
          }
        }, AUTO_PLAY_MS);
      }
    }

    function goToSlide(nextIndex, direction = 1) {
      if (nextIndex === activeIndex) return;
      const prevIndex = activeIndex;
      activeIndex = nextIndex;

      tabs.forEach((tab, idx) => {
        const isSelected = idx === activeIndex;
        tab.classList.toggle('is-active', isSelected);
        tab.setAttribute('aria-selected', String(isSelected));
      });

      const prevSlide = slides[prevIndex];
      const nextSlide = slides[activeIndex];
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (window.gsap && !reducedMotion && prevSlide && nextSlide) {
        const gsap = window.gsap;
        gsap.killTweensOf([prevSlide, nextSlide]);

        prevSlide.classList.remove('is-active');
        nextSlide.classList.add('is-active');

        gsap.set(prevSlide, { zIndex: 1 });
        gsap.set(nextSlide, {
          zIndex: 2,
          yPercent: direction > 0 ? -100 : 100,
          opacity: 0
        });

        gsap.to(prevSlide, {
          yPercent: direction > 0 ? 100 : -100,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out'
        });

        gsap.to(nextSlide, {
          yPercent: 0,
          opacity: 1,
          duration: 0.62,
          ease: 'back.out(1.22)'
        });
      } else {
        slides.forEach((slide, idx) => {
          slide.classList.toggle('is-active', idx === activeIndex);
        });
      }

      startAutoPlayCycle();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (event) => {
        if (event.target.closest('[data-select-product]')) {
          return;
        }
        if (index === activeIndex) return;
        const dir = index > activeIndex ? 1 : -1;
        isPaused = false;
        goToSlide(index, dir);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextIdx = (activeIndex - 1 + tabs.length) % tabs.length;
        goToSlide(nextIdx, -1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextIdx = (activeIndex + 1) % tabs.length;
        goToSlide(nextIdx, 1);
      });
    }

    slides.forEach((slide) => {
      slide.addEventListener('click', () => {
        const nextIdx = (activeIndex + 1) % tabs.length;
        goToSlide(nextIdx, 1);
      });
    });

    if (stage) {
      stage.addEventListener('mouseenter', () => {
        isPaused = true;
        if (progressTween) progressTween.pause();
        resetAllProgressBars();
      });

      stage.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoPlayCycle();
      });
    }

    startAutoPlayCycle();
  }

  function initMarqueeHoverSpeed() {
    const track = document.getElementById('hf-marquee-track');
    if (!track || typeof track.getAnimations !== 'function') return;

    const HOVER_RATE = 80 / 25; // 80s -> 25s
    const RAMP_MS = 600;
    let rafId = null;

    const getLoop = () =>
      track.getAnimations().find((a) => a.animationName === 'hf-marquee-scroll');

    const rampTo = (target) => {
      const loop = getLoop();
      if (!loop) return;
      cancelAnimationFrame(rafId);
      const start = loop.playbackRate;
      const t0 = performance.now();

      const step = (now) => {
        const p = Math.min(1, (now - t0) / RAMP_MS);
        const eased = 1 - Math.pow(1 - p, 3);
        loop.playbackRate = start + (target - start) * eased;
        if (p < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    track.addEventListener('mouseenter', () => rampTo(HOVER_RATE));
    track.addEventListener('mouseleave', () => rampTo(1));
  }

  /**
   * Mesa de Amostras Grafica no Hero (Decisao UX/UI):
   * Substitui os 4 mini-cards fragmentados por um palco de lamina unica,
   * com transicao suave, seletor tatil e pausa no hover.
   */
  function initHeroSpecimenStage() {
    const stage = document.getElementById('hero-specimen-stage');
    if (!stage) return;

    const slides = Array.from(stage.querySelectorAll('.hf-showcase-card, .specimen-slide'));
    const pills = Array.from(stage.querySelectorAll('.specimen-pill'));
    if (slides.length === 0) return;

    let currentIndex = 0;
    let isPaused = false;
    let timer = null;

    function goToSpecimen(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === currentIndex);
      });
      pills.forEach((pill, i) => {
        const active = i === currentIndex;
        pill.classList.toggle('is-active', active);
        pill.setAttribute('aria-selected', String(active));
      });
    }

    function startCycle() {
      stopCycle();
      if (isPaused) return;
      timer = setInterval(() => {
        if (!isPaused) {
          goToSpecimen(currentIndex + 1);
        }
      }, 4500);
    }

    function stopCycle() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    pills.forEach((pill, i) => {
      pill.addEventListener('click', () => {
        goToSpecimen(i);
        startCycle();
      });
    });

    stage.addEventListener('mouseenter', () => {
      isPaused = true;
      stopCycle();
    });

    stage.addEventListener('mouseleave', () => {
      isPaused = false;
      startCycle();
    });

    startCycle();
  }

  function initApp() {
    initThemeSwitcher();
    initMobileMenu();
    initHeroSpecimenStage();
    renderPortfolio();
    initVerticalTabs();
    initMarqueeHoverSpeed();
    renderCategoryPills();
    populateProductSelect();
    updateProductDependentFields(state.selectedProductId, false);
    renderCatalogGrid();
    renderPrepressChecklist();
    syncQuoteUI();
    bindEvents();
    initOpenMontageMotion();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
})();
