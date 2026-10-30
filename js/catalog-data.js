export const PRIMARY_WHATSAPP_NUMBER = '5586988545141';
export const PRIMARY_WHATSAPP_DISPLAY = '(86) 98854-5141';
export const SECONDARY_WHATSAPP_DISPLAY = '(86) 99510-5888';
export const LANDLINE_DISPLAY = '(86) 3229-5141';
export const COMPANY_ADDRESS = 'Av. Walter Alencar, 1700 - Macaúba, Teresina - PI';
export const INSTAGRAM_URL = 'https://instagram.com/centergrafica/';

export const PRODUCT_CATEGORIES = [
  { id: 'todos', label: 'Todos (8)' },
  { id: 'embalagens', label: 'Sacolas & Embalagens' },
  { id: 'comunicacao-visual', label: 'Frotas & Lonas' },
  { id: 'brindes-corporativos', label: 'Agendas & Papelaria' },
  { id: 'offset-digital', label: 'Cartões, Rótulos & Panfletos' }
];

export const CATALOG_PRODUCTS = [
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

export const PORTFOLIO_ITEMS = [
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

export const PREPRESS_CHECKLIST_ITEMS = [
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
