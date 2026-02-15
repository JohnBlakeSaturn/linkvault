import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export function useSectionScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback(
    (id) => {
      const runScroll = () => {
        const target = document.getElementById(id);
        if (!target) return;
        gsap.to(window, {
          duration: 0.95,
          ease: 'power3.out',
          scrollTo: { y: target, offsetY: 110 }
        });
      };

      if (location.pathname !== '/') {
        navigate(`/#${id}`);
        setTimeout(runScroll, 70);
        return;
      }

      runScroll();
    },
    [location.pathname, navigate]
  );

  return { scrollToSection };
}
