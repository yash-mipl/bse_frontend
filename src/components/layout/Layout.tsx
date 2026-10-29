import type { ReactNode } from 'react'

import { env } from '@/config/env'

type LayoutProps = {
  children: ReactNode
  headerActions?: ReactNode
}

export function Layout({ children, headerActions }: LayoutProps) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-lg font-bold tracking-tight text-slate-900">{env.appName}</div>
          <div className="flex flex-wrap items-center justify-end gap-3">{headerActions}</div>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
