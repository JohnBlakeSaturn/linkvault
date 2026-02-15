import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import LinkVaultLogo from './LinkVaultLogo';

const BASE_TEXT = 'Link Vault';
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function scrambleFrame(target, progress) {
  const visible = Math.floor(target.length * progress);
  return target
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' ';
      if (index < visible) return target[index];
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    })
    .join('');
}

export default function NavbarBrand() {
  const [text, setText] = useState(BASE_TEXT);
  const textRef = useRef(null);
  const iconRef = useRef(null);
  const scrambleTimerRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const animateText = () => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { opacity: 0.55, y: 2, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power2.out' }
    );
  };

  const runScramble = (target) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
    let frame = 0;
    const totalFrames = 10;

    scrambleTimerRef.current = setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setText(scrambleFrame(target, progress));

      if (progress >= 1) {
        clearInterval(scrambleTimerRef.current);
        scrambleTimerRef.current = null;
        setText(target);
        animateText();
        isAnimatingRef.current = false;
      }
    }, 24);
  };

  useEffect(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, { y: -1.5, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    return () => {
      if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
    };
  }, []);

  return (
    <div
      className="group flex items-center gap-2 text-slate-900 dark:text-slate-100"
      onMouseEnter={() => {
        if (iconRef.current) {
          gsap.fromTo(iconRef.current, { rotate: 0 }, { rotate: 8, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.inOut' });
        }
        if (textRef.current) {
          gsap.fromTo(
            textRef.current,
            { x: 0, skewX: 0, opacity: 1 },
            {
              keyframes: [
                { x: 1.5, skewX: 3, opacity: 0.9, duration: 0.05 },
                { x: -1.2, skewX: -3, opacity: 0.86, duration: 0.05 },
                { x: 0.8, skewX: 1.5, opacity: 0.95, duration: 0.05 },
                { x: 0, skewX: 0, opacity: 1, duration: 0.08 }
              ],
              ease: 'none'
            }
          );
        }
        runScramble(BASE_TEXT);
      }}
    >
      <span ref={iconRef} className="inline-flex">
        <LinkVaultLogo iconOnly className="h-7 w-7 md:h-8 md:w-8" />
      </span>
      <span ref={textRef} className="brand-wordmark font-display text-xl font-bold tracking-tight md:text-2xl">
        {text}
      </span>
    </div>
  );
}
