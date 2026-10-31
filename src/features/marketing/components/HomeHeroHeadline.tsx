import { APP_TAGLINE } from "@/constants";

const sentenceBreak = APP_TAGLINE.indexOf(". ");
const firstLine =
  sentenceBreak === -1 ? APP_TAGLINE : APP_TAGLINE.slice(0, sentenceBreak + 1);
const secondLine =
  sentenceBreak === -1 ? null : APP_TAGLINE.slice(sentenceBreak + 2);

export function HomeHeroHeadline() {
  return (
    <h1 className="font-display text-4xl font-extrabold leading-display tracking-tight text-on-board sm:text-6xl lg:text-8xl">
      <span className="block">{firstLine}</span>
      {secondLine ? <span className="block">{secondLine}</span> : null}
    </h1>
  );
}
