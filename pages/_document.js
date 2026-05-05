import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="theme-color" content="#07070e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
