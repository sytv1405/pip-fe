import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon image_src" href="/apple-touch-icon.png" />
        </Head>
        <body className="notranslate">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
