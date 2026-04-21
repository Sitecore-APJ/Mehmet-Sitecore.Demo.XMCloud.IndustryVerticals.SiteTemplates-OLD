'use client';

import { plainFromTextField } from '@/helpers/sitecoreHydrationSafe';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { useHydrationSafeEditing } from '@/hooks/useHydrationSafeEditing';
import { ComponentProps } from 'lib/component-props';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { isParamEnabled } from '@/helpers/isParamEnabled';
import { useEffect, useState } from 'react';

interface OfferFields {
  id: string;
  displayName: string;
  name: string;
  url: string;
  fields: {
    OfferText: Field<string>;
  };
}

interface OfferProps extends ComponentProps {
  fields: {
    Offers: OfferFields[];
  };
}

const autoPlayDelay = 5000;

export const Default = (props: OfferProps) => {
  const isEditing = useHydrationSafeEditing();

  const [isMounted, setIsMounted] = useState(false);
  const id = props.params.RenderingIdentifier;
  const uid = props.rendering.uid;
  const datasource = props.fields?.Offers || [];
  const styles = `${props.params.styles || ''}`.trim();
  const autoPlay = isParamEnabled(props.params.Autoplay);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!datasource.length) {
    return isEditing ? (
      <div className={`component offers ${styles}`} id={id}>
        [OFFERS]
      </div>
    ) : (
      <></>
    );
  }

  return (
    <div className={`component offers ${styles}`} id={id}>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-5 p-2">
        {isMounted ? (
          <>
            <button
              className={`swiper-btn-prev-${uid}`}
              name="previous-offer"
              aria-label="Previous offer"
            >
              <ChevronLeft />
            </button>

            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                prevEl: `.swiper-btn-prev-${uid}`,
                nextEl: `.swiper-btn-next-${uid}`,
                disabledClass: 'pointer-events-none opacity-50',
              }}
              slidesPerView={1}
              centeredSlides
              noSwiping
              noSwipingClass="no-swiping"
              loop={true}
              autoplay={
                autoPlay
                  ? {
                      delay: autoPlayDelay,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              autoHeight
              className="mx-0! w-full transition-all"
            >
              {datasource.map((offer) => (
                <SwiperSlide key={offer.id} className="no-swiping text-center">
                  {isEditing ? (
                    <Text field={offer.fields.OfferText} />
                  ) : (
                    plainFromTextField(offer.fields.OfferText)
                  )}
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              className={`swiper-btn-next-${uid}`}
              name="next-offer"
              aria-label="Next offer"
            >
              <ChevronRight />
            </button>
          </>
        ) : (
          <span className="p-2 text-center">
            {plainFromTextField(datasource[0]?.fields.OfferText)}
          </span>
        )}
      </div>
    </div>
  );
};
