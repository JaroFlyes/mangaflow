export default function MangaDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white">Detalhes da obra</h1>
        <p className="text-muted">Slug: {params.slug}</p>
        {/* TODO: buscar manga por slug e exibir detalhes + capítulos */}
      </div>
    </main>
  )
}
