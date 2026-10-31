import heroImage from "../../../../public/images/hero-image.png";

/** Static import so the URL hashes with file contents and cache-busts on replace. */
export const HOME_HERO_IMAGE = heroImage;

const HERO_ASPECT = heroImage.height / heroImage.width;

/** Match height cap to width cap so `object-contain` never over-shrinks the art. */
function heroHeightInForWidthIn(widthIn: number): number {
  return Math.round(widthIn * HERO_ASPECT * 100) / 100;
}

/**
 * Tuned display width (CSS in, ~96dpi). `lg` ≈ midpoint between 5.25″ (small) and 5.875″ (large).
 */
export const HOME_HERO_IMAGE_DISPLAY_IN = {
  base: 4.625,
  sm: 5,
  md: 5.25,
  lg: 5.5625,
  xl: 5.875,
} as const;

export const HOME_HERO_IMAGE_MAX_HEIGHT_IN = {
  base: heroHeightInForWidthIn(HOME_HERO_IMAGE_DISPLAY_IN.base),
  sm: heroHeightInForWidthIn(HOME_HERO_IMAGE_DISPLAY_IN.sm),
  md: heroHeightInForWidthIn(HOME_HERO_IMAGE_DISPLAY_IN.md),
  lg: heroHeightInForWidthIn(HOME_HERO_IMAGE_DISPLAY_IN.lg),
  xl: heroHeightInForWidthIn(HOME_HERO_IMAGE_DISPLAY_IN.xl),
} as const;

export const HOME_HERO_IMAGE_ALT =
  "Illustration of shareable items: drill, bowl, garden trowel, and camping lantern." as const;
