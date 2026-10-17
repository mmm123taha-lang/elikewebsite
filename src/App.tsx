import { lazy, Suspense, useEffect, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AnimatePresence, motion, MotionConfig, useReducedMotion, useSpring } from 'motion/react'
import { ArrowUpRight, ArrowDown, Plus, MoveUpRight, ShoppingBag, UserRound, X, Check } from 'lucide-react'
import { Bee } from './components/Bee'
import { Motif } from './components/shop/Motif'
import { asset } from './lib/catalog'
import type { CartItem, Language } from './lib/catalog'
import { backend } from './lib/backend'
import { readSaved, save } from './lib/persistence'
import './App.css'
import './Shop.css'
const Store = lazy(() => import('./components/shop/Store').then(m => ({ default: m.Store })))
const Henna = lazy(() => import('./components/shop/Henna').then(m => ({ default: m.Henna })))
const Lithophane = lazy(() => import('./components/shop/Lithophane').then(m => ({ default: m.Lithophane })))
const Cart = lazy(() => import('./components/shop/Commerce').then(m => ({ default: m.Cart })))
const Account = lazy(() => import('./components/shop/Commerce').then(m => ({ default: m.Account })))
const Checkout = lazy(() => import('./components/shop/Commerce').then(m => ({ default: m.Checkout })))
const Orders = lazy(() => import('./components/shop/Commerce').then(m => ({ default: m.Orders })))
const brand = (file: string) => asset(`brand/${file}`)
const copy = {
  en: {
    nav: 'The possibilities', about: 'How we make it', language: 'العربية', location: 'A small workshop. A world of possibilities.',
    eyebrow: 'IMAGINED BY YOU. MADE BY ELIKE.', title: 'Little ideas.', title2: 'Made real.',
    intro: 'Something useful. Something personal. Something only you could imagine. We’re here to bring it to life, one thoughtful detail at a time.',
    badge: 'Made with care, in Qatar', scroll: 'FIND YOUR STARTING POINT',
    cards: [
      { label: 'THE STORE', title: 'Small things.\nBig personality.', description: 'Everyday objects, with a little more you in them.', action: 'Explore the store', tag: '01 / PICK SOMETHING', detail: 'Useful little objects. Thoughtful gifts. Custom henna stencils. Our collection will bring together pieces made in small batches, with space for your personal touch.' },
      { label: 'THE HENNA STUDIO', title: 'A little art.\nA little of you.', description: 'Your own pattern. Your own kind of beautiful.', action: 'Design your henna', tag: '02 / YOUR OWN PATTERN', detail: 'Start with a shape, a name, or a rough idea. The planned designer will help turn your inspiration into a piece we can make in our workshop.' },
      { label: 'THE LITHOPHANE STUDIO', title: 'A memory.\nA different light.', description: 'Turn a photograph into something that glows.', action: 'Make a lithophane', tag: '03 / LIGHT IT UP', detail: 'A lithophane is a finely printed relief that reveals your photograph when light shines through it. The planned studio will let you choose a photo, shape, and finish.' },
    ],
    processEyebrow: 'FROM A SPARK TO SOMETHING YOU CAN HOLD', processTitle: 'A little workshop.\nA lot of possibility.',
    processText: '3D printed objects and precisely cut stencils. We bring digital ideas into the physical world, with patience, curiosity, and an eye for the details.',
    steps: [['01', 'Imagine it', 'A useful fix, a meaningful gift, a just-because idea.'], ['02', 'Make it yours', 'The shape, the detail, the little thing that makes it you.'], ['03', 'We bring it to life', 'Made in our Qatar workshop, one piece at a time.']],
    footer: 'Small-scale making. Endless imagination.', rights: 'ELIKE · Made in Qatar', preview: 'A look at what’s next', soon: 'Coming soon', note: 'This experience is in development. Ordering, design uploads, and payments are not available yet.', close: 'Keep exploring', closeLabel: 'Close preview',
  },
  ar: {
    nav: 'الاحتمالات', about: 'كيف نصنعها', language: 'English', location: 'ورشة صغيرة. وعالم من الاحتمالات.',
    eyebrow: 'من خيالك. إلى واقع تصنعه إليك.', title: 'أفكار صغيرة.', title2: 'تصبح حقيقة.',
    intro: 'شيء مفيد. شيء شخصي. شيء لا يخطر إلا ببالك. نحن هنا لنمنحه الحياة، بتفاصيل تصنع الفرق.',
    badge: 'صُنع بعناية في قطر', scroll: 'اختر نقطة البداية',
    cards: [
      { label: 'المتجر', title: 'أشياء صغيرة.\nبشخصية كبيرة.', description: 'قطع يومية تحمل لمسة منك.', action: 'اكتشف المتجر', tag: '٠١ / اختر ما يعجبك', detail: 'قطع عملية صغيرة، وهدايا مميزة، وقوالب حناء مخصصة. ستجمع مجموعتنا قطعاً نصنعها بكميات صغيرة، مع مساحة للمستك الشخصية.' },
      { label: 'استوديو الحنّة', title: 'فن صغير.\nبلمستك أنت.', description: 'نقشتك الخاصة. وجمالك الخاص.', action: 'صمّم الحنّة', tag: '٠٢ / نقشتك الخاصة', detail: 'ابدأ بشكل، أو اسم، أو فكرة أولية. ستساعدك أداة التصميم المرتقبة على تحويل إلهامك إلى قطعة يمكننا صنعها في ورشتنا.' },
      { label: 'استوديو الليثوفان', title: 'ذكرى.\nفي ضوء جديد.', description: 'حوّل صورة إلى قطعة تضيء.', action: 'اصنع ليثوفان', tag: '٠٣ / أضئ ذكرياتك', detail: 'الليثوفان نقش مطبوع بدقة يكشف صورتك عندما يمر الضوء عبره. سيتيح لك الاستوديو المرتقب اختيار الصورة والشكل والتفاصيل.' },
    ],
    processEyebrow: 'من شرارة فكرة إلى قطعة بين يديك', processTitle: 'ورشة صغيرة.\nوإمكانات كثيرة.',
    processText: 'قطع مطبوعة بتقنية ثلاثية الأبعاد وقوالب مقصوصة بدقة. نحول الأفكار الرقمية إلى واقع، بصبر وفضول واهتمام بالتفاصيل.',
    steps: [['٠١', 'تخيّلها', 'حل عملي، أو هدية مميزة، أو فكرة بلا مناسبة.'], ['٠٢', 'أضف لمستك', 'الشكل والتفاصيل واللمسة التي تعبّر عنك.'], ['٠٣', 'نمنحها الحياة', 'نصنعها في ورشتنا في قطر، قطعة تلو الأخرى.']],
    footer: 'صناعة صغيرة. وخيال بلا حدود.', rights: 'إليك · صُنع في قطر', preview: 'لمحة عمّا هو قادم', soon: 'قريباً', note: 'هذه التجربة قيد التطوير. الطلبات ورفع التصاميم والدفع غير متاحة بعد.', close: 'تابع الاستكشاف', closeLabel: 'إغلاق المعاينة',
  },
}

function Magnetic({ children, className, onClick, label }: { children: ReactNode; className: string; onClick: () => void; label: string }) {
  const reduced = useReducedMotion()
  const rotateX = useSpring(0, { stiffness: 220, damping: 28 })
  const rotateY = useSpring(0, { stiffness: 220, damping: 28 })
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    rotateY.set(((event.clientX - rect.left) / rect.width - .5) * 8)
    rotateX.set(-((event.clientY - rect.top) / rect.height - .5) * 8)
  }
  return <motion.button type="button" className={className} aria-label={label} style={{ rotateX, rotateY }} onPointerMove={move} onPointerLeave={() => { rotateX.set(0); rotateY.set(0) }} onClick={onClick} whileHover={reduced ? undefined : { y: -5 }} whileTap={reduced ? undefined : { scale: .99 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>{children}</motion.button>
}

function Home({ language }: { language: Language }) {
  const t = copy[language], reduced = useReducedMotion()
  return <>
      <section className="hero wrap">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
          <p className="eyebrow"><span className="tiny-square" />{t.eyebrow}</p>
          <h1>{t.title}<br /><span className="gold-underline">{t.title2}<svg viewBox="0 0 500 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 14 Q240 -4 495 9" /></svg></span></h1>
          <p className="hero-description">{t.intro}</p>
        </motion.div>
        <div className="hero-aside" aria-hidden="true">
          <div className="bee-orbit"><span className="orbit-cross">+</span><Bee /><span className="orbit-dot" /></div>
          <p>{t.badge}</p><span className="aside-line" />
        </div>
        <div className="section-label"><span>{t.scroll}</span><span className="section-rule" /><ArrowDown size={13} aria-hidden="true" /></div>
      </section>
      <section id="possibilities" className="entry-grid wrap" aria-label={t.nav}>
        {t.cards.map((card, index) => <motion.div key={index} className="entry-shell" initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .42, delay: index * .09 }}>
          <Magnetic className={`entry-card card-${index}`} onClick={() => { location.hash = ['store', 'henna', 'lithophane'][index] }} label={card.action}>
            <div className="card-top"><span>{card.label}</span><Plus size={18} strokeWidth={1.5} aria-hidden="true" /></div>
            <h2>{card.title}</h2><p className="card-description">{card.description}</p>
            <div className={`object-scene scene-${index}`} aria-hidden="true">
              {index === 0 ? <><div className="scene-ring" /><div className="vase vase-back" /><div className="vase vase-front"><span /></div><div className="object-shadow" /></> : index === 1 ? <><div className="henna-card-art"><svg viewBox="0 0 350 170" aria-hidden="true"><g color="#EBD7B5"><g transform="translate(18 45) scale(.85)"><Motif kind="paisley" /></g><g transform="translate(125 25) scale(1.1)"><Motif kind="flower" /></g><g transform="translate(245 45) scale(.85)"><Motif kind="heart" /></g><path d="M20 150H330" stroke="currentColor" strokeDasharray="2 8" /></g></svg><span>15 × 3 cm</span></div></> : <><div className="lamp-glow" /><div className="litho-lamp"><div className="litho-photo"><span className="photo-sun" /><span className="mountain mountain-one" /><span className="mountain mountain-two" /><span className="mountain mountain-three" /></div><div className="lamp-base" /></div><span className="light-dot" /></>}
              <img className="card-bee" src={brand(`elike-bee-${index === 0 ? 'ink' : 'flat'}.svg`)} height="23" alt="" />
            </div>
            <div className="card-bottom"><span>{card.action}</span><span className="card-arrow"><ArrowUpRight size={21} aria-hidden="true" /></span></div>
          </Magnetic>
          <p className="card-caption"><span>{card.tag}</span><ArrowUpRight size={13} aria-hidden="true" /></p>
        </motion.div>)}
      </section>
      <section id="process" className="process wrap">
        <div className="process-heading"><p className="eyebrow">{t.processEyebrow}</p><h2>{t.processTitle}</h2><p>{t.processText}</p></div>
        <div className="steps">{t.steps.map(([number, title, description]) => <div className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div><MoveUpRight size={18} aria-hidden="true" /></div>)}</div>
      </section>
      <section className="closing wrap"><img src={brand('elike-bee-flat.svg')} height="28" alt="" /><p>{t.location}</p></section>

  </>
}

const routes = ['home', 'store', 'henna', 'lithophane', 'cart', 'checkout', 'account', 'orders'] as const
type Route = typeof routes[number]
function readRoute(): Route { const hash = location.hash.slice(1); return routes.includes(hash as Route) ? hash as Route : new URLSearchParams(location.search).get('view') === 'orders' ? 'orders' : new URLSearchParams(location.search).get('view') === 'account' ? 'account' : 'home' }
function readCart() { const saved = readSaved<unknown>('elike-bag', []); if (!Array.isArray(saved)) return []; return (saved as CartItem[]).filter(item => item && typeof item.id === 'string' && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20).slice(0, 30) }
function Website() {
  const [language, setLanguage] = useState<Language>(() => readSaved('elike-language-v2', 'en'))
  const [route, setRoute] = useState<Route>(readRoute)
  const [items, setItems] = useState<CartItem[]>(readCart)
  const [session, setSession] = useState<Session | null>(null)
  const [notice, setNotice] = useState('')
  const ar = language === 'ar', t = copy[language]
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = ar ? 'rtl' : 'ltr'; document.title = ar ? 'إليك — أفكار صغيرة. تصبح حقيقة.' : 'ELIKE — Little ideas. Made real.'; save('elike-language-v2', language) }, [language, ar])
  useEffect(() => {
    const change = () => setRoute(readRoute()); window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => { window.scrollTo(0, 0); const main = document.getElementById('main'); main?.focus({ preventScroll: true }) }, [route])
  function updateBag(next: CartItem[]) { setItems(next); if (!save('elike-bag', next)) setNotice(ar ? 'تعذّر حفظ الحقيبة في هذا المتصفح. احتفظ بهذه الصفحة مفتوحة.' : 'Your bag could not be saved in this browser. Please keep this tab open.') }
  useEffect(() => {
    if (!backend) return
    let active = true
    backend.auth.getSession().then(({ data, error }) => { if (active) { if (error) setNotice(ar ? 'تعذّر استعادة جلسة الدخول.' : 'Your sign-in session could not be restored.'); else setSession(data.session) } })
    const { data } = backend.auth.onAuthStateChange((_event, session) => { if (active) setSession(session) })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [ar])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer) }, [notice])
  function add(item: CartItem) {
    if (items.length >= 30 && !items.find(i => i.id === item.id)) { setNotice(ar ? 'الحقيبة ممتلئة. الحد الأقصى ٣٠ تصميماً.' : 'Your bag can hold up to 30 different designs.'); return }
    const old = items.find(i => i.id === item.id); updateBag(old ? items.map(i => i.id === item.id ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i) : [...items, item])
    setNotice(ar ? 'أُضيف إلى حقيبتك.' : 'A little something added to your bag.')
  }
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  return <>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus() }}>{ar ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
    <header className="site-header wrap shop-header"><a href="#home" className="brand-link" aria-label={ar ? 'إليك — الرئيسية' : 'ELIKE home'}><img src={brand('elike-wordmark.svg')} height="34" alt={ar ? 'إليك' : 'ELIKE'} /></a><nav className="desktop-shop-nav" aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}><a href="#store" aria-current={route === 'store' ? 'page' : undefined}>{ar ? 'المتجر' : 'The store'}</a><a href="#henna" aria-current={route === 'henna' ? 'page' : undefined}>{ar ? 'حنّة' : 'Henna'}</a><a href="#lithophane" aria-current={route === 'lithophane' ? 'page' : undefined}>{ar ? 'ليثوفان' : 'Lithophanes'}</a></nav><div className="header-actions"><button type="button" className="language-button" onClick={() => setLanguage(ar ? 'en' : 'ar')} lang={ar ? 'en' : 'ar'}>{t.language}</button><a href="#account" className="icon-button account-link" aria-label={session ? (ar ? 'حسابي' : 'Your account') : (ar ? 'تسجيل الدخول' : 'Sign in')}><UserRound size={20} />{session && <span className="account-dot" />}</a><a href="#cart" className="icon-button bag-link" aria-label={`${ar ? 'الحقيبة' : 'Shopping bag'}, ${count}`}><ShoppingBag size={20} />{count > 0 && <span className="bag-count">{count}</span>}</a></div></header>
    <nav className="mobile-shop-nav wrap" aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}><a href="#store" aria-current={route === 'store' ? 'page' : undefined}>{ar ? 'المتجر' : 'The store'}</a><a href="#henna" aria-current={route === 'henna' ? 'page' : undefined}>{ar ? 'حنّة' : 'Henna'}</a><a href="#lithophane" aria-current={route === 'lithophane' ? 'page' : undefined}>{ar ? 'ليثوفان' : 'Lithophanes'}</a></nav>
    <main id="main" tabIndex={-1}><Suspense fallback={<div className="wrap loading-page" role="status">{ar ? 'لحظة، نجهّز التفاصيل…' : 'Just a moment. Making room for little things…'}</div>}>
      {route === 'home' && <Home language={language} />}{route === 'store' && <Store lang={language} add={add} />}{route === 'henna' && <Henna lang={language} add={add} />}{route === 'lithophane' && <Lithophane lang={language} add={add} />}{route === 'cart' && <Cart lang={language} items={items} change={(id, quantity) => updateBag(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, Math.min(20, quantity)) } : i).filter(i => i.quantity > 0))} />}{route === 'checkout' && <Checkout lang={language} items={items} session={session} />}{route === 'account' && <Account lang={language} session={session} />}{route === 'orders' && <Orders lang={language} session={session} />}
    </Suspense></main>
    <footer className="site-footer wrap"><a href="#home" className="brand-link" aria-label={ar ? 'إليك — الرئيسية' : 'ELIKE home'}><img src={brand('elike-wordmark.svg')} height="25" alt={ar ? 'إليك' : 'ELIKE'} /></a><p>{t.footer}</p><span>{t.rights}</span></footer>
    <AnimatePresence>{notice && <motion.div role="status" className="bag-toast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Check size={17} /><span>{notice}</span><a href="#cart">{ar ? 'عرض الحقيبة' : 'View bag'}</a><button className="icon-button" aria-label={ar ? 'إغلاق التنبيه' : 'Dismiss notification'} onClick={() => setNotice('')}><X size={16} /></button></motion.div>}</AnimatePresence>
  </>
}
export default function App() { return <MotionConfig reducedMotion="user"><Website /></MotionConfig> }
