import type { CSSProperties } from "react";
import tokens from "../../PHASE_2_DESIGN_TOKENS.json";

type ThemeStyle = CSSProperties & Record<`--${string}`, string | number>;
const toKebabCase = (name: string) =>
  name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

/** The approved JSON is the single source for the runtime palette. */
export const themeStyle: ThemeStyle = {
  ...Object.fromEntries(
    Object.entries(tokens.colors).map(([name, value]) => [
      `--sb-${toKebabCase(name)}`,
      value,
    ]),
  ),
  "--sb-font": tokens.type.fontFamily,
  "--sb-body-size": `${tokens.type.bodyPx}px`,
  "--sb-page-size": `${tokens.type.pageHeadingPx}px`,
  "--sb-mobile-heading-size": `${tokens.type.mobileHeadingPx}px`,
  "--sb-panel-heading-size": `${tokens.type.panelHeadingPx}px`,
  "--sb-metadata-size": `${tokens.type.metadataPx}px`,
  "--sb-line-height": tokens.type.lineHeight,
  "--sb-heading-line-height": tokens.type.headingLineHeight,
  "--sb-radius": `${tokens.radiusPx.widget}px`,
  "--sb-control-radius": `${tokens.radiusPx.control}px`,
  "--sb-badge-radius": `${tokens.radiusPx.badge}px`,
  "--sb-focus-width": `${tokens.interaction.focusRingPx}px`,
  "--sb-transition": `${tokens.interaction.transitionMs[0]}ms`,
  ...Object.fromEntries(
    tokens.spacingPx.map((value) => [`--sb-space-${value}`, `${value}px`]),
  ),
};
