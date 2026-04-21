'use client';

import {
  Text,
  RichText,
  Field,
  RichTextField,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { JSX } from 'react';
import { plainFromTextField, richTextHtml } from '@/helpers/sitecoreHydrationSafe';

type ContentBlockProps = ComponentProps & {
  fields: {
    heading: Field<string>;
    content: RichTextField;
  };
};

const ContentBlock = ({ fields }: ContentBlockProps): JSX.Element => {
  const isEditing = useHydrationSafeEditing();

  return (
    <div className="contentBlock">
      {isEditing ? (
        <Text tag="h2" className="contentTitle" field={fields.heading} />
      ) : (
        <h2 className="contentTitle">{plainFromTextField(fields.heading)}</h2>
      )}

      {isEditing ? (
        <RichText className="contentDescription" field={fields.content} />
      ) : (
        <div
          className="contentDescription"
          dangerouslySetInnerHTML={{ __html: richTextHtml(fields.content) }}
        />
      )}
    </div>
  );
};

export default withDatasourceCheck()<ContentBlockProps>(ContentBlock);
