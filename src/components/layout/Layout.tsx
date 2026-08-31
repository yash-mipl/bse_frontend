import type { ReactNode } from 'react'

import { Header } from '@/components/layout/Header'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
    </div>
  )
}
