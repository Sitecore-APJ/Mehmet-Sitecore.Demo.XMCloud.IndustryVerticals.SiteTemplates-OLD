'use client';

import AccentLine from '@/assets/icons/accent-line/AccentLine';
import { plainFromTextField } from '@/helpers/sitecoreHydrationSafe';
import { ComponentProps } from '@/lib/component-props';
import { CommonStyles } from '@/types/styleFlags';
import { Field, Link, LinkField, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';

interface Fields {
  Title: Field<string>;
  Link: LinkField;
}

interface SectionWrapperProps extends ComponentProps {
  fields: Fields;
}

export const Default = ({ params, fields, rendering }: SectionWrapperProps) => {
  const isEditing = useHydrationSafeEditing();
  const { styles, RenderingIdentifier: id } = params;
  const hideAccentLine = styles?.includes(CommonStyles.HideAccentLine);
  const placeholderKey = `section-wrapper-content-${params.DynamicPlaceholderId}`;

  return (
    <section className={`component section-wrapper pt-14 pb-10 ${styles}`} id={id}>
      <div className="container flex flex-col items-center">
        <h2>
          {isEditing ? <Text field={fields.Title} /> : plainFromTextField(fields.Title)}
          {!hideAccentLine && <AccentLine className="ml-auto !h-4 w-[8ch]" />}
        </h2>

        <div className="mt-5 mb-12 w-full">
          <Placeholder name={placeholderKey} rendering={rendering} />
        </div>

        <Link field={fields.Link} className="arrow-btn" />
      </div>
    </section>
  );
};
