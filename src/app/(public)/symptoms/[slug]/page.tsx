import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }

const SYSTEMS: Record<string, { label: string; icon: string }> = {
  head:    { label: 'Голова и шея',        icon: '🧠' },
  chest:   { label: 'Грудная клетка',      icon: '❤️' },
  abdomen: { label: 'Живот и пищеварение', icon: '🫁' },
  skin:    { label: 'Кожа и волосы',       icon: '🫧' },
  joints:  { label: 'Суставы и спина',     icon: '🦴' },
  general: { label: 'Общие симптомы',      icon: '🌡️' },
  neuro:   { label: 'Неврология',          icon: '⚡' },
  urology: { label: 'Урология',            icon: '💧' },
  women:   { label: 'Женское здоровье',    icon: '🌸' },
}

const SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Несрочно — можно обратиться к врачу планово',       color: '#2D7A4F', bg: '#EBF7F1' },
  medium: { label: 'Умеренно — обратитесь к врачу в ближайшее время',   color: '#C8913A', bg: '#FBF3E3' },
  high:   { label: 'Срочно — требуется скорейшая консультация врача',   color: '#8B1F2A', bg: '#F9EAEC' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const symptom = await prisma.symptom.findUnique({ where: { slug } })
  if (!symptom) return { title: 'Симптом не найден — ЗдравИнфо' }
  return {
    title: `${symptom.title} — причины и что делать | ЗдравИнфо`,
    description: symptom.description ?? `Узнайте о симптоме «${symptom.title}»: возможные причины, когда обратиться к врачу и полезные статьи.`,
  }
}

async function getData(slug: string) {
  const [symptom, categories, allSymptoms] = await Promise.all([
    prisma.symptom.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            article: {
              select: {
                id: true, title: true, slug: true, excerpt: true,
                ogImageUrl: true, viewCount: true, publishedAt: true,
                isPublished: true,
                category: { select: { title: true, slug: true } },
                author: { select: { name: true } },
              }
            }
          }
        }
      }
    }),
    prisma.category.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true, slug: true } }),
    prisma.symptom.findMany({ orderBy: [{ bodySystem: 'asc' }, { title: 'asc' }], select: { id: true, title: true, slug: true, bodySystem: true, severity: true } }),
  ])
  return { symptom, categories, allSymptoms }
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function SymptomPage({ params }: Props) {
  const { slug } = await params
  const { symptom, categories, allSymptoms } = await getData(slug)
  if (!symptom) notFound()

  const sys = SYSTEMS[symptom.bodySystem] ?? { label: symptom.bodySystem, icon: '🩺' }
  const sev = SEVERITY[symptom.severity] ?? SEVERITY.medium
  const articles = symptom.articles.map((sa: any) => sa.article).filter((a: any) => a && a.isPublished)
  const sameSystem = allSymptoms.filter((s: any) => s.bodySystem === symptom.bodySystem && s.slug !== slug)

  const catIcons: Record<string, string> = {
    'kardiologiya': '❤️', 'nevrologiya': '🧠', 'gastroenterologiya': '🫁',
    'stomatologiya': '🦷', 'dermatologiya': '🫧', 'pediatriya': '👶',
    'endokrinologiya': '⚗️', 'onkologiya': '🔬', 'travmatologiya': '🦴',
    'khirurgiya': '🩺', 'urologiya': '💧', 'ginekologiya': '🌸',
    'oftalmologiya': '👁️', 'lor': '👂', 'psikhiatriya': '🧩',
    'pulmonologiya': '💨', 'revmatologiya': '💊', 'nefrologiya': '🫘',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --acc-l: #FBF3E3; --rule: #DDD5C5; --white: #FFFFFF;
        }
        .sp { font-family: 'Golos Text', sans-serif; background: var(--bord-d); }
        .sp-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .sp-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .sp-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .sp-logo span { color: var(--acc); }
        .sp-cats { background: var(--bord-m); overflow-x: auto; scrollbar-width: none; }
        .sp-cats::-webkit-scrollbar { display: none; }
        .sp-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .sp-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; } }
        .sp-cat-lnk { display: inline-flex; align-items: center; gap: 5px; padding: 9px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.75); text-decoration: none; white-space: nowrap; transition: color 0.15s; border-bottom: 2px solid transparent; }
        .sp-cat-lnk:hover { color: white; border-bottom-color: var(--acc); }

        /* BREADCRUMB */
        .sp-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .sp-bread-in { max-width: 1200px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .sp-bread a { color: var(--ink-60); text-decoration: none; }
        .sp-bread a:hover { color: var(--bord); }
        .sp-bread-sep { color: var(--rule); }

        /* HERO */
        .sp-hero { background: white; border-bottom: 2px solid var(--ink); padding: 40px 24px 36px; }
        .sp-hero-in { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 280px; gap: 48px; align-items: start; }
        .sp-sys-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bord); margin-bottom: 14px; }
        .sp-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: var(--ink); line-height: 1.15; margin-bottom: 16px; }
        .sp-desc { font-size: 16px; color: var(--ink-60); line-height: 1.7; margin-bottom: 20px; }
        .sp-sev-box { border-radius: 2px; padding: 12px 16px; font-size: 13px; font-weight: 600; line-height: 1.5; }

        /* SIDEBAR */
        .sp-side { }
        .sp-side-box { background: var(--paper); border: 1px solid var(--rule); border-radius: 2px; padding: 20px; margin-bottom: 16px; }
        .sp-side-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--rule); }
        .sp-side-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .sp-side-item a { font-size: 13px; color: var(--ink-60); text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .sp-side-item a:hover { color: var(--bord); }
        .sp-side-item a::before { content: '→'; color: var(--acc); font-size: 11px; }

        /* ARTICLES */
        .sp-body { background: var(--paper); }
        .sp-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 24px 56px; }
        .sp-sec-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .sp-sec-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .sp-sec-line { flex: 1; height: 1px; background: var(--rule); }
        .sp-art-list { display: flex; flex-direction: column; gap: 16px; }
        .sp-art-item { background: white; border: 1px solid var(--rule); border-radius: 2px; display: grid; grid-template-columns: 140px 1fr; gap: 0; text-decoration: none; transition: box-shadow 0.18s; overflow: hidden; }
        .sp-art-item:hover { box-shadow: 0 2px 16px rgba(107,31,42,0.10); }
        .sp-art-img { height: 100px; overflow: hidden; background: var(--bord-l); }
        .sp-art-img img { width: 100%; height: 100%; object-fit: cover; }
        .sp-art-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; opacity: 0.35; }
        .sp-art-body { padding: 14px 18px; }
        .sp-art-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--bord); margin-bottom: 5px; }
        .sp-art-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 6px; }
        .sp-art-exc { font-size: 12px; color: var(--ink-60); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sp-art-meta { font-size: 11px; color: var(--ink-30); margin-top: 8px; }

        .sp-empty { text-align: center; padding: 48px 0; color: var(--ink-60); font-size: 15px; }

        /* FOOTER */
        .sp-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; font-family: 'Golos Text', sans-serif; }
        .sp-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .sp-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .sp-foot-logo span { color: var(--acc); }
        .sp-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .sp-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .sp-foot-lnks a:hover { color: var(--acc); }
        .sp-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 900px) {
          .sp-hero-in { grid-template-columns: 1fr; gap: 24px; }
          .sp-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        }
        @media (max-width: 600px) {
          .sp-title { font-size: 28px; }
          .sp-wrap { padding: 28px 14px 40px; }
          .sp-art-item { grid-template-columns: 100px 1fr; }
          .sp-art-img { height: 90px; }
          .sp-side { grid-template-columns: 1fr; }
          .sp-hero { padding: 28px 14px 24px; }
        }
      `}</style>

      <header className="sp">
        <div className="sp-top">Медицинский информационный портал</div>
        <div className="sp-main">
          <Link href="/" className="sp-logo">Здрав<span>Инфо</span></Link>
        </div>
      </header>

      <div className="sp-cats">
        <div className="sp-cats-in">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="sp-cat-lnk">
              {catIcons[cat.slug] && <span>{catIcons[cat.slug]}</span>}
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="sp-bread">
        <div className="sp-bread-in">
          <Link href="/">Главная</Link>
          <span className="sp-bread-sep">›</span>
          <Link href="/symptoms">Симптомы</Link>
          <span className="sp-bread-sep">›</span>
          <span>{symptom.title}</span>
        </div>
      </div>

      <div style={{ background: 'white' }}>
        <div className="sp-hero">
          <div className="sp-hero-in">
            <div>
              <div className="sp-sys-badge">{sys.icon} {sys.label}</div>
              <h1 className="sp-title">{symptom.title}</h1>
              {symptom.description && <p className="sp-desc">{symptom.description}</p>}
              <div className="sp-sev-box" style={{ background: sev.bg, color: sev.color }}>
                {sev.label}
              </div>
            </div>

            <div className="sp-side">
              {sameSystem.length > 0 && (
                <div className="sp-side-box">
                  <div className="sp-side-ttl">{sys.icon} {sys.label}</div>
                  <ul className="sp-side-list">
                    {sameSystem.slice(0, 8).map((s: any) => (
                      <li key={s.id} className="sp-side-item">
                        <Link href={`/symptoms/${s.slug}`}>{s.title}</Link>
                      </li>
                    ))}
                  </ul>
                  {sameSystem.length > 8 && (
                    <div style={{ marginTop: 10, fontSize: 12 }}>
                      <Link href="/symptoms" style={{ color: 'var(--bord)', textDecoration: 'none' }}>Все симптомы →</Link>
                    </div>
                  )}
                </div>
              )}

              <div className="sp-side-box">
                <div className="sp-side-ttl">🔍 Все разделы</div>
                <ul className="sp-side-list">
                  {[
                    { href: '/symptoms', label: 'Справочник симптомов' },
                    { href: '/contacts', label: 'Задать вопрос' },
                  ].map(l => (
                    <li key={l.href} className="sp-side-item">
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-wrap">
          {articles.length > 0 ? (
            <>
              <div className="sp-sec-hdr">
                <h2 className="sp-sec-ttl">Статьи по теме</h2>
                <div className="sp-sec-line" />
                <span style={{ fontSize: 12, color: 'var(--ink-30)' }}>{articles.length} материалов</span>
              </div>
              <div className="sp-art-list">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="sp-art-item">
                    <div className="sp-art-img">
                      {a.ogImageUrl
                        ? <img src={a.ogImageUrl} alt={a.title} />
                        : <div className="sp-art-ph">🩺</div>}
                    </div>
                    <div className="sp-art-body">
                      {a.category && <div className="sp-art-cat">{a.category.title}</div>}
                      <div className="sp-art-ttl">{a.title}</div>
                      {a.excerpt && <p className="sp-art-exc">{a.excerpt}</p>}
                      <div className="sp-art-meta">{a.author?.name} · {formatDate(a.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="sp-empty">Статьи по этому симптому скоро появятся</div>
          )}
        </div>
      </div>

      <footer className="sp-foot">
        <div className="sp-foot-in">
          <Link href="/" className="sp-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="sp-foot-lnks">
            <Link href="/">Главная</Link>
            <Link href="/symptoms">Симптомы</Link>
            <Link href="/privacy">Конфиденциальность</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className="sp-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Материалы носят образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
