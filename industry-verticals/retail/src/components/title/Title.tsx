'use client';

import { plainFromTextField } from '@/helpers/sitecoreHydrationSafe';
import { Link, LinkField, Text, TextField } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';

interface Item {
  url: {
    path: string;
    siteName: string;
  };
  field: {
    jsonValue: {
      value: string;
    };
  };
}

interface TitleProps extends ComponentProps {
  fields: {
    /**
     * The Integrated graphQL query result. This illustrates the way to access the context item datasource information.
     */
    data?: {
      datasource?: Item;
      contextItem?: Item;
    };
  };
}

interface ComponentContentProps {
  id?: string;
  styles?: string;
  children: React.ReactNode;
}

const ComponentContent = ({ id, styles = '', children }: ComponentContentProps): JSX.Element => (
  <div className={`component title ${styles.trim()}`} id={id}>
    <div className="component-content">
      <h1 className="field-title">{children}</h1>
    </div>
  </div>
);

export const Default = ({ params, fields }: TitleProps): JSX.Element => {
  const isEditing = useHydrationSafeEditing();
  const { styles, RenderingIdentifier: id } = params;
  const datasource = fields?.data?.datasource || fields?.data?.contextItem;
  const text: TextField = datasource?.field?.jsonValue || {};
  const link: LinkField = {
    value: {
      href: datasource?.url?.path,
      title: datasource?.field?.jsonValue?.value,
    },
  };

  return (
    <ComponentContent styles={styles} id={id}>
      {isEditing ? (
        <Text field={text} />
      ) : (
        <Link field={link}>{plainFromTextField(text)}</Link>
      )}
    </ComponentContent>
  );
};
