export default function LinkVaultLogo({ className = '', iconOnly = false }) {
  if (iconOnly) {
    return (
      <svg className={className} viewBox="0 0 280 280" role="img" aria-label="Link Vault logo icon">
        <g fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="40" y="30" width="200" height="200" />
          <rect x="54" y="44" width="172" height="172" />
          <circle cx="140" cy="130" r="58" />
          <path d="M140 72v14" />
          <path d="M140 174v14" />
          <path d="M82 130h14" />
          <path d="M184 130h14" />
          <path d="M100 90l10 10" />
          <path d="M180 170l-10 -10" />
          <path d="M180 90l-10 10" />
          <path d="M100 170l10 -10" />
          <rect x="110" y="118" width="40" height="24" rx="12" />
          <rect x="130" y="118" width="40" height="24" rx="12" />
        </g>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 920 260" role="img" aria-label="Link Vault logo">
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="40" y="30" width="200" height="200" />
        <rect x="54" y="44" width="172" height="172" />
        <circle cx="140" cy="130" r="58" />
        <path d="M140 72v14" />
        <path d="M140 174v14" />
        <path d="M82 130h14" />
        <path d="M184 130h14" />
        <path d="M100 90l10 10" />
        <path d="M180 170l-10 -10" />
        <path d="M180 90l-10 10" />
        <path d="M100 170l10 -10" />
        <rect x="110" y="118" width="40" height="24" rx="12" />
        <rect x="130" y="118" width="40" height="24" rx="12" />
      </g>

      <g fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" fill="currentColor">
        <text x="280" y="125" fontSize="70" fontWeight="600" letterSpacing="-0.5">
          Link Vault
        </text>
        <text x="282" y="165" fontSize="20" fontWeight="500" opacity="0.72">
          fast, secure, extensible
        </text>
      </g>
    </svg>
  );
}
