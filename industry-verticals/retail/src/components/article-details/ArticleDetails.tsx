'use client';

import { isParamEnabled } from '@/helpers/isParamEnabled';
import {
  plainFromTextField,
  richTextHtml,
  SitecoreOrNativeImage,
} from '@/helpers/sitecoreHydrationSafe';
import { ComponentProps } from '@/lib/component-props';
import {
  Field,
  ImageField,
  RichTextField,
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  Placeholder,
} from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import SocialShare from '../non-sitecore/SocialShare';

interface Fields {
  Title: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
}

interface ArticleDetailsProps extends ComponentProps {
  fields: Fields;
}

export const Default = ({ params, fields, rendering }: ArticleDetailsProps) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { styles, RenderingIdentifier: id, DynamicPlaceholderId } = params;
  const placeholderKey = `article-details-${DynamicPlaceholderId}`;
  const fullWidthPlaceholderKey = `article-details-full-width-${DynamicPlaceholderId}`;
  const isPageEditing = useHydrationSafeEditing();
  const hideShareWidget = isParamEnabled(params.HideShareWidget);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    setIsMounted(true);
  }, []);

  if (!fields) {
    return isPageEditing ? (
      <div className={`component article-details ${styles}`} id={id}>
        [ARTICLE DETAILS]
      </div>
    ) : (
      <></>
    );
  }

  return (
    <>
      {isMounted && (
        <Head>
          <meta property="og:url" content={currentUrl} />
          <meta property="og:name" content={fields?.Title?.value} />
          <meta property="og:title" content={fields?.Title?.value} />
          <meta property="og:description" content={fields?.ShortDescription?.value} />
          <meta property="og:image" content={fields?.Image?.value?.src} />
          <meta property="og:type" content="article" />
        </Head>
      )}

      <article className={`component article-details ${styles}`} id={id}>
        <div className="container">
          <div className="grid grid-cols-12 gap-4 py-11">
            {/* Social Share */}
            {!hideShareWidget && isMounted && (
              <SocialShare
                url={currentUrl}
                title={fields?.Title?.value || ''}
                description={fields?.ShortDescription?.value || ''}
                mediaUrl={fields?.Image?.value?.src || ''}
                className="col-span-12 size-fit p-3 shadow-xl md:p-4 lg:col-span-1 lg:flex-col"
              />
            )}

            <div className="col-span-12 aspect-video w-full overflow-hidden rounded-lg lg:col-span-10 lg:col-start-2">
              <SitecoreOrNativeImage
                field={fields.Image}
                isEditing={isPageEditing}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="col-span-12 mt-8 lg:col-span-8 lg:col-start-3">
              <h2>
                {isPageEditing ? (
                  <ContentSdkText field={fields.Title} tag="span" className="text-inherit" />
                ) : (
                  plainFromTextField(fields.Title)
                )}
              </h2>

              {isPageEditing ? (
                <ContentSdkText
                  field={fields.ShortDescription}
                  tag="span"
                  className="text-foreground-muted mt-5 block text-lg font-medium tracking-wide"
                />
              ) : (
                <p className="text-foreground-muted mt-5 text-lg font-medium tracking-wide">
                  {plainFromTextField(fields.ShortDescription)}
                </p>
              )}

              <div className="rich-text mt-10 text-lg">
                {isPageEditing ? (
                  <ContentSdkRichText field={fields.Content} />
                ) : (
                  <div
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: richTextHtml(fields.Content) }}
                  />
                )}
              </div>
            </div>

            <div className="col-span-12 mt-12 lg:col-span-10 lg:col-start-2">
              <Placeholder name={placeholderKey} rendering={rendering} />
            </div>
          </div>
        </div>
        <Placeholder name={fullWidthPlaceholderKey} rendering={rendering} />
      </article>
    </>
  );
};
