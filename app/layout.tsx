import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://rolia.idiasolutions.com'),
  title: {
    default: 'Rol.IA — Inteligencia comercial autónoma',
    template: '%s · Rol.IA',
  },
  description: 'La IA no piensa por uno, piensa con uno. Inteligencia comercial autónoma con guardianes de IA que vigilan tu embudo 24/7.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8f7f4',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#f8f7f4]">
      <body className="font-sans antialiased bg-[#f8f7f4] text-[#1f2937]">
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
