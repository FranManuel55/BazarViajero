import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'El Bazar Viajero | Productos Importados',
  description: 'Discover unique imported products from around the world. Find exclusive items for your home and lifestyle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-brand-cream text-gray-800">
        {children}
      </body>
    </html>
  );
}