import { useSectionScroll } from '../hooks/useSectionScroll';
import LinkVaultLogo from './LinkVaultLogo';

export default function Footer() {
  const { scrollToSection } = useSectionScroll();

  return (
    <footer className="mx-auto mt-12 w-full max-w-6xl px-4 pb-10 md:px-8">
      <div className="panel flex flex-col items-start justify-between gap-4 p-6 text-sm text-slate-600 md:flex-row md:items-center dark:text-slate-300">
        <div>
          <LinkVaultLogo className="h-10 w-auto text-slate-900 dark:text-slate-100" />
          <p className="mt-1">Built by JohnBlakeSaturn (Satyaki Saha)</p>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => scrollToSection('features')} className="nav-link">
            Features
          </button>
          <button type="button" onClick={() => scrollToSection('create')} className="nav-link">
            Create
          </button>
          <button type="button" onClick={() => scrollToSection('testimonials')} className="nav-link">
            Stories
          </button>
        </div>
      </div>
    </footer>
  );
}
