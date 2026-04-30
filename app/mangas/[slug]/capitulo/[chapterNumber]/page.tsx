export default function ReaderPage({
  params,
}: {
  params: { slug: string; chapterNumber: string }
}) {
  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-center py-4">
          {params.slug} — Capítulo {params.chapterNumber}
        </h1>
        {/* TODO: leitor de páginas */}
      </div>
    </main>
  )
}
