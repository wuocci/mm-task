import type { Money } from '@mm/shared';

/** Finnish number format with the currency symbol attached: "149,00€". */
const LOCALE = 'fi-FI';

/** Formats a price given in minor units (cents). */
export function formatPrice({ amount, currency }: Money): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency })
    .formatToParts(amount / 100)
    .filter((part) => !(part.type === 'literal' && part.value.trim() === ''))
    .map((part) => part.value)
    .join('');
}
