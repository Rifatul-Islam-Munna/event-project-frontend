"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import image1 from "@/assets/hero/image1.avif";
import image2 from "@/assets/hero/image2.avif";
import image3 from "@/assets/hero/image3.avif";
import image4 from "@/assets/hero/image4.avif";

const HeroSlider = () => {
  const images = [
    { src: image1, alt: "Hero Image 1" },
    { src: image2, alt: "Hero Image 2" },
    { src: image3, alt: "Hero Image 3" },
    { src: image4, alt: "Hero Image 4" },
  ];

  return (
    <div className="relative w-full">
      {/* Responsive Height Container */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] xl:h-[700px] max-h-[700px]">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            dynamicBullets: false,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          speed={800}
          effect="fade"
          className="h-full w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={3500}
                  height={1000}
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                  quality={90}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Styles for Pagination Dots */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background: #ffffff;
          width: 32px;
          border-radius: 6px;
        }

        .swiper-pagination {
          bottom: 20px !important;
        }

        @media (max-width: 768px) {
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }

          .swiper-pagination-bullet-active {
            width: 24px;
          }

          .swiper-pagination {
            bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
