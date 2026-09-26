import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
