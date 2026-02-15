import Header from './Header';
import Footer from './Footer';
import ThemeOrnaments from './ThemeOrnaments';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export default function Layout({ children }) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const id = location.hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;

    const timer = setTimeout(() => {
      gsap.to(window, {
        duration: 0.9,
        ease: 'power3.out',
        scrollTo: { y: target, offsetY: 110 }
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="relative min-h-screen pb-12">
      <ThemeOrnaments />
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 md:px-8 md:pt-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
