import Link from 'next/link'
import s from './public-header.module.css'

export function PublicHeader() {
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className={s.header}>
      <div className={s.top}>
        <div className={s.topIn}>
          <span className={s.topBadge}>Медицинский информационный портал</span>
          <Link href="/symptoms" className={s.navLink}>🌡️ Симптомы</Link>
          <Link href="/tests" className={s.navLink}>🧪 Анализы</Link>
          <Link href="/tests/decode" className={s.navLink}>🔬 Расшифровка</Link>
          <Link href="/calculators" className={s.navLink}>⚖️ Калькуляторы</Link>
          <span className={s.topDate}>{today}</span>
        </div>
      </div>

      <div className={s.main}>
        <Link href="/" className={s.logo}>
          <div className={s.logoText}>Здрав<span>Инфо</span></div>
          <div className={s.logoSub}>Медицинский портал</div>
        </Link>
      </div>
    </header>
  )
}
