import './globals.css'

export const metadata = {
  title: 'CBT — AI Mock Tests',
  description: 'Full CBT simulator for SBI, IBPS & RRB exams with Grok AI question generation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-slate-200 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
