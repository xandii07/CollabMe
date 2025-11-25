import "./globals.css";

export const metadata = {
  title: "CollabMe",
  description: "Encontre feats, beats e conexões reais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
