import { useTheme } from '../context/ThemeContext';

function Heart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.7-9.5-9.1C1 8.8 2.9 5.5 6.1 5.2c2-.2 3.1.8 3.9 2 1-1.6 2.8-2.6 4.8-2 3.2 1 4.6 4.8 2.8 7.9C15.9 16.6 12 21 12 21z" />
    </svg>
  );
}

export default function ThemeOrnaments() {
  const { theme } = useTheme();

  if (theme !== 'pookie' && theme !== 'space') return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {theme === 'pookie' ? (
        <>
          <Heart className="pookie-ornament pookie-ornament-heart pookie-ornament-h1" />
          <Heart className="pookie-ornament pookie-ornament-heart pookie-ornament-h2" />
          <Heart className="pookie-ornament pookie-ornament-heart pookie-ornament-h3" />
          <span className="pookie-ornament pookie-spark pookie-s1" />
          <span className="pookie-ornament pookie-spark pookie-s2" />
          <span className="pookie-ornament pookie-spark pookie-s3" />
        </>
      ) : null}

      {theme === 'space' ? (
        <>
          <span className="space-ornament space-nebula space-nebula-a" />
          <span className="space-ornament space-nebula space-nebula-b" />
          <span className="space-ornament space-star space-star-a" />
          <span className="space-ornament space-star space-star-b" />
          <span className="space-ornament space-star space-star-c" />
          <span className="space-ornament space-star space-star-d" />
          <span className="space-ornament space-star space-star-e" />
          <span className="space-ornament space-star space-star-f" />
        </>
      ) : null}
    </div>
  );
}
