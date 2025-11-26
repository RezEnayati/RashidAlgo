import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RashidAlgo - Algorithm Visualizer',
  description: 'Interactive algorithm visualizer with Dijkstra and AI-powered chatbot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-white">
                RashidAlgo
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/visualizer"
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Algorithms
                </Link>
                <Link
                  href="/chat"
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Chat
                </Link>
              </div>
            </div>
          </nav>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
