import type { ReactNode } from 'react'

import { env } from '@/config/env'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-lg font-bold tracking-tight text-slate-900">{env.appName}</div>
          <nav aria-label="Main navigation">
            <span className="text-sm font-medium text-slate-600">Corporate Announcements</span>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
