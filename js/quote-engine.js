import {
  CATALOG_PRODUCTS,
  PREPRESS_CHECKLIST_ITEMS,
  PRIMARY_WHATSAPP_NUMBER
} from './catalog-data.js';

/**
 * Remove acentos e normaliza string para busca textual
 */
export function normalizeText(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra os produtos do catálogo por categoria e busca textual sem acentos
 */
export function filterProducts({ category = 'todos', query = '' } = {}) {
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

/**
 * Recomenda o processo produtivo ideal (Offset vs Digital vs Comunicação Visual)
 * com base no produto selecionado e na tiragem desejada.
 */
export function recommendPrintProcess(productId = '', quantity = 0) {
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

/**
 * Valida os dados do formulário do Montador de Orçamento antes de enviar ao WhatsApp
 */
export function validateQuoteRequest(payload = {}) {
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

/**
 * Monta a mensagem técnica estruturada para o atendimento comercial no WhatsApp
 */
export function buildWhatsAppMessage(payload = {}) {
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

/**
 * Gera a URL oficial wa.me para o WhatsApp principal (86) 98854-5141
 */
export function buildWhatsAppUrl(payload = {}, phone = PRIMARY_WHATSAPP_NUMBER) {
  const cleanPhone = String(phone).replace(/\D/g, '') || PRIMARY_WHATSAPP_NUMBER;
  const text = buildWhatsAppMessage(payload);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Avalia o checklist de fechamento de arquivo (pré-impressão)
 */
export function evaluatePrepressChecklist(checks = {}) {
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
