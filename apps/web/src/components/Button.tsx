import type { ComponentProps } from 'react';

const base =
  'h-12 cursor-pointer border border-line px-6 tracking-caps uppercase disabled:cursor-progress disabled:text-muted';

const variants = {
  primary: 'bg-fg text-bg',
  secondary: 'bg-transparent text-fg',
};

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variants;
}

/** Square, uppercase button. `className` is for layout only (width, flex), not colours. */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
