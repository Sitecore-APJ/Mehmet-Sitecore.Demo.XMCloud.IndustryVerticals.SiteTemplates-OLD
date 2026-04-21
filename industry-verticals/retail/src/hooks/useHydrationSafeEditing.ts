'use client';

import { useEffect, useState } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';

/**
 * In XM Cloud Pages / embedded editors, `page.mode.isEditing` can disagree between SSR and the
 * first client render, so branches like `isEditing ? <Text /> : plainString` produce different DOM
 * than the server HTML (FieldMetadata, contenteditable, Next/Image vs native img, etc.).
 *
 * Treat the page as "editing" only after mount so the server and hydration pass both use the
 * static/preview output; editor chrome then appears after a paint.
 */
export function useHydrationSafeEditing(): boolean {
  const { page } = useSitecore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted && page.mode.isEditing;
}
