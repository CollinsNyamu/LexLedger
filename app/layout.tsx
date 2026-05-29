import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({ 
  subsets: ["latin"],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: 'Hourly - Billable Hours Tracking for Lawyers',
  description: 'AI-powered billable hours tracking that captures emails, calls & messages automatically.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-sans antialiased bg-[#0C0E14]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
