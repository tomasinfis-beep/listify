export const metadata = {
  title: 'Listify',
  description: 'Generate perfect listings for any platform instantly',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
