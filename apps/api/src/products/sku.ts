/** Product SKU: model code + colour code, e.g. "097382-190". Sizes add a suffix in their own SKUs. */
const SKU_PATTERN = /^\d{6}-\d{3}$/;

export function isValidSku(value: string): boolean {
  return SKU_PATTERN.test(value);
}
