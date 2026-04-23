import { ShieldCheck } from 'lucide-react';

/**
 * Blue IDV badge shown next to verified freelancer names.
 * Usage: {is_verified && <IdvBadge />}
 */
export default function IdvBadge({ size = 14 }) {
  return (
    <span title="Identity Verified" className="inline-flex items-center shrink-0">
      <ShieldCheck size={size} className="text-blue-400" />
    </span>
  );
}
