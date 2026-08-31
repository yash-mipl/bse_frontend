import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('Home')

  return (
    <section className="home">
      <h1>Welcome to BSE</h1>
      <p>
        React + TypeScript frontend powered by Vite. Start building in{' '}
        <code>src/pages/HomePage.tsx</code>.
      </p>
    </section>
  )
}
