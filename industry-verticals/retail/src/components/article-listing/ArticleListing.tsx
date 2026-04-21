'use client';

import { plainFromTextField, SitecoreOrNativeImage } from '@/helpers/sitecoreHydrationSafe';
import {
  Field,
  ImageField,
  RichTextField,
  Text as ContentSdkText,
  DateField,
  Placeholder,
} from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faTag } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ComponentProps } from '@/lib/component-props';
import Link from 'next/link';
import { useI18n } from 'next-localization';
import { sortByDateDesc, getCategoryCounts } from '@/helpers/articleUtils';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '../non-sitecore/Pagination';
import { Author, Category, Tag } from '@/types/article';

export interface Article {
  Title: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
  PublishedDate: Field<string>;
  Author: Author;
  Tags: Tag[];
  Category: Category;
}

interface ArticleListingProps extends ComponentProps {
  params: { [key: string]: string };
  fields: {
    items: {
      id: string;
      url: string;
      fields: Article;
    }[];
  };
}

export const Default = (props: ArticleListingProps) => {
  const { t } = useI18n();
  const id = props.params.RenderingIdentifier;
  const searchBarPlaceholderKey = `article-listing-search-bar-${props.params.DynamicPlaceholderId}`;
  const recentPostsPlaceholderKey = `article-listing-side-bar-${props.params.DynamicPlaceholderId}`;
  const isPageEditing = useHydrationSafeEditing();

  // sort by latest published
  const articles = props.fields?.items
    .filter((article) => article.fields && Object.keys(article.fields)?.length > 0)
    .sort(sortByDateDesc);

  // categories with article counts
  const categoryCounts = getCategoryCounts(articles);

  // filter and pagination
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArticles = selectedCategory
    ? articles.filter(
        (article) => article.fields?.Category?.fields?.Category?.value === selectedCategory
      )
    : articles;

  const articlesPerPage = 3;
  const { getPageSlice } = usePagination({
    totalItems: filteredArticles.length,
    currentPage,
    itemsPerPage: articlesPerPage,
    windowSize: 3,
  });

  const [startIndex, endIndex] = getPageSlice();
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  return (
    <section
      className={`component article-listing py-6 ${props?.params?.styles?.trimEnd()}`}
      id={id}
    >
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[3fr_1fr]">
        {/* Left column */}
        <div className="space-y-16">
          {paginatedArticles.map((article) => {
            const publishedDateRaw = article.fields?.PublishedDate?.value;
            const hasValidDate = !!(
              publishedDateRaw && !publishedDateRaw.startsWith('0001-01-01')
            );

            return (
              <article key={article.id} className="space-y-4">
                <div className="relative aspect-3/2 w-full overflow-hidden rounded-lg md:aspect-9/4">
                  {article.fields?.Image && (
                    <SitecoreOrNativeImage
                      field={article.fields.Image}
                      isEditing={isPageEditing}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  {isPageEditing ? (
                    <ContentSdkText
                      field={article.fields?.Title}
                      tag="h3"
                      className="font-semibold transition-colors"
                    />
                  ) : (
                    <h3 className="font-semibold transition-colors">
                      {plainFromTextField(article.fields?.Title)}
                    </h3>
                  )}

                  <div className="text-foreground-light flex items-center gap-10 text-xs sm:text-sm">
                    {(article.fields?.Author?.fields?.AuthorName?.value || isPageEditing) && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser as IconProp} />
                        {isPageEditing ? (
                          <ContentSdkText
                            field={article.fields?.Author?.fields?.AuthorName}
                            tag="span"
                            className="text-inherit"
                          />
                        ) : (
                          plainFromTextField(article.fields?.Author?.fields?.AuthorName)
                        )}
                      </span>
                    )}

                    {(hasValidDate || isPageEditing) && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar as IconProp} />
                        {isPageEditing ? (
                          <DateField
                            field={article.fields?.PublishedDate}
                            render={(date) =>
                              date
                                ? new Date(date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : null
                            }
                          />
                        ) : hasValidDate ? (
                          <span suppressHydrationWarning>
                            {new Date(publishedDateRaw as string).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : null}
                      </span>
                    )}

                    {(article.fields?.Category?.fields?.Category?.value || isPageEditing) && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTag as IconProp} />
                        {isPageEditing ? (
                          <ContentSdkText
                            field={article.fields?.Category?.fields?.Category}
                            tag="span"
                            className="text-inherit"
                          />
                        ) : (
                          plainFromTextField(article.fields?.Category?.fields?.Category)
                        )}
                      </span>
                    )}
                  </div>

                  {isPageEditing ? (
                    <ContentSdkText
                      field={article.fields?.ShortDescription}
                      tag="p"
                      className="line-clamp-5 text-justify text-lg"
                    />
                  ) : (
                    <p className="line-clamp-5 text-justify text-lg">
                      {plainFromTextField(article.fields?.ShortDescription)}
                    </p>
                  )}

                  <Link href={article.url} className="arrow-btn" aria-label="Read full article">
                    {t('read_more_btn_text') || 'Read More'}
                  </Link>
                </div>
              </article>
            );
          })}

          {/* Pagination */}
          <Pagination
            totalItems={filteredArticles.length}
            itemsPerPage={articlesPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Right column */}
        <div className="space-y-8 p-4">
          {/* Search placeholder */}
          <Placeholder name={searchBarPlaceholderKey} rendering={props.rendering} />

          {/* Categories */}
          <div className="text-foreground mb-5 text-lg font-bold">
            {t('categories_text') || 'Categories'}
          </div>
          <ul className="text-foreground-muted space-y-4 text-sm">
            <li className="flex justify-between">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className={`flex-1 text-left ${!selectedCategory ? 'text-accent font-bold' : ''}`}
              >
                {t('show_all_text') || 'Show All'}
              </button>
              <span>{articles.length}</span>
            </li>
            {Object.values(categoryCounts).map((category) => (
              <li key={category.name} className="flex justify-between">
                <button
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 text-left ${
                    selectedCategory === category.name ? 'text-accent font-bold' : ''
                  }`}
                >
                  {category.name}
                </button>
                <span>{category.count}</span>
              </li>
            ))}
          </ul>

          {/* Side Bar Placeholder */}
          <Placeholder name={recentPostsPlaceholderKey} rendering={props.rendering} />
        </div>
      </div>
    </section>
  );
};
