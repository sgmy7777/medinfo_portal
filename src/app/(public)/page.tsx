import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 10

async function getArticles(page = 1) {
  try {
    return await prisma.article.findMany({
      where: { isPublished: true },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        ogImageUrl: true, viewCount: true, publishedAt: true,
        category: { select: { title: true, slug: true, color: true } },
        author: { select: { name: true, specialty: true } },
      },
    })
  } catch { return [] }
}

async function getArticlesCount() {
  try { return await prisma.article.count({ where: { isPublished: true } }) }
  catch { return 0 }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true, color: true, _count: { select: { articles: true } } },
    })
  } catch { return [] }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const catIcons: Record<string, string> = {
  'kardiologiya': '❤️', 'nevrologiya': '🧠', 'gastroenterologiya': '🫁',
  'stomatologiya': '🦷', 'dermatologiya': '🫧', 'pediatriya': '👶',
  'endokrinologiya': '⚗️', 'onkologiya': '🔬', 'travmatologiya': '🦴',
  'khirurgiya': '🩺', 'urologiya': '💧', 'ginekologiya': '🌸',
  'oftalmologiya': '👁️', 'lor': '👂', 'psikhiatriya': '🧩',
  'pulmonologiya': '🫁', 'revmatologiya': '💊', 'nefrologiya': '🫘',
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1)
  const [articles, categories, total] = await Promise.all([getArticles(page), getCategories(), getArticlesCount()])
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const [hero, ...rest] = articles as any[]
  const todayStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bord: #6B1F2A;
          --bord-d: #4A0F17;
          --bord-l: #F5EBE8;
          --bord-m: #8B2D3A;
          --paper: #F7F2EA;
          --paper-d: #EDE5D8;
          --paper-dd: #E0D5C4;
          --ink: #1C1208;
          --ink-60: #5A4A38;
          --ink-30: #9A8A78;
          --acc: #C8913A;
          --acc-l: #F5EDD8;
          --rule: #D8CCBA;
          --white: #FFFDF9;
        }

        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }
        .serif { font-family: 'Playfair Display', serif; }

        /* ── HEADER ── */
        .zh { background: var(--bord-d); }
        .zh-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .zh-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .zh-top-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acc); }
        .zh-top-date { font-size: 11px; color: rgba(255,255,255,0.3); font-style: italic; }
        .zh-main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .zh-logo { text-decoration: none; }
        .zh-logo-text { font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 900; color: white; letter-spacing: -2px; line-height: 1; text-align: center; }
        .zh-logo-text span { color: var(--acc); }
        .zh-logo-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.22em; text-transform: uppercase; margin-top: 4px; text-align: center; }
        .zh-nav { display: flex; gap: 2px; }
        .zh-nav a { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.55); text-decoration: none; padding: 6px 14px; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; border-bottom: 2px solid transparent; }
        .zh-nav a:hover { color: var(--acc); border-bottom-color: var(--acc); }

        /* ── CAT BAR ── */
        .zh-cats { background: var(--bord); border-bottom: 1px solid var(--bord-d); overflow-x: auto; scrollbar-width: none; }
        .zh-cats::-webkit-scrollbar { display: none; }
        .zh-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        .zh-cat-lnk { padding: 9px 15px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.65); text-decoration: none; white-space: nowrap; transition: all 0.15s; display: flex; align-items: center; gap: 5px; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid transparent; }
        .zh-cat-lnk:hover { color: white; background: rgba(0,0,0,0.15); border-bottom-color: var(--acc); }
        .zh-cat-cnt { font-size: 9px; opacity: 0.5; font-weight: 400; }

        /* ── LAYOUT ── */
        .zh-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ── HERO ── */
        .zh-hero { padding: 40px 0 0; border-bottom: 1px solid var(--rule); margin-bottom: 40px; }
        .zh-hero-grid { display: grid; grid-template-columns: 1fr 300px; gap: 40px; margin-bottom: 40px; }

        .zh-hero-img { position: relative; overflow: hidden; border-radius: 2px; aspect-ratio: 16/9; background: linear-gradient(135deg, var(--bord-d) 0%, var(--bord-m) 100%); margin-bottom: 20px; }
        .zh-hero-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .zh-hero-main:hover .zh-hero-img img { transform: scale(1.04); }
        .zh-hero-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 72px; opacity: 0.5; }

        .zh-hero-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bord); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .zh-hero-cat::before { content: ''; display: inline-block; width: 20px; height: 2px; background: var(--bord); }
        .zh-hero-ttl { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; line-height: 1.22; color: var(--ink); margin-bottom: 12px; text-decoration: none; display: block; transition: color 0.2s; }
        .zh-hero-ttl:hover { color: var(--bord); }
        .zh-hero-exc { font-size: 15px; color: var(--ink-60); line-height: 1.7; margin-bottom: 14px; }
        .zh-hero-meta { font-size: 12px; color: var(--ink-30); display: flex; align-items: center; gap: 8px; }
        .zh-hero-author { font-weight: 600; color: var(--ink-60); }
        .zh-dot { color: var(--rule); }
        .zh-read-lnk { font-size: 12px; font-weight: 700; color: var(--bord); text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; transition: gap 0.2s; }
        .zh-read-lnk:hover { gap: 10px; }

        /* side numbered list */
        .zh-side-list { border-left: 1px solid var(--rule); padding-left: 28px; display: flex; flex-direction: column; }
        .zh-side-item { padding: 16px 0; border-bottom: 1px solid var(--rule); text-decoration: none; display: block; transition: opacity 0.2s; }
        .zh-side-item:first-child { padding-top: 0; }
        .zh-side-item:last-child { border-bottom: none; padding-bottom: 0; }
        .zh-side-item:hover { opacity: 0.65; }
        .zh-side-num { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--paper-dd); line-height: 1; margin-bottom: 5px; }
        .zh-side-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--bord); margin-bottom: 4px; }
        .zh-side-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 5px; }
        .zh-side-dt { font-size: 11px; color: var(--ink-30); }

        /* ── SPECIALTIES ── */
        .zh-specs-wrap { margin-bottom: 40px; }
        .zh-specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .zh-spec { background: var(--white); border: 1px solid var(--rule); border-left: 3px solid var(--bord); padding: 12px 16px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.15s; }
        .zh-spec:hover { background: var(--bord-l); border-left-color: var(--bord-d); transform: translateX(2px); }
        .zh-spec-ico { font-size: 20px; flex-shrink: 0; width: 28px; text-align: center; }
        .zh-spec-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.2; }
        .zh-spec-cnt { display: none; }

        /* ── SEC HEADER ── */
        .zh-sec-hdr { display: flex; align-items: baseline; gap: 14px; margin-bottom: 24px; padding-bottom: 10px; border-bottom: 2px solid var(--ink); }
        .zh-sec-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; }
        .zh-sec-line { flex: 1; height: 1px; background: var(--rule); position: relative; top: -4px; }

        /* ── ART GRID ── */
        .zh-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-bottom: 56px; }
        .zh-card { display: block; text-decoration: none; border-top: 2px solid var(--rule); padding-top: 16px; transition: border-color 0.2s; }
        .zh-card:hover { border-color: var(--bord); }
        .zh-card-img { overflow: hidden; border-radius: 2px; margin-bottom: 12px; aspect-ratio: 4/3; background: var(--bord-l); }
        .zh-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .zh-card:hover .zh-card-img img { transform: scale(1.06); }
        .zh-card-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; opacity: 0.4; }
        .zh-card-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--bord); margin-bottom: 6px; }
        .zh-card-ttl { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; line-height: 1.3; color: var(--ink); margin-bottom: 7px; transition: color 0.2s; }
        .zh-card:hover .zh-card-ttl { color: var(--bord); }
        .zh-card-exc { font-size: 13px; color: var(--ink-60); line-height: 1.6; margin-bottom: 8px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .zh-card-meta { font-size: 11px; color: var(--ink-30); display: flex; gap: 6px; }

        /* ── TRUST ── */
        .zh-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 32px 0 8px; }
        .zh-page-btn { min-width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; text-decoration: none; border: 1px solid var(--rule); background: var(--white); color: var(--ink-60); border-radius: 2px; transition: all 0.15s; padding: 0 10px; }
        .zh-page-btn:hover { background: var(--bord-l); border-color: var(--bord); color: var(--bord); }
        .zh-page-btn.active { background: var(--bord); border-color: var(--bord); color: white; }
        .zh-page-btn.disabled { opacity: 0.35; pointer-events: none; }
        .zh-page-dots { color: var(--ink-30); font-size: 14px; padding: 0 4px; }

        .zh-trust { background: var(--bord-d); padding: 52px 0; }
        .zh-trust-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .zh-trust-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 40px; }
        .zh-trust-stat { padding: 28px; text-align: center; border-right: 1px solid rgba(255,255,255,0.08); }
        .zh-trust-stat:last-child { border-right: none; }
        .zh-trust-num { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; color: var(--acc); line-height: 1; margin-bottom: 6px; }
        .zh-trust-lbl { font-size: 12px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; }
        .zh-trust-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .zh-trust-feat { border-left: 2px solid var(--bord-m); padding-left: 16px; }
        .zh-trust-feat-ttl { font-size: 13px; font-weight: 600; color: white; margin-bottom: 4px; }
        .zh-trust-feat-tx { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.6; }

        /* ── FOOTER ── */
        .zh-footer { background: var(--ink); color: rgba(255,255,255,0.65); padding: 36px 0 20px; }
        .zh-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .zh-foot-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 32px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
        .zh-foot-logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: white; text-decoration: none; }
        .zh-foot-logo span { color: var(--acc); }
        .zh-foot-desc { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 5px; max-width: 280px; line-height: 1.7; }
        .zh-foot-lnks { display: flex; gap: 20px; font-size: 12px; padding-top: 2px; }
        .zh-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .zh-foot-lnks a:hover { color: var(--acc); }
        .zh-foot-btm { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.45); }

        .zh-empty { text-align: center; padding: 80px 0; }
        .zh-empty-ico { font-size: 56px; margin-bottom: 16px; opacity: 0.3; }
        .zh-empty-txt { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--ink-60); }


        @media (max-width: 900px) {
          .zh-hero-grid { grid-template-columns: 1fr; }
          .zh-grid { grid-template-columns: repeat(2, 1fr); }
          .zh-specs-grid { grid-template-columns: repeat(2, 1fr); }
          .zh-trust-top { grid-template-columns: 1fr; }
          .zh-trust-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .zh-trust-feats { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .zh-grid { grid-template-columns: 1fr; }
          .zh-nav { display: none; }
          .zh-specs-grid { grid-template-columns: 1fr; }
          .zh-hero-ttl { font-size: 24px; }
          .zh-logo-text { font-size: 30px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <header className="zh">
          <div className="zh-top">
            <div className="zh-top-in">
              <span className="zh-top-badge">Медицинский информационный портал</span>
              <span className="zh-top-date">{todayStr}</span>
            </div>
          </div>
          <div className="zh-main">
            <Link href="/" className="zh-logo">
              <div className="zh-logo-text">Здрав<span>Инфо</span></div>
              <div className="zh-logo-sub">Медицинский портал</div>
            </Link>
          </div>
        </header>

        {categories.length > 0 && (
          <div className="zh-cats">
            <div className="zh-cats-in">
              {(categories as any[]).map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="zh-cat-lnk">
                  {catIcons[cat.slug] && <span>{catIcons[cat.slug]}</span>}
                  {cat.title}
                  {cat._count?.articles > 0 && <span className="zh-cat-cnt">{cat._count.articles}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <main style={{ flex: 1 }}>
          <div className="zh-wrap">

            {articles.length > 0 ? (
              <section className="zh-hero">
                <div className="zh-hero-grid">
                  {hero && (
                    <div className="zh-hero-main">
                      <div className="zh-hero-img">
                        {hero.ogImageUrl
                          ? <img src={hero.ogImageUrl} alt={hero.title} />
                          : <div className="zh-hero-ph">🏥</div>}
                      </div>
                      {hero.category && <div className="zh-hero-cat">{hero.category.title}</div>}
                      <Link href={`/article/${hero.slug}`} className="zh-hero-ttl">{hero.title}</Link>
                      {hero.excerpt && <p className="zh-hero-exc">{hero.excerpt}</p>}
                      <div className="zh-hero-meta">
                        {hero.author?.name && <span className="zh-hero-author">{hero.author.name}</span>}
                        {hero.publishedAt && <><span className="zh-dot">·</span><span>{formatDate(hero.publishedAt)}</span></>}
                        <span className="zh-dot">·</span><span>{hero.viewCount} просм.</span>
                      </div>
                      <Link href={`/article/${hero.slug}`} className="zh-read-lnk">Читать далее →</Link>
                    </div>
                  )}
                  {rest.length > 0 && (
                    <div className="zh-side-list">
                      {rest.slice(0, 5).map((a: any, i: number) => (
                        <Link key={a.id} href={`/article/${a.slug}`} className="zh-side-item">
                          <div className="zh-side-num">0{i + 2}</div>
                          {a.category && <div className="zh-side-cat">{a.category.title}</div>}
                          <div className="zh-side-ttl">{a.title}</div>
                          <div className="zh-side-dt">{formatDate(a.publishedAt)}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className="zh-empty">
                <div className="zh-empty-ico">🏥</div>
                <div className="zh-empty-txt">Статьи скоро появятся</div>
              </div>
            )}

            {categories.length > 0 && (
              <section className="zh-specs-wrap">
                <div className="zh-sec-hdr">
                  <h2 className="zh-sec-ttl">Разделы медицины</h2>
                  <div className="zh-sec-line" />
                </div>
                <div className="zh-specs-grid">
                  {(categories as any[]).map((cat: any) => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} className="zh-spec">
                      <span className="zh-spec-ico">{catIcons[cat.slug] ?? '🩺'}</span>
                      <div className="zh-spec-name">{cat.title}</div>
                      <div className="zh-spec-cnt">{cat._count?.articles ?? 0} ст.</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {rest.length >= 5 && (
              <section>
                <div className="zh-sec-hdr">
                  <h2 className="zh-sec-ttl">Последние статьи</h2>
                  <div className="zh-sec-line" />
                </div>
                <div className="zh-grid">
                  {rest.slice(5).map((a: any) => (
                    <Link key={a.id} href={`/article/${a.slug}`} className="zh-card">
                      <div className="zh-card-img">
                        {a.ogImageUrl
                          ? <img src={a.ogImageUrl} alt={a.title} />
                          : <div className="zh-card-ph">{catIcons[a.category?.slug] ?? '🩺'}</div>}
                      </div>
                      {a.category && <div className="zh-card-cat">{a.category.title}</div>}
                      <div className="zh-card-ttl">{a.title}</div>
                      {a.excerpt && <p className="zh-card-exc">{a.excerpt}</p>}
                      <div className="zh-card-meta">
                        <span>{formatDate(a.publishedAt)}</span>
                        <span>·</span>
                        <span>{a.viewCount} просм.</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalPages > 1 && (
              <div className="zh-pagination">
                <Link href={`/?page=${page - 1}`} className={`zh-page-btn${page <= 1 ? ' disabled' : ''}`}>← Назад</Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                    return <Link key={p} href={`/?page=${p}`} className={`zh-page-btn${p === page ? ' active' : ''}`}>{p}</Link>
                  }
                  if (Math.abs(p - page) === 2) return <span key={p} className="zh-page-dots">…</span>
                  return null
                })}
                <Link href={`/?page=${page + 1}`} className={`zh-page-btn${page >= totalPages ? ' disabled' : ''}`}>Вперёд →</Link>
              </div>
            )}

          </div>
        </main>

        <div className="zh-trust">
          <div className="zh-trust-in">
            <div className="zh-trust-top">
              <div className="zh-trust-stat">
                <div className="zh-trust-num">18+</div>
                <div className="zh-trust-lbl">Медицинских разделов</div>
              </div>
              <div className="zh-trust-stat">
                <div className="zh-trust-num">100%</div>
                <div className="zh-trust-lbl">Проверено врачами</div>
              </div>
              <div className="zh-trust-stat">
                <div className="zh-trust-num">0</div>
                <div className="zh-trust-lbl">Коммерческих рекомендаций</div>
              </div>
            </div>
            <div className="zh-trust-feats">
              {[
                { t: 'Авторы — практикующие врачи', tx: 'Все материалы написаны и проверены специалистами с подтверждёнными дипломами' },
                { t: 'Клинические стандарты', tx: 'Статьи основаны на актуальных медицинских протоколах и рекомендациях ВОЗ' },
                { t: 'Регулярные обновления', tx: 'Контент обновляется при появлении новых данных и исследований' },
              ].map(item => (
                <div key={item.t} className="zh-trust-feat">
                  <div className="zh-trust-feat-ttl">{item.t}</div>
                  <div className="zh-trust-feat-tx">{item.tx}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="zh-footer">
          <div className="zh-foot-in">
            <div className="zh-foot-top">
              <div>
                <Link href="/" className="zh-foot-logo">Здрав<span>Инфо</span></Link>
                <div className="zh-foot-desc">Медицинский информационный портал. Материалы носят образовательный характер и не заменяют консультацию врача.</div>
              </div>
              <div className="zh-foot-lnks">
                <Link href="/privacy">Конфиденциальность</Link>
                <Link href="/contacts">Контакты</Link>
                <Link href="/admin">Для авторов</Link>
              </div>
            </div>
            <div className="zh-foot-btm">
              <span>© {new Date().getFullYear()} ЗдравИнфо</span>
              <span>Все материалы носят информационный характер</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
