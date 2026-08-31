import { env } from '@/config/env'

export function Header() {
  return (
    <header className="header">
      <div className="header__brand">{env.appName}</div>
      <nav className="header__nav" aria-label="Main navigation">
        <a href="/">Home</a>
      </nav>
    </header>
  )
}
