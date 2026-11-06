import type { Colorway } from '@mm/shared';
import { Link } from '@tanstack/react-router';

interface ColorSelectorProps {
  colorways: readonly Colorway[];
  colorName: string;
}

/** Equal vertical stripes of the swatch colours, so a print reads as its main colours. */
function swatchBackground(colors: readonly string[]): string {
  const step = 100 / colors.length;
  const stops = colors.map((color, i) => `${color} ${i * step}% ${(i + 1) * step}%`);
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Colour swatches. Each colourway is its own product page, so swatches are real links: they work
 * before JavaScript loads and can open in a new tab. The router preloads a colour on hover or touch
 * and switches in place; the link to the current page gets `aria-current="page"` automatically.
 */
export function ColorSelector({ colorways, colorName }: ColorSelectorProps) {
  return (
    <div className="grid gap-2">
      <p className="caps">
        <span className="text-muted">Colour:</span> {colorName}
      </p>
      {colorways.length > 1 && (
        <ul className="flex gap-3" aria-label="Colours">
          {colorways.map((colorway) => (
            <li key={colorway.productId}>
              <Link
                to="/products/$productId"
                params={{ productId: colorway.productId }}
                // Switching colour shouldn't jump back to the top of the page.
                resetScroll={false}
                className="block size-7 border border-divider ring-offset-2 ring-offset-bg aria-[current=page]:ring-1 aria-[current=page]:ring-fg"
                style={{ background: swatchBackground(colorway.swatch) }}
              >
                <span className="sr-only">{colorway.colorName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
