import { APP_TAGLINE } from "@/constants";
import Image from "next/image";

import { cn } from "@/lib/utils";

import {
  HOME_HERO_IMAGE,
  HOME_HERO_IMAGE_ALT,
  HOME_HERO_IMAGE_DISPLAY_IN,
  HOME_HERO_IMAGE_MAX_HEIGHT_IN,
} from "../constants/visual";
import { HomeHeroAuthActions } from "./HomeHeroAuthActions";

const taglineBreak = APP_TAGLINE.indexOf(". ");
const heroFirstLine =
  taglineBreak === -1 ? APP_TAGLINE : APP_TAGLINE.slice(0, taglineBreak + 1);
const heroSecondLine =
  taglineBreak === -1 ? null : APP_TAGLINE.slice(taglineBreak + 2);

const heroArtMaxWidthPx = HOME_HERO_IMAGE.width;
const { base, sm, md, lg, xl } = HOME_HERO_IMAGE_DISPLAY_IN;
const maxH = HOME_HERO_IMAGE_MAX_HEIGHT_IN;

const heroArtWidthClass = cn(
  "mx-auto h-auto object-contain object-center",
  `max-h-[min(${maxH.base}in,52vh)]`,
  `sm:max-h-[min(${maxH.sm}in,52vh)]`,
  `md:max-h-[min(${maxH.md}in,52vh)]`,
  `lg:max-h-[min(${maxH.lg}in,53vh)]`,
  `xl:max-h-[min(${maxH.xl}in,52vh)]`,
  `w-[min(100%,${base}in,${heroArtMaxWidthPx}px)]`,
  `sm:w-[min(100%,${sm}in,${heroArtMaxWidthPx}px)]`,
  `md:w-[min(100%,${md}in,${heroArtMaxWidthPx}px)]`,
  `lg:w-[min(100%,${lg}in,${heroArtMaxWidthPx}px)]`,
  `xl:w-[min(100%,${xl}in,${heroArtMaxWidthPx}px)]`,
);

export function HomeHero() {
  return (
    <div className="relative pb-8 pt-2 sm:pb-16 sm:pt-6">
      <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,40%)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,41%)]">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-extrabold leading-display tracking-tight text-on-board sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="block">{heroFirstLine}</span>
            {heroSecondLine ? (
              <span className="block">{heroSecondLine}</span>
            ) : null}
          </h1>
          <div className="mt-6 flex max-w-xl flex-col items-start gap-4 sm:mt-8 sm:gap-6 md:max-w-none lg:max-w-xl">
            <p className="text-sm leading-relaxed text-on-board-muted sm:text-lg">
              Share power tools, garden gear, kitchen appliances, and camping
              equipment with trusted neighbors. You approve each borrow, set a
              return date, and get a nudge if it’s overdue.
            </p>
            <HomeHeroAuthActions />
          </div>
        </div>

        <div className="pointer-events-none relative flex w-full min-w-0 items-center justify-center">
          <Image
            src={HOME_HERO_IMAGE}
            alt={HOME_HERO_IMAGE_ALT}
            priority
            className={heroArtWidthClass}
            sizes={`(min-width: 1280px) ${xl}in, (min-width: 1024px) ${lg}in, (min-width: 768px) ${md}in, (min-width: 640px) ${sm}in, ${base}in`}
          />
        </div>
      </div>
    </div>
  );
}
