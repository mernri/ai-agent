import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Investment memo generator',
  description: 'Investment memo generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col justify-between`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html >
  )
}
