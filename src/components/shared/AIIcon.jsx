import ConnectAILogo from './ConnectAILogo';

/**
 * AIIcon — thin wrapper around ConnectAILogo icon variant
 * Kept for backward compatibility with existing usages
 */
export default function AIIcon({ size = 40, light = false, className = '' }) {
  return <ConnectAILogo variant="icon" theme={light ? 'light' : 'dark'} size={size} className={className} />;
}
