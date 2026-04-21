'use client';

import {
  ComponentParams,
  ComponentRendering,
  Image,
  ImageField,
  Link,
  LinkField,
  Placeholder,
  RichText,
  RichTextField,
  Text,
  TextField,
} from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { plainFromTextField, richTextHtml, SitecoreOrNativeImage } from '@/helpers/sitecoreHydrationSafe';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';

interface Fields {
  TitleOne: TextField;
  TitleTwo: TextField;
  TitleThree: TextField;
  TitleFour: TextField;
  TitleFive: TextField;
  CopyrightText: TextField;
  PolicyText: LinkField;
  TermsText: LinkField;
  Logo: ImageField;
  Description: RichTextField;
}

type FooterProps = {
  rendering: ComponentRendering & { params: ComponentParams };
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FooterProps) => {
  const isEditing = useHydrationSafeEditing();
  const id = props.params.RenderingIdentifier;

  const phKeyOne = `footer-list-first-${props?.params?.DynamicPlaceholderId}`;
  const phKeyTwo = `footer-list-second-${props?.params?.DynamicPlaceholderId}`;
  const phKeyThree = `footer-list-third-${props?.params?.DynamicPlaceholderId}`;
  const phKeyFour = `footer-list-fourth-${props?.params?.DynamicPlaceholderId}`;
  const phKeyFive = `footer-list-fifth-${props?.params?.DynamicPlaceholderId}`;

  const sections = [
    {
      key: 'first_nav',
      title: isEditing ? (
        <Text field={props.fields.TitleOne} />
      ) : (
        plainFromTextField(props.fields.TitleOne)
      ),
      content: <Placeholder name={phKeyOne} rendering={props.rendering} />,
    },
    {
      key: 'second_nav',
      title: isEditing ? (
        <Text field={props.fields.TitleTwo} />
      ) : (
        plainFromTextField(props.fields.TitleTwo)
      ),
      content: <Placeholder name={phKeyTwo} rendering={props.rendering} />,
    },
    {
      key: 'third_nav',
      title: isEditing ? (
        <Text field={props.fields.TitleThree} />
      ) : (
        plainFromTextField(props.fields.TitleThree)
      ),
      content: <Placeholder name={phKeyThree} rendering={props.rendering} />,
    },
    {
      key: 'fourth_nav',
      title: isEditing ? (
        <Text field={props.fields.TitleFour} />
      ) : (
        plainFromTextField(props.fields.TitleFour)
      ),
      content: <Placeholder name={phKeyFour} rendering={props.rendering} />,
    },
    {
      key: 'fifth_nav',
      title: isEditing ? (
        <Text field={props.fields.TitleFive} />
      ) : (
        plainFromTextField(props.fields.TitleFive)
      ),
      content: <Placeholder name={phKeyFive} rendering={props.rendering} />,
    },
  ];

  return (
    <section className={`component footer relative ${props.params.styles} overflow-hidden`} id={id}>
      <div className="bg-background-muted">
        <div className="container grid gap-12 py-28.5 lg:grid-cols-[1fr_3fr]">
          <div className="flex flex-col gap-7">
            <div className="sm:max-w-34">
              {isEditing ? (
                <Image field={props.fields.Logo} />
              ) : (
                <SitecoreOrNativeImage field={props.fields.Logo} isEditing={false} />
              )}
            </div>
            {isEditing ? (
              <RichText field={props.fields.Description} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: richTextHtml(props.fields.Description) }} />
            )}
          </div>
          <div className="grid gap-13 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5 xl:gap-12">
            {sections.map(({ key, title, content }) => (
              <div key={key}>
                <div className="text-accent mb-8 text-lg font-bold">{title}</div>
                <div className="space-y-4">{content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-background">
        <div className="container flex items-center justify-between py-8.5 max-sm:flex-col max-sm:items-start max-sm:gap-10">
          <div className="max-sm:order-2">
            {isEditing ? (
              <Text field={props.fields.CopyrightText} />
            ) : (
              plainFromTextField(props.fields.CopyrightText)
            )}
          </div>
          <div className="flex items-center justify-between gap-20 max-lg:gap-10 max-sm:order-1 max-sm:flex-col max-sm:items-start max-sm:gap-5">
            <Link field={props.fields.TermsText} className="hover:underline" />
            <Link field={props.fields.PolicyText} className="hover:underline" />
          </div>
        </div>
      </div>
    </section>
  );
};
