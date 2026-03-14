'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Данные всех анализов с нормами ───────────────────────────────────────────
const TESTS = [
  // Общий анализ крови
  { slug: 'gemoglobin',     title: 'Гемоглобин',               unit: 'г/л',        mMin: 130, mMax: 170, fMin: 120, fMax: 155, category: 'ОАК' },
  { slug: 'eritrotsity',    title: 'Эритроциты',               unit: '×10¹²/л',    mMin: 4.0, mMax: 5.5, fMin: 3.7, fMax: 4.7, category: 'ОАК' },
  { slug: 'leykotsity',     title: 'Лейкоциты',                unit: '×10⁹/л',     mMin: 4.0, mMax: 9.0, fMin: 4.0, fMax: 9.0, category: 'ОАК' },
  { slug: 'trombotsity',    title: 'Тромбоциты',               unit: '×10⁹/л',     mMin: 150, mMax: 400, fMin: 150, fMax: 400, category: 'ОАК' },
  { slug: 'soe',            title: 'СОЭ',                      unit: 'мм/ч',       mMin: 1,   mMax: 15,  fMin: 2,   fMax: 20,  category: 'ОАК' },
  // Биохимия
  { slug: 'glyukoza',       title: 'Глюкоза',                  unit: 'ммоль/л',    mMin: 3.9, mMax: 5.6, fMin: 3.9, fMax: 5.6, category: 'Биохимия' },
  { slug: 'glikiroavanny-gemoglobin', title: 'HbA1c',          unit: '%',          mMin: 4.0, mMax: 5.9, fMin: 4.0, fMax: 5.9, category: 'Биохимия' },
  { slug: 'obshhij-kholesterin',   title: 'Холестерин общий',  unit: 'ммоль/л',    mMin: 3.1, mMax: 5.2, fMin: 3.1, fMax: 5.2, category: 'Биохимия' },
  { slug: 'lpnp',           title: 'ЛПНП (LDL)',               unit: 'ммоль/л',    mMin: 0,   mMax: 3.0, fMin: 0,   fMax: 3.0, category: 'Биохимия' },
  { slug: 'lpvp',           title: 'ЛПВП (HDL)',               unit: 'ммоль/л',    mMin: 1.0, mMax: 99,  fMin: 1.2, fMax: 99,  category: 'Биохимия' },
  { slug: 'triglitseridy',  title: 'Триглицериды',             unit: 'ммоль/л',    mMin: 0,   mMax: 1.7, fMin: 0,   fMax: 1.7, category: 'Биохимия' },
  { slug: 'alt',            title: 'АЛТ',                      unit: 'Ед/л',       mMin: 0,   mMax: 40,  fMin: 0,   fMax: 32,  category: 'Биохимия' },
  { slug: 'ast',            title: 'АСТ',                      unit: 'Ед/л',       mMin: 0,   mMax: 40,  fMin: 0,   fMax: 32,  category: 'Биохимия' },
  { slug: 'bilirubin-obshhij', title: 'Билирубин общий',       unit: 'мкмоль/л',   mMin: 3.4, mMax: 20.5, fMin: 3.4, fMax: 20.5, category: 'Биохимия' },
  { slug: 'kreatinin',      title: 'Креатинин',                unit: 'мкмоль/л',   mMin: 62,  mMax: 115, fMin: 53,  fMax: 97,  category: 'Биохимия' },
  { slug: 'mochevina',      title: 'Мочевина',                 unit: 'ммоль/л',    mMin: 2.5, mMax: 8.3, fMin: 2.5, fMax: 8.3, category: 'Биохимия' },
  { slug: 'mochevaya-kislota', title: 'Мочевая кислота',       unit: 'мкмоль/л',   mMin: 210, mMax: 420, fMin: 150, fMax: 350, category: 'Биохимия' },
  { slug: 'c-reaktivnyj-belok', title: 'С-реактивный белок',   unit: 'мг/л',       mMin: 0,   mMax: 5,   fMin: 0,   fMax: 5,   category: 'Биохимия' },
  { slug: 'amilaza',        title: 'Амилаза',                  unit: 'Ед/л',       mMin: 25,  mMax: 125, fMin: 25,  fMax: 125, category: 'Биохимия' },
  { slug: 'vitamin-d',      title: 'Витамин D (25-OH)',         unit: 'нг/мл',      mMin: 30,  mMax: 100, fMin: 30,  fMax: 100, category: 'Биохимия' },
  { slug: 'vitamin-b12',    title: 'Витамин B12',              unit: 'пмоль/л',    mMin: 148, mMax: 740, fMin: 148, fMax: 740, category: 'Биохимия' },
  // Гормоны
  { slug: 'ttg',            title: 'ТТГ',                      unit: 'мМЕ/л',      mMin: 0.4, mMax: 4.0, fMin: 0.4, fMax: 4.0, category: 'Гормоны' },
  { slug: 'ft4',            title: 'Т4 свободный',             unit: 'пмоль/л',    mMin: 9.0, mMax: 19.0, fMin: 9.0, fMax: 19.0, category: 'Гормоны' },
  { slug: 'testosteron',    title: 'Тестостерон',              unit: 'нмоль/л',    mMin: 12.0, mMax: 33.0, fMin: 0.3, fMax: 2.8, category: 'Гормоны' },
  { slug: 'kortizol',       title: 'Кортизол',                 unit: 'нмоль/л',    mMin: 140, mMax: 600, fMin: 140, fMax: 600, category: 'Гормоны' },
  { slug: 'insulin',        title: 'Инсулин',                  unit: 'мкЕд/мл',    mMin: 2.6, mMax: 24.9, fMin: 2.6, fMax: 24.9, category: 'Гормоны' },
  // Коагулограмма
  { slug: 'mno',            title: 'МНО',                      unit: '',           mMin: 0.8, mMax: 1.2, fMin: 0.8, fMax: 1.2, category: 'Коагулограмма' },
  { slug: 'd-dimer',        title: 'Д-димер',                  unit: 'нг/мл',      mMin: 0,   mMax: 500, fMin: 0,   fMax: 500, category: 'Коагулограмма' },
  // Иммунология
  { slug: 'revmatoidny-faktor', title: 'Ревматоидный фактор',  unit: 'МЕ/мл',      mMin: 0,   mMax: 14,  fMin: 0,   fMax: 14,  category: 'Иммунология' },
]

const CATEGORIES = ['ОАК', 'Биохимия', 'Гормоны', 'Коагулограмма', 'Иммунология']

type Status = 'low' | 'normal' | 'high' | 'critical_low' | 'critical_high'

interface Result {
  status: Status
  label: string
  color: string
  bg: string
  message: string
  pct: number // position on scale 0–100
}

function interpret(value: number, min: number, max: number, testSlug: string): Result {
  // Критические пороги: выход за 50% от норм
  const critLow  = min > 0 ? min * 0.5  : min - (max - min) * 0.5
  const critHigh = max * 1.5

  const pct = max > min
    ? Math.min(Math.max(((value - critLow) / (critHigh - critLow)) * 100, 2), 98)
    : 50

  if (min === 0 && value === 0) {
    return { status: 'normal', label: 'В норме', color: '#16A34A', bg: '#F0FDF4', message: 'Показатель в пределах референсных значений.', pct }
  }

  if (min > 0 && value < critLow) {
    return { status: 'critical_low', label: 'Значительно снижен', color: '#9B1C1C', bg: '#FFF1F2',
      message: 'Показатель значительно ниже нормы. Рекомендуется срочная консультация врача.', pct }
  }
  if (value < min) {
    return { status: 'low', label: 'Ниже нормы', color: '#2563EB', bg: '#EFF6FF',
      message: 'Показатель ниже референсного диапазона. Рекомендуется проконсультироваться с врачом.', pct }
  }
  if (max < 90 && value > critHigh) {
    return { status: 'critical_high', label: 'Значительно повышен', color: '#9B1C1C', bg: '#FFF1F2',
      message: 'Показатель значительно выше нормы. Рекомендуется срочная консультация врача.', pct }
  }
  if (value > max) {
    return { status: 'high', label: 'Выше нормы', color: '#D97706', bg: '#FFFBEB',
      message: 'Показатель выше референсного диапазона. Рекомендуется проконсультироваться с врачом.', pct }
  }

  return { status: 'normal', label: 'В норме', color: '#16A34A', bg: '#F0FDF4',
    message: 'Показатель в пределах референсных значений.', pct }
}

export default function DecodePage() {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [selectedCat, setSelectedCat] = useState('ОАК')
  const [testSlug, setTestSlug] = useState('')
  const [value, setValue] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [currentTest, setCurrentTest] = useState<typeof TESTS[0] | null>(null)
  const [error, setError] = useState('')

  const filteredTests = TESTS.filter(t => t.category === selectedCat)

  function handleTestChange(slug: string) {
    setTestSlug(slug)
    setValue('')
    setResult(null)
    setError('')
    setCurrentTest(TESTS.find(t => t.slug === slug) || null)
  }

  function handleCatChange(cat: string) {
    setSelectedCat(cat)
    setTestSlug('')
    setValue('')
    setResult(null)
    setError('')
    setCurrentTest(null)
  }

  function decode() {
    setError('')
    if (!testSlug) { setError('Выберите показатель'); return }
    const v = parseFloat(value.replace(',', '.'))
    if (isNaN(v)) { setError('Введите числовое значение'); return }
    if (v < 0) { setError('Значение не может быть отрицательным'); return }

    const test = TESTS.find(t => t.slug === testSlug)!
    const min = sex === 'male' ? test.mMin : test.fMin
    const max = sex === 'male' ? test.mMax : test.fMax
    setResult(interpret(v, min, max, testSlug))
    setCurrentTest(test)
  }

  function reset() {
    setTestSlug('')
    setValue('')
    setResult(null)
    setError('')
    setCurrentTest(null)
  }

  const normMin = currentTest ? (sex === 'male' ? currentTest.mMin : currentTest.fMin) : 0
  const normMax = currentTest ? (sex === 'male' ? currentTest.mMax : currentTest.fMax) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #DDD5C5; --white: #FFFFFF;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        .dc { background: var(--bord-d); }
        .dc-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .dc-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .dc-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .dc-logo span { color: var(--acc); }

        .dc-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .dc-bread-in { max-width: 860px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .dc-bread a { color: var(--ink-60); text-decoration: none; }
        .dc-bread a:hover { color: var(--bord); }
        .dc-bread-sep { color: var(--rule); }

        .dc-body { background: var(--paper); min-height: 70vh; }
        .dc-wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }

        .dc-hdr { margin-bottom: 32px; }
        .dc-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .dc-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .dc-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }
        .dc-disclaimer { margin-top: 10px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: flex-start; }

        .dc-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .dc-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }

        .dc-sex { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .dc-sex-btn { flex: 1; padding: 11px; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .dc-sex-btn.active { background: var(--bord); color: white; }
        .dc-sex-btn:hover:not(.active) { background: var(--bord-l); color: var(--bord); }

        .dc-cat-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .dc-cat-tab { padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; background: white; border: 1px solid var(--rule); border-radius: 20px; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .dc-cat-tab.active { background: var(--bord-d); border-color: var(--bord-d); color: white; }
        .dc-cat-tab:hover:not(.active) { border-color: var(--bord); color: var(--bord); }

        .dc-field { margin-bottom: 20px; }
        .dc-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 8px; display: block; }
        .dc-select { width: 100%; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 15px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; cursor: pointer; transition: border-color 0.15s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239A8A78' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .dc-select:focus { border-color: var(--bord); }

        .dc-input-wrap { display: flex; gap: 10px; align-items: flex-end; }
        .dc-input { flex: 1; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 20px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; font-weight: 600; }
        .dc-input:focus { border-color: var(--bord); }
        .dc-unit { font-size: 14px; color: var(--ink-30); padding-bottom: 14px; white-space: nowrap; }
        .dc-norm-hint { font-size: 12px; color: var(--ink-30); margin-top: 6px; }

        .dc-btn { width: 100%; padding: 14px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .dc-btn:hover { background: var(--bord-m); }
        .dc-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .dc-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .dc-result-top { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
        .dc-result-val { font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; line-height: 1; }
        .dc-result-unit { font-size: 18px; font-weight: 400; color: var(--ink-30); }
        .dc-result-right { flex: 1; min-width: 180px; }
        .dc-result-test { font-size: 13px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .dc-result-badge { display: inline-block; font-size: 15px; font-weight: 700; padding: 8px 18px; border-radius: 2px; }
        .dc-result-msg { font-size: 14px; color: var(--ink-60); line-height: 1.6; padding: 14px 16px; background: var(--paper); border-radius: 2px; margin-bottom: 20px; }

        .dc-scale { margin-bottom: 20px; }
        .dc-scale-track { height: 10px; border-radius: 5px; background: linear-gradient(90deg, #1E40AF 0%, #2563EB 20%, #16A34A 35%, #16A34A 65%, #D97706 80%, #DC2626 100%); position: relative; margin-bottom: 8px; }
        .dc-scale-needle { position: absolute; top: -5px; width: 4px; height: 20px; background: var(--ink); border-radius: 2px; transform: translateX(-50%); box-shadow: 0 1px 4px rgba(0,0,0,0.3); transition: left 0.5s ease; }
        .dc-scale-norm { position: absolute; top: 0; height: 100%; background: rgba(255,255,255,0.3); border-radius: 4px; }
        .dc-scale-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-30); }

        .dc-norm-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .dc-norm-item { background: var(--paper); border-radius: 2px; padding: 12px 16px; }
        .dc-norm-item-lbl { font-size: 11px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .dc-norm-item-val { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); }

        .dc-link-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--bord); text-decoration: none; padding: 10px 18px; border: 1px solid var(--bord-l); border-radius: 2px; transition: all 0.15s; margin-top: 4px; }
        .dc-link-btn:hover { background: var(--bord-l); }
        .dc-reset { font-size: 13px; color: var(--ink-30); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-left: 16px; }

        .dc-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .dc-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .dc-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .dc-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .dc-ad-under-in { max-width: 860px; margin: 0 auto; padding: 0 24px; }
        .dc-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .dc-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .dc-foot-in { max-width: 860px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .dc-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .dc-foot-logo span { color: var(--acc); }
        .dc-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .dc-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .dc-foot-lnks a:hover { color: var(--acc); }
        .dc-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 600px) {
          .dc-wrap { padding: 28px 14px 48px; }
          .dc-ttl { font-size: 26px; }
          .dc-card { padding: 20px; }
          .dc-result { padding: 20px; }
          .dc-result-val { font-size: 48px; }
          .dc-norm-box { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="dc">
        <div className="dc-top">Медицинский информационный портал</div>
        <div className="dc-main">
          <Link href="/" className="dc-logo">Здрав<span>Инфо</span></Link>
        </div>
      </header>

      <div className="dc-bread">
        <div className="dc-bread-in">
          <Link href="/">Главная</Link>
          <span className="dc-bread-sep">›</span>
          <Link href="/tests">Справочник анализов</Link>
          <span className="dc-bread-sep">›</span>
          <span>Расшифровщик</span>
        </div>
      </div>

      <div className="dc-body">
        <div className="dc-wrap">
          <div className="dc-hdr">
            <span className="dc-ico">📋</span>
            <h1 className="dc-ttl">Расшифровка анализов</h1>
            <p className="dc-sub">Введите своё значение — узнайте, в норме ли показатель и что это может означать</p>
            <div className="dc-disclaimer">
              <span>⚠️</span>
              <span>Результат носит ознакомительный характер. Только врач может поставить диагноз с учётом всей клинической картины.</span>
            </div>
          </div>

          {!result ? (
            <div className="dc-card">
              <div className="dc-card-ttl">Выберите показатель и введите значение</div>

              <div className="dc-sex">
                <button className={`dc-sex-btn${sex === 'male' ? ' active' : ''}`} onClick={() => setSex('male')}>👨 Мужской пол</button>
                <button className={`dc-sex-btn${sex === 'female' ? ' active' : ''}`} onClick={() => setSex('female')}>👩 Женский пол</button>
              </div>

              <div className="dc-field">
                <label className="dc-label">Группа показателей</label>
                <div className="dc-cat-tabs">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`dc-cat-tab${selectedCat === cat ? ' active' : ''}`}
                      onClick={() => handleCatChange(cat)}
                    >{cat}</button>
                  ))}
                </div>
              </div>

              <div className="dc-field">
                <label className="dc-label">Показатель</label>
                <select className="dc-select" value={testSlug} onChange={e => handleTestChange(e.target.value)}>
                  <option value="">— Выберите показатель —</option>
                  {filteredTests.map(t => (
                    <option key={t.slug} value={t.slug}>{t.title} ({t.unit})</option>
                  ))}
                </select>
              </div>

              <div className="dc-field">
                <label className="dc-label">Ваше значение</label>
                <div className="dc-input-wrap">
                  <input
                    className="dc-input"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && decode()}
                  />
                  {currentTest && <span className="dc-unit">{currentTest.unit}</span>}
                </div>
                {currentTest && (
                  <div className="dc-norm-hint">
                    Норма: {sex === 'male' ? currentTest.mMin : currentTest.fMin} – {sex === 'male' ? currentTest.mMax : currentTest.fMax} {currentTest.unit}
                  </div>
                )}
              </div>

              <button className="dc-btn" onClick={decode}>Расшифровать →</button>
              {error && <div className="dc-error">{error}</div>}
            </div>
          ) : (
            <div className="dc-result">
              <div className="dc-result-top">
                <div>
                  <div className="dc-result-val" style={{ color: result.color }}>
                    {value} <span className="dc-result-unit">{currentTest?.unit}</span>
                  </div>
                </div>
                <div className="dc-result-right">
                  <div className="dc-result-test">{currentTest?.title}</div>
                  <div className="dc-result-badge" style={{ background: result.bg, color: result.color }}>
                    {result.label}
                  </div>
                </div>
              </div>

              <div className="dc-result-msg">{result.message}</div>

              {/* Шкала */}
              <div className="dc-scale">
                <div className="dc-scale-track">
                  {/* Зона нормы */}
                  {(() => {
                    const critLow = normMin > 0 ? normMin * 0.5 : normMin - (normMax - normMin) * 0.5
                    const critHigh = normMax * 1.5
                    const range = critHigh - critLow
                    const normStart = ((normMin - critLow) / range) * 100
                    const normWidth = ((normMax - normMin) / range) * 100
                    return <div className="dc-scale-norm" style={{ left: `${normStart}%`, width: `${normWidth}%` }} />
                  })()}
                  <div className="dc-scale-needle" style={{ left: `${result.pct}%` }} />
                </div>
                <div className="dc-scale-labels">
                  <span>Низкий</span>
                  <span>Норма: {normMin} – {normMax}</span>
                  <span>Высокий</span>
                </div>
              </div>

              <div className="dc-norm-box">
                <div className="dc-norm-item">
                  <div className="dc-norm-item-lbl">Минимум нормы</div>
                  <div className="dc-norm-item-val">{normMin} {currentTest?.unit}</div>
                </div>
                <div className="dc-norm-item">
                  <div className="dc-norm-item-lbl">Максимум нормы</div>
                  <div className="dc-norm-item-val">{normMax} {currentTest?.unit}</div>
                </div>
              </div>

              {currentTest && (
                <Link href={`/tests/${currentTest.slug}`} className="dc-link-btn">
                  📖 Подробнее о показателе «{currentTest.title}» →
                </Link>
              )}
              <button className="dc-reset" onClick={reset}>Проверить другой показатель</button>
            </div>
          )}

          <div className="dc-ad-box">
            <div className="dc-ad-label">Реклама</div>
            <div id="yandex_rtb_decode_1" className="dc-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="dc-ad-box">
            <div className="dc-ad-label">Реклама</div>
            <div id="yandex_rtb_decode_2" className="dc-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="dc-ad-under">
        <div className="dc-ad-under-in">
          <div className="dc-ad-label">Реклама</div>
          <div id="yandex_rtb_decode_under" className="dc-ad-under-slot">Реклама под расшифровщиком (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      <footer className="dc-foot">
        <div className="dc-foot-in">
          <Link href="/" className="dc-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="dc-foot-lnks">
            <Link href="/tests">Справочник анализов</Link>
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/symptoms">Симптомы</Link>
          </div>
          <div className="dc-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Информация носит образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
