'use client';

import {
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { plainFromTextField, SitecoreOrNativeImage } from '@/helpers/sitecoreHydrationSafe';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import React from 'react';
import { ComponentProps } from 'lib/component-props';

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

const ImageWrapper: React.FC<{ className: string; id?: string; children: React.ReactNode }> = ({
  className,
  id,
  children,
}) => (
  <div className={className.trim()} id={id}>
    <div className="component-content">{children}</div>
  </div>
);

const ImageDefault: React.FC<ImageProps> = ({ params }) => (
  <ImageWrapper className={`component image ${params.styles}`}>
    <span className="is-empty-hint">Image</span>
  </ImageWrapper>
);

export const Default: React.FC<ImageProps> = (props) => {
  const { fields, params } = props;
  const { styles, RenderingIdentifier: id } = params;
  const isEditing = useHydrationSafeEditing();

  if (!fields) {
    return <ImageDefault {...props} />;
  }

  const imageEl = <SitecoreOrNativeImage field={fields.Image} isEditing={isEditing} />;
  const shouldWrapWithLink = !isEditing && fields.TargetUrl?.value?.href;

  return (
    <ImageWrapper className={`component image ${styles}`} id={id}>
      {shouldWrapWithLink ? (
        <ContentSdkLink field={fields.TargetUrl}>{imageEl}</ContentSdkLink>
      ) : (
        imageEl
      )}
      {isEditing ? (
        <Text tag="span" className="image-caption" field={fields.ImageCaption} />
      ) : (
        <span className="image-caption">{plainFromTextField(fields.ImageCaption)}</span>
      )}
    </ImageWrapper>
  );
};
