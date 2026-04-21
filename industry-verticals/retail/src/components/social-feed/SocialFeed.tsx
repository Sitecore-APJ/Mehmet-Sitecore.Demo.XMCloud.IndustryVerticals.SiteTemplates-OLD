'use client';

import React, { JSX, HTMLAttributes } from 'react';
import { ImageField, Text, Field } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { plainFromTextField, SitecoreOrNativeImage } from '@/helpers/sitecoreHydrationSafe';
import { ComponentProps } from 'lib/component-props';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

interface Fields {
  Image1: ImageField;
  Image2: ImageField;
  Image3: ImageField;
  Image4: ImageField;
  Image5: ImageField;
  Image6: ImageField;
  Image7: ImageField;
  Image8: ImageField;
  Image9: ImageField;
  Eyebrow: Field<string>;
  Heading: Field<string>;
}

export type PromoProps = ComponentProps & {
  fields: Fields;
};

interface GridImageProps extends HTMLAttributes<HTMLDivElement> {
  image: ImageField;
  isEditing: boolean;
}

export const GridImage = ({ image, isEditing, className, ...rest }: GridImageProps) => {
  return (
    <div className={`group relative overflow-hidden ${className}`} {...rest}>
      <SitecoreOrNativeImage
        field={image}
        isEditing={isEditing}
        className="image-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
      />
      <FontAwesomeIcon
        icon={faInstagram}
        className="text-background/70 absolute right-2 bottom-2 text-2xl"
      />
    </div>
  );
};

export const Default = (props: PromoProps): JSX.Element => {
  const isEditing = useHydrationSafeEditing();
  const id = props.params.RenderingIdentifier;
  const {
    Eyebrow,
    Heading,
    Image1,
    Image2,
    Image3,
    Image4,
    Image5,
    Image6,
    Image7,
    Image8,
    Image9,
  } = props.fields;

  return (
    <section className={`${props.params.styles} py-20 max-md:space-y-8`} id={id}>
      <div className="container space-y-4 text-center">
        <p className="eyebrow">
          {isEditing ? <Text field={Eyebrow} /> : plainFromTextField(Eyebrow)}
        </p>
        <h2>{isEditing ? <Text field={Heading} /> : plainFromTextField(Heading)}</h2>
      </div>

      <div className="grid items-center gap-2 **:gap-2 md:grid-cols-[5fr_2fr] md:gap-4 md:**:gap-4 lg:grid-cols-[5fr_2fr_5fr]">
        <div className="grid">
          <div className="grid grid-cols-[3fr_5fr] items-end">
            <GridImage image={Image1} isEditing={isEditing} className="aspect-5/7" />
            <GridImage image={Image2} isEditing={isEditing} className="aspect-13/9" />
          </div>
          <div className="grid grid-cols-[10fr_9fr] lg:items-start">
            <GridImage image={Image3} isEditing={isEditing} className="aspect-6/5" />
            <GridImage image={Image4} isEditing={isEditing} className="aspect-auto lg:aspect-10/7" />
          </div>
        </div>

        <GridImage image={Image5} isEditing={isEditing} className="aspect-2/1 md:aspect-3/4 md:max-lg:self-end" />

        <div className="grid gap-4 md:max-lg:col-span-2">
          <div className="grid grid-cols-[2fr_3fr] lg:items-end">
            <GridImage image={Image6} isEditing={isEditing} className="aspect-auto lg:aspect-5/6" />
            <GridImage image={Image7} isEditing={isEditing} className="aspect-1/1" />
          </div>
          <div className="grid grid-cols-[2fr_3fr_3fr] items-start">
            <GridImage image={Image8} isEditing={isEditing} className="aspect-11/15" />
            <GridImage image={Image9} isEditing={isEditing} className="aspect-4/3" />
          </div>
        </div>
      </div>
    </section>
  );
};
