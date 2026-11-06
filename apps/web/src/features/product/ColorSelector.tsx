import type { Colorway } from '@mm/shared';
import type { MouseEvent } from 'react';
import { navigate, productPath } from '../../routing';

interface ColorSelectorProps {
  colorways: readonly Colorway[];
  currentId: string;
  colorName: string;
}

/** Equal vertical stripes of the swatch colours, so a print reads as its main colours. */
function swatchBackground(colors: readonly string[]): string {
  const step = 100 / colors.length;
  const stops = colors.map((color, i) => `${color} ${i * step}% ${(i + 1) * step}%`);
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Colour swatches. Each colourway is its own product page, so swatches are real links:
 * they work without JavaScript and can be opened in a new tab, but switch in place on a plain click.
 */
export function ColorSelector({ colorways, currentId, colorName }: ColorSelectorProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>, productId: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (productId !== currentId) navigate(productPath(productId));
  }

  return (
    <div className="grid gap-2">
      <p className="caps">
        <span className="text-muted">Colour:</span> {colorName}
      </p>
      {colorways.length > 1 && (
        <ul className="flex gap-3" aria-label="Colours">
          {colorways.map((colorway) => {
            const current = colorway.productId === currentId;
            return (
              <li key={colorway.productId}>
                <a
                  href={productPath(colorway.productId)}
                  onClick={(event) => handleClick(event, colorway.productId)}
                  aria-current={current ? 'page' : undefined}
                  className="block size-7 border border-divider ring-offset-2 ring-offset-bg aria-[current=page]:ring-1 aria-[current=page]:ring-fg"
                  style={{ background: swatchBackground(colorway.swatch) }}
                >
                  <span className="sr-only">{colorway.colorName}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
