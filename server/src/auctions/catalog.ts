export interface CatalogItem {
  title: string;
  description: string;
  emoji: string;
  price: number;
  increment: number;
}

export const CATALOG: CatalogItem[] = [
  {
    title: "Guitarra Stratocaster 1978",
    description: "Sunburst, captadores originais, case de época.",
    emoji: "🎸",
    price: 4500,
    increment: 100,
  },
  {
    title: "Câmera analógica Leica M3",
    description: "Lente Summicron 50mm, revisada.",
    emoji: "📷",
    price: 6000,
    increment: 150,
  },
  {
    title: "Relógio de bolso suíço",
    description: "Ouro 18k, por volta de 1920, funcionando.",
    emoji: "⌚",
    price: 2500,
    increment: 50,
  },
  {
    title: "Console retrô na caixa",
    description: "Lacrado, item de colecionador.",
    emoji: "🕹️",
    price: 1200,
    increment: 25,
  },
  {
    title: "Vinil autografado",
    description: "Primeira prensagem, autógrafo certificado.",
    emoji: "💿",
    price: 800,
    increment: 20,
  },
  {
    title: "Bicicleta vintage italiana",
    description: "Quadro de aço Columbus, anos 70.",
    emoji: "🚲",
    price: 3200,
    increment: 50,
  },
];
