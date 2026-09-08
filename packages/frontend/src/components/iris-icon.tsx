import type { SVGProps } from 'react';

/**
 * Íris — the AgroScope assistant's mark: a lens observing a leaf.
 * Drawn in the same stroke-based, 24x24 lucide-react style used across the app
 * (2px stroke, round caps/joins, currentColor) so it sits alongside the rest
 * of the icon set without looking like an imported asset.
 */
export function IrisIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M11 6.5c2.2 1.1 3.5 3 3.5 5.2A3.5 3.5 0 0 1 11 15a3.5 3.5 0 0 1-3.5-3.3c0-2.2 1.3-4.1 3.5-5.2Z" />
      <path d="M11 8.7V15" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
