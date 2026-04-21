'use client';

import { plainFromTextField } from '@/helpers/sitecoreHydrationSafe';
import { Text as ContentSdkText } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { Product } from '@/types/products';
import StarRating from '../non-sitecore/StarRating';
import { useLocale } from '@/hooks/useLocaleOptions';
import { calculateAverageRating } from '@/helpers/productUtils';

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const isPageEditing = useHydrationSafeEditing();
  const { currency } = useLocale();

  const reviews = product?.Reviews || [];
  const reviewCount = reviews.length;
  const averageRating = calculateAverageRating(reviews);

  return (
    <>
      <h1 className="pt-3 text-4xl font-bold lg:pt-0">
        {isPageEditing ? (
          <ContentSdkText field={product.Title} />
        ) : (
          plainFromTextField(product.Title)
        )}
      </h1>

      {(product?.Price?.value || isPageEditing) && (
        <p className="text-xl">
          {currency}{' '}
          {isPageEditing ? (
            <ContentSdkText field={product.Price} />
          ) : (
            plainFromTextField(product.Price)
          )}
        </p>
      )}

      {!!product?.Reviews?.length && (
        <div className="flex items-center space-x-3">
          <span className="text-foreground text-lg">{averageRating}</span>
          <StarRating rating={averageRating} className="!text-accent" />
          <div className="bg-foreground-muted h-7 w-px" />
          <span className="text-foreground-muted text-sm">
            {reviewCount} Customer Review{reviewCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {(product?.ShortDescription?.value || isPageEditing) && (
        <p className="text-foreground text-lg">
          {isPageEditing ? (
            <ContentSdkText field={product.ShortDescription} />
          ) : (
            plainFromTextField(product.ShortDescription)
          )}
        </p>
      )}
    </>
  );
};
