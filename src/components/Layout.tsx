import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { FloatingChatButton } from './FloatingChatButton';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <FloatingChatButton />
    </div>
  );
};