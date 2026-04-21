'use client';

import React, { useEffect, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  Placeholder,
  Link,
} from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { plainFromTextField, richTextHtml, SitecoreOrNativeImage } from '@/helpers/sitecoreHydrationSafe';
import { ComponentProps } from '@/lib/component-props';
import AccentLine from '@/assets/icons/accent-line/AccentLine';
import { CommonStyles, HeroBannerStyles, LayoutStyles } from '@/types/styleFlags';
import clsx from 'clsx';

interface Fields {
  Image: ImageField;
  Video: ImageField;
  Title: Field<string>;
  Description: RichTextField;
  CtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

const HeroBannerCommon = ({
  params,
  fields,
  children,
}: HeroBannerProps & {
  children: React.ReactNode;
}) => {
  const { styles, RenderingIdentifier: id } = params;
  const isPageEditing = useHydrationSafeEditing();

  /** Video must not render on SSR/first paint — `Video` URL can differ from `<Image>` branch and causes a mismatch. */
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    setVideoReady(true);
  }, []);

  const videoSrc = fields?.Video?.value?.src;
  const showBackgroundVideo =
    videoReady && !isPageEditing && typeof videoSrc === 'string' && videoSrc.length > 0;

  /** Same asset as `<SitecoreOrNativeImage />` / video poster — fills the layer while media loads (no solid placeholder color). */
  const fallbackImageSrc =
    typeof fields?.Image?.value?.src === 'string' ? fields.Image.value.src : undefined;

  if (!fields) {
    return isPageEditing ? (
      <div className={`component hero-banner ${styles}`} id={id}>
        [HERO BANNER]
      </div>
    ) : (
      <></>
    );
  }

  const heroBgStyle =
    fallbackImageSrc != null
      ? {
          backgroundImage: `url('${fallbackImageSrc.replace(/'/g, "\\'")}')`,
        }
      : undefined;

  return (
    <div
      className={clsx(
        'component hero-banner relative z-0 flex items-center text-white',
        styles,
        /* Theme `container-dark-background` applies bg-accent; it shows through until the image layer paints — strip it when we have a real image URL */
        fallbackImageSrc && '!bg-transparent bg-cover bg-center bg-no-repeat'
      )}
      id={id}
      style={heroBgStyle}
    >
      {/* Foreground media (img / video) stacks on the same Image URL already on the section above */}
      <div className="absolute inset-0 z-0">
        {showBackgroundVideo ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={fields.Image?.value?.src}
          >
            <source src={videoSrc} type="video/webm" />
          </video>
        ) : (
          <SitecoreOrNativeImage
            field={fields.Image}
            isEditing={isPageEditing}
            className="h-full w-full object-cover md:object-bottom"
            priority
          />
        )}
      </div>

      {children}
    </div>
  );
};

export const Default = ({ params, fields, rendering }: HeroBannerProps) => {
  const isPageEditing = useHydrationSafeEditing();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content: centered full-bleed hero; reverseLayout = left-aligned block */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4">
          <div
            className={clsx(
              'flex min-h-[min(78vh,42rem)] w-full flex-col justify-center py-14 md:py-20',
              reverseLayout
                ? 'items-start text-left'
                : 'items-center text-center'
            )}
          >
            <div
              className={clsx(
                'w-full max-w-4xl',
                !reverseLayout && 'mx-auto',
                reverseLayout && 'lg:max-w-2xl'
              )}
            >
              {/* Title: keep phrasing-only inside <h1> (SDK Text + block svg caused DOM repair / hydration mismatches). */}
              <div className={clsx(!reverseLayout && 'text-center')}>
                <h1
                  className={clsx(
                    'font-heading text-balance text-4xl font-extrabold tracking-tight text-white md:text-6xl md:leading-[1.08] lg:text-7xl xl:text-[4.25rem] xl:leading-[1.05]'
                  )}
                >
                  {isPageEditing ? (
                    <ContentSdkText field={fields.Title} tag="span" className="text-inherit" />
                  ) : (
                    plainFromTextField(fields.Title)
                  )}
                </h1>
                {!hideAccentLine && (
                  <AccentLine
                    className={clsx(
                      '!h-5 w-[9ch] !text-white',
                      reverseLayout ? 'lg:mx-0' : 'mx-auto'
                    )}
                  />
                )}
              </div>

              {/* Description */}
              <div className="mt-7 text-lg text-white/90 md:text-xl md:leading-relaxed">
                {isPageEditing ? (
                  <ContentSdkRichText
                    field={fields.Description}
                    className={clsx(
                      '[&_a]:text-white [&_a]:underline [&_li]:text-white/90 [&_ol]:text-white/90 [&_p]:text-white/90 [&_ul]:text-white/90',
                      reverseLayout ? 'text-left' : 'text-center'
                    )}
                  />
                ) : (
                  <div
                    className={clsx(
                      '[&_a]:text-white [&_a]:underline [&_li]:text-white/90 [&_ol]:text-white/90 [&_p]:text-white/90 [&_ul]:text-white/90',
                      reverseLayout ? 'text-left' : 'text-center'
                    )}
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: richTextHtml(fields.Description) }}
                  />
                )}
              </div>

              {/* CTA Link or Placeholder */}
              <div
                className={clsx(
                  'mt-8 flex w-full',
                  reverseLayout ? 'justify-start' : 'justify-center'
                )}
              >
                {withPlaceholder ? (
                  <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                ) : (
                  <Link
                    field={fields.CtaLink}
                    className="arrow-btn !border-b-white !text-white after:!bg-white"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};

export const TopContent = ({ params, fields, rendering }: HeroBannerProps) => {
  const isPageEditing = useHydrationSafeEditing();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      <div className="relative z-10 w-full">
        <div className="container mx-auto flex min-h-[min(78vh,42rem)] justify-center px-4">
          <div
            className={clsx(
              'flex w-full max-w-4xl flex-col items-center justify-center py-14 md:py-24 lg:py-32',
              reverseLayout && 'justify-end'
            )}
          >
            {/* Title: phrasing-only inside <h1> for stable SSR/CSR markup */}
            <div className="text-center">
              <h1 className="font-heading text-balance text-4xl font-extrabold tracking-tight text-white md:text-6xl md:leading-[1.08] lg:text-7xl xl:text-[4.25rem] xl:leading-[1.05]">
                {isPageEditing ? (
                  <ContentSdkText field={fields.Title} tag="span" className="text-inherit" />
                ) : (
                  plainFromTextField(fields.Title)
                )}
              </h1>
              {!hideAccentLine && (
                <AccentLine className="mx-auto !h-5 w-[9ch] !text-white" />
              )}
            </div>

            {/* Description */}
            <div className="mt-7 text-center text-lg text-white/90 md:text-xl md:leading-relaxed">
              {isPageEditing ? (
                <ContentSdkRichText
                  field={fields.Description}
                  className="text-center [&_a]:text-white [&_a]:underline [&_li]:text-white/90 [&_ol]:text-white/90 [&_p]:text-white/90 [&_ul]:text-white/90"
                />
              ) : (
                <div
                  className="text-center [&_a]:text-white [&_a]:underline [&_li]:text-white/90 [&_ol]:text-white/90 [&_p]:text-white/90 [&_ul]:text-white/90"
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{ __html: richTextHtml(fields.Description) }}
                />
              )}
            </div>

            {/* CTA Link or Placeholder */}
            <div className="mt-8 flex w-full justify-center">
              {withPlaceholder ? (
                <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
              ) : (
                <Link
                  field={fields.CtaLink}
                  className="arrow-btn !border-b-white !text-white after:!bg-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};
