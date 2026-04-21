'use client';

import React, { JSX } from 'react';
import { RichText as ContentSdkRichText, RichTextField } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { richTextHtml } from '@/helpers/sitecoreHydrationSafe';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Text: RichTextField;
}

export type RichTextProps = ComponentProps & {
  fields: Fields;
};

export const Default = ({ params, fields }: RichTextProps): JSX.Element => {
  const isEditing = useHydrationSafeEditing();
  const { RenderingIdentifier, styles } = params;

  return (
    <div className={`component rich-text ${styles}`} id={RenderingIdentifier}>
      <div className="component-content">
        {fields ? (
          isEditing ? (
            <ContentSdkRichText field={fields.Text} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: richTextHtml(fields.Text) }} />
          )
        ) : (
          <span className="is-empty-hint">Rich text</span>
        )}
      </div>
    </div>
  );
};
