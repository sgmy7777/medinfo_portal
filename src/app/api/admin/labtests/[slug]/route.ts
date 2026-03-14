import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Props = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const test = await prisma.labTest.findUnique({
    where: { slug },
    include: { articles: { include: { article: { select: { id: true, title: true, slug: true } } } } },
  })
  if (!test) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json({ data: test })
}

export async function PUT(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const body = await req.json()
  const { title, description, category, unit, normMale, normFemale, normGeneral, preparation, articleSlugs } = body
  if (!title || !category) return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })

  try {
    const test = await prisma.labTest.update({
      where: { slug },
      data: {
        title, description: description || null, category,
        unit: unit || null,
        normMale: normMale || null,
        normFemale: normFemale || null,
        normGeneral: normGeneral || null,
        preparation: preparation || null,
      }
    })

    // Обновить связанные статьи
    if (Array.isArray(articleSlugs)) {
      await prisma.labTestArticle.deleteMany({ where: { labTestId: test.id } })
      for (const aSlug of articleSlugs) {
        const article = await prisma.article.findUnique({ where: { slug: aSlug } })
        if (article) {
          await prisma.labTestArticle.create({ data: { labTestId: test.id, articleId: article.id } })
        }
      }
    }
    return NextResponse.json({ data: test })
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  try {
    await prisma.labTest.delete({ where: { slug } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
