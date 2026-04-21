import type { ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';
import { NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';

/** Stable string from Sitecore text-like fields (avoids `<Text />` SSR/CSR markup drift). */
export function plainFromTextField(
  field: { value?: unknown } | null | undefined,
  fallback = ''
): string {
  if (field == null) return fallback;
  const v = field.value;
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return fallback;
}

/** HTML string from a rich text field for `dangerouslySetInnerHTML` when not editing. */
export function richTextHtml(field: RichTextField | undefined): string {
  const v = field?.value;
  if (typeof v === 'string') return v;
  return '';
}

export type SitecoreOrNativeImageProps = {
  field: ImageField;
  isEditing: boolean;
  className?: string;
  priority?: boolean;
};

/** Next/Image + Sitecore often mismatches on hydration; use native `<img>` when not editing. */
export function SitecoreOrNativeImage({
  field,
  isEditing,
  className,
  priority,
}: SitecoreOrNativeImageProps) {
  if (isEditing) {
    return (
      <ContentSdkImage field={field} className={className} priority={priority} />
    );
  }

  const v = field?.value;
  const src = v?.src;
  if (!src) {
    return null;
  }

  const w = v.width != null ? Number(v.width) : undefined;
  const h = v.height != null ? Number(v.height) : undefined;
  const hasDims = w != null && h != null && !Number.isNaN(w) && !Number.isNaN(h);
  const alt = typeof v.alt === 'string' ? v.alt : '';

  return (
    <img
      src={src}
      alt={alt}
      width={hasDims ? w : undefined}
      height={hasDims ? h : undefined}
      className={className}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
    />
  );
}
