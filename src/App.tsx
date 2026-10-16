import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion, useSpring } from 'motion/react'
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, X, MoveUpRight } from 'lucide-react'
import './App.css'

const brand = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`

const copy = {
  en: {
    nav: 'The possibilities', about: 'How we make it', language: 'العربية', location: 'A small workshop. A world of possibilities.',
    eyebrow: 'IMAGINED BY YOU. MADE BY ELIKE.', title: 'Little ideas.', title2: 'Made real.',
    intro: 'Something useful. Something personal. Something only you could imagine. We’re here to bring it to life, one thoughtful detail at a time.',
    badge: 'Made with care, in Qatar', scroll: 'FIND YOUR STARTING POINT',
    cards: [
      { label: 'THE STORE', title: 'Small things.\nBig personality.', description: 'Everyday objects, with a little more you in them.', action: 'Explore the store', tag: '01 / PICK SOMETHING', detail: 'Useful little objects. Thoughtful gifts. Custom henna stencils. Our collection will bring together pieces made in small batches, with space for your personal touch.' },
      { label: 'YOUR IDEA, YOUR WAY', title: 'What if\nwe made it?', description: 'A spark of an idea is all you need to start.', action: 'Start designing', tag: '02 / MAKE IT YOURS', detail: 'Start with a shape, a name, or a rough idea. The planned designer will help turn your inspiration into a piece we can make in our workshop.' },
      { label: 'THE LITHOPHANE STUDIO', title: 'A memory.\nA different light.', description: 'Turn a photograph into something that glows.', action: 'Make a lithophane', tag: '03 / LIGHT IT UP', detail: 'A lithophane is a finely printed relief that reveals your photograph when light shines through it. The planned studio will let you choose a photo, shape, and finish.' },
    ],
    processEyebrow: 'FROM A SPARK TO SOMETHING YOU CAN HOLD', processTitle: 'A little workshop.\nA lot of possibility.',
    processText: '3D printed objects and precisely cut stencils. We bring digital ideas into the physical world, with patience, curiosity, and an eye for the details.',
    steps: [['01', 'Imagine it', 'A useful fix, a meaningful gift, a just-because idea.'], ['02', 'Make it yours', 'The shape, the detail, the little thing that makes it you.'], ['03', 'We bring it to life', 'Made in our Qatar workshop, one piece at a time.']],
    footer: 'Small-scale making. Endless imagination.', rights: 'ELIKE · Made in Qatar', preview: 'A look at what’s next', soon: 'Coming soon', note: 'This experience is in development. Ordering, design uploads, and payments are not available yet.', close: 'Keep exploring', closeLabel: 'Close preview',
  },
  ar: {
    nav: 'الاحتمالات', about: 'كيف نصنعها', language: 'English', location: 'ورشة صغيرة. وعالم من الاحتمالات.',
    eyebrow: 'من خيالك. إلى واقع تصنعه إيلايك.', title: 'أفكار صغيرة.', title2: 'تصبح حقيقة.',
    intro: 'شيء مفيد. شيء شخصي. شيء لا يخطر إلا ببالك. نحن هنا لنمنحه الحياة، بتفاصيل تصنع الفرق.',
    badge: 'صُنع بعناية في قطر', scroll: 'اختر نقطة البداية',
    cards: [
      { label: 'المتجر', title: 'أشياء صغيرة.\nبشخصية كبيرة.', description: 'قطع يومية تحمل لمسة منك.', action: 'اكتشف المتجر', tag: '٠١ / اختر ما يعجبك', detail: 'قطع عملية صغيرة، وهدايا مميزة، وقوالب حناء مخصصة. ستجمع مجموعتنا قطعاً نصنعها بكميات صغيرة، مع مساحة للمستك الشخصية.' },
      { label: 'فكرتك، بطريقتك', title: 'ماذا لو\nصنعناها؟', description: 'شرارة فكرة تكفي لتبدأ.', action: 'ابدأ التصميم', tag: '٠٢ / أضف لمستك', detail: 'ابدأ بشكل، أو اسم، أو فكرة أولية. ستساعدك أداة التصميم المرتقبة على تحويل إلهامك إلى قطعة يمكننا صنعها في ورشتنا.' },
      { label: 'استوديو الليثوفان', title: 'ذكرى.\nفي ضوء جديد.', description: 'حوّل صورة إلى قطعة تضيء.', action: 'اصنع ليثوفان', tag: '٠٣ / أضئ ذكرياتك', detail: 'الليثوفان نقش مطبوع بدقة يكشف صورتك عندما يمر الضوء عبره. سيتيح لك الاستوديو المرتقب اختيار الصورة والشكل والتفاصيل.' },
    ],
    processEyebrow: 'من شرارة فكرة إلى قطعة بين يديك', processTitle: 'ورشة صغيرة.\nوإمكانات كثيرة.',
    processText: 'قطع مطبوعة بتقنية ثلاثية الأبعاد وقوالب مقصوصة بدقة. نحول الأفكار الرقمية إلى واقع، بصبر وفضول واهتمام بالتفاصيل.',
    steps: [['٠١', 'تخيّلها', 'حل عملي، أو هدية مميزة، أو فكرة بلا مناسبة.'], ['٠٢', 'أضف لمستك', 'الشكل والتفاصيل واللمسة التي تعبّر عنك.'], ['٠٣', 'نمنحها الحياة', 'نصنعها في ورشتنا في قطر، قطعة تلو الأخرى.']],
    footer: 'صناعة صغيرة. وخيال بلا حدود.', rights: 'إيلايك · صُنع في قطر', preview: 'لمحة عمّا هو قادم', soon: 'قريباً', note: 'هذه التجربة قيد التطوير. الطلبات ورفع التصاميم والدفع غير متاحة بعد.', close: 'تابع الاستكشاف', closeLabel: 'إغلاق المعاينة',
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

function Landing() {
  const [language, setLanguage] = useState<'en' | 'ar'>(() => localStorage.getItem('elike-language') === 'ar' ? 'ar' : 'en')
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const reduced = useReducedMotion()
  const t = copy[language]
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('elike-language', language)
  }, [language])
  function open(index: number) { setSelected(index); dialog.current?.showModal() }
  function close() { dialog.current?.close(); setSelected(null) }
  return <>
    <a className="skip-link" href="#main">{language === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
    <header className="site-header wrap">
      <a href="#" className="brand-link" aria-label="ELIKE"><img src={brand('elike-wordmark.svg')} height="34" alt="ELIKE" /></a>
      <nav aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
        <a href="#possibilities">{t.nav}</a><a className="process-nav" href="#process">{t.about}</a>
        <button type="button" className="language-button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} lang={language === 'en' ? 'ar' : 'en'}>{t.language}<ArrowUpRight size={13} aria-hidden="true" /></button>
      </nav>
    </header>
    <main id="main">
      <section className="hero wrap">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
          <p className="eyebrow"><span className="tiny-square" />{t.eyebrow}</p>
          <h1>{t.title}<br /><span className="gold-underline">{t.title2}<svg viewBox="0 0 500 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 14 Q240 -4 495 9" /></svg></span></h1>
          <p className="hero-description">{t.intro}</p>
        </motion.div>
        <div className="hero-aside" aria-hidden="true">
          <div className="bee-orbit"><span className="orbit-cross">+</span><img className="hero-bee" src={brand('elike-bee.svg')} height="105" alt="" /><span className="orbit-dot" /></div>
          <p>{t.badge}</p><span className="aside-line" />
        </div>
        <div className="section-label"><span>{t.scroll}</span><span className="section-rule" /><ArrowDown size={13} aria-hidden="true" /></div>
      </section>
      <section id="possibilities" className="entry-grid wrap" aria-label={t.nav}>
        {t.cards.map((card, index) => <motion.div key={index} className="entry-shell" initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .42, delay: index * .09 }}>
          <Magnetic className={`entry-card card-${index}`} onClick={() => open(index)} label={card.action}>
            <div className="card-top"><span>{card.label}</span><Plus size={18} strokeWidth={1.5} aria-hidden="true" /></div>
            <h2>{card.title}</h2><p className="card-description">{card.description}</p>
            <div className={`object-scene scene-${index}`} aria-hidden="true">
              {index === 0 ? <><div className="scene-ring" /><div className="vase vase-back" /><div className="vase vase-front"><span /></div><div className="object-shadow" /></> : index === 1 ? <><div className="design-grid" /><div className="wire-object"><div /><div /><div /><div /></div><span className="dimension dimension-top">48 mm</span><span className="dimension dimension-bottom">YOUR NEXT IDEA</span><span className="design-cross">+</span></> : <><div className="lamp-glow" /><div className="litho-lamp"><div className="litho-photo"><span className="photo-sun" /><span className="mountain mountain-one" /><span className="mountain mountain-two" /><span className="mountain mountain-three" /></div><div className="lamp-base" /></div><span className="light-dot" /></>}
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
    </main>
    <footer className="site-footer wrap"><a href="#" className="brand-link" aria-label="ELIKE home"><img src={brand('elike-wordmark.svg')} height="25" alt="ELIKE" /></a><p>{t.footer}</p><span>{t.rights}</span></footer>
    <dialog ref={dialog} className="preview-dialog" onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) close() }} aria-labelledby="preview-title">
      <AnimatePresence>{selected !== null && <motion.div key={selected} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="dialog-content">
        <button className="dialog-close" onClick={close} aria-label={t.closeLabel}><X size={22} /></button>
        <p className="eyebrow">{t.preview}</p><span className="coming-soon">{t.soon}</span><h2 id="preview-title">{t.cards[selected].title}</h2><p>{t.cards[selected].detail}</p><p className="preview-note">{t.note}</p><button className="primary-button" onClick={close}>{t.close}<ArrowRight size={18} aria-hidden="true" /></button>
      </motion.div>}</AnimatePresence>
    </dialog>
  </>
}

export default function App() { return <MotionConfig reducedMotion="user"><Landing /></MotionConfig> }
