import LinkVaultLogo from './LinkVaultLogo';

export default function LogoLoader({ className = '', label = 'Loading...' }) {
  return (
    <span className={`logo-loader accent-text ${className}`}>
      <LinkVaultLogo iconOnly className="logo-loader-icon" />
      <span>{label}</span>
    </span>
  );
}
