import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import SmoothScroll from '@/components/smooth-scroll'

export const metadata: Metadata = {
  title: 'Unify Survey Bot — WhatsApp Feedback Engine',
  description: 'Instant WhatsApp surveys and analytics for communities, campuses, and businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: the blocking theme script below sets
    // data-theme before hydration, so the client DOM legitimately differs
    // from SSR HTML on this attribute.
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
