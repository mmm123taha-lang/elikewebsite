export type Language = 'en' | 'ar'
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
export const colors = [
  { id: 'gold', name: 'Honey gold', ar: 'ذهبي عسلي', hex: '#FCB316' },
  { id: 'rose', name: 'Dusty rose', ar: 'وردي هادئ', hex: '#C98288' },
  { id: 'sage', name: 'Sage green', ar: 'أخضر مريمي', hex: '#7E9B86' },
]
export const products = [
  { id: 'heart-keychain', name: 'A little love', ar: 'قلب صغير', category: 'keychains', price: 15, dimensions: '4 × 4 cm', note: 'A little heart, a little everyday joy.', arNote: 'قلب صغير يرافق يومك.', column: 0 },
  { id: 'capsule-keychain', name: 'The everyday tag', ar: 'تعليقة كل يوم', category: 'keychains', price: 15, dimensions: '5 × 2 cm', note: 'Simple, tactile, and easy to find in your bag.', arNote: 'بسيطة وعملية ويسهل العثور عليها في حقيبتك.', column: 1 },
  { id: 'flower-keychain', name: 'Pocket bloom', ar: 'زهرة الجيب', category: 'keychains', price: 15, dimensions: '4.5 × 4.5 cm', note: 'A small flower that never needs watering.', arNote: 'زهرة صغيرة لا تحتاج إلى ماء.', column: 2 },
  { id: 'hex-keychain', name: 'The little hex', ar: 'السداسي الصغير', category: 'keychains', price: 15, dimensions: '4 × 4 cm', note: 'Clean edges. A shape with a little personality.', arNote: 'خطوط أنيقة وشكل له شخصيته.', column: 3 },
  { id: 'ribbed-planter', name: 'A place to grow', ar: 'مكان للنمو', category: 'home', price: 40, dimensions: '8 × 8 cm', note: 'A ribbed little home for your favourite plant. Pot only.', arNote: 'وعاء مخدد لنبتتك المفضلة. الوعاء فقط.', column: 4 },
  { id: 'phone-stand', name: 'Take a little stand', ar: 'حامل صغير', category: 'home', price: 30, dimensions: '8 × 7 × 10 cm', note: 'A comfortable angle for a slower scroll. Stand only.', arNote: 'زاوية مريحة لهاتفك. الحامل فقط.', column: 5 },
] as const
export type Product = typeof products[number]
export type MotifKind = 'heart' | 'flower' | 'rose' | 'leaf' | 'star' | 'moon' | 'diamond' | 'sun' | 'sparkle' | 'paisley' | 'dot' | 'vine'
export type PlacedMotif = { id: string; kind: MotifKind; x: number; y: number; size: number; rotation: number }
export type CartItem = {
  id: string; productId: string; name: string; ar: string; price: number; quantity: number;
  color?: number; column?: number; config?: Record<string, unknown>; thumbnail?: string; assetId?: string;
}
export const money = (n: number, lang: Language) => new Intl.NumberFormat(lang === 'ar' ? 'ar-QA' : 'en-QA', { style: 'currency', currency: 'QAR', maximumFractionDigits: 0 }).format(n)
export const lithoSizes = [{ id: 'small', label: '10 × 15 cm', price: 65 }, { id: 'medium', label: '13 × 18 cm', price: 85 }, { id: 'large', label: '15 × 20 cm', price: 110 }]

export const motifOptions: { kind: MotifKind; en: string; ar: string }[] = [
  { kind: 'heart', en: 'Heart', ar: 'قلب' }, { kind: 'flower', en: 'Flower', ar: 'زهرة' }, { kind: 'rose', en: 'Rose', ar: 'وردة' },
  { kind: 'leaf', en: 'Leaf', ar: 'ورقة' }, { kind: 'star', en: 'Star', ar: 'نجمة' }, { kind: 'moon', en: 'Crescent', ar: 'هلال' },
  { kind: 'diamond', en: 'Diamond', ar: 'معيّن' }, { kind: 'sun', en: 'Sun', ar: 'شمس' }, { kind: 'sparkle', en: 'Sparkle', ar: 'لمعة' },
  { kind: 'paisley', en: 'Paisley', ar: 'نقشة كشميرية' }, { kind: 'dot', en: 'Dot', ar: 'نقطة' }, { kind: 'vine', en: 'Vine', ar: 'غصن' },
]
