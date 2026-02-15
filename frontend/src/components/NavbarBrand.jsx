import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import LinkVaultLogo from './LinkVaultLogo';

const BASE_TEXT = 'Link Vault';
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const HOVER_WORDS = ['Fast', 'Secure', 'Versatile'];

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
  const isAnimatingRef = useRef(false);

  const wait = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

  const runGlitch = (target, frames = 10) =>
    new Promise((resolve) => {
      let frame = 0;
      const timer = setInterval(() => {
        frame += 1;
        const progress = Math.min(frame / frames, 1);
        setText(scrambleFrame(target, progress));
        if (progress >= 1) {
          clearInterval(timer);
          setText(target);
          resolve();
        }
      }, 34);
    });

  const runSwipeWord = async (nextWord) => {
    if (!textRef.current) {
      setText(nextWord);
      return;
    }

    await new Promise((resolve) => {
      gsap.to(textRef.current, {
        yPercent: -120,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: resolve
      });
    });
    setText(nextWord);
    gsap.set(textRef.current, { yPercent: 120 });
    await new Promise((resolve) => {
      gsap.to(textRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.42,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  };

  const runHoverSequence = async () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    try {
      for (const word of HOVER_WORDS) {
        await runSwipeWord(word);
        await wait(340);
      }
      await wait(100);
      await runGlitch(BASE_TEXT, 12);
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0.7, filter: 'blur(2px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 0.36, ease: 'power2.out' }
        );
      }
    } finally {
      isAnimatingRef.current = false;
    }
  };

  useEffect(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, { y: -1.5, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
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
        runHoverSequence();
      }}
    >
      <span ref={iconRef} className="inline-flex">
        <LinkVaultLogo iconOnly className="h-7 w-7 md:h-8 md:w-8" />
      </span>
      <span className="inline-flex min-w-[9ch] items-center overflow-hidden text-xl md:text-2xl">
        <span ref={textRef} className="brand-wordmark font-display font-bold leading-[1.25] tracking-tight">
        {text}
        </span>
      </span>
    </div>
  );
}
