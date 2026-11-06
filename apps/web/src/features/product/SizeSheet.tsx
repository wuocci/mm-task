import type { Size, SubscriptionResponse } from '@mm/shared';
import { type MouseEvent, useEffect, useId, useRef, useState } from 'react';
import { NotifyForm } from './NotifyForm';

interface SizeSheetProps {
  open: boolean;
  sku: string;
  sizes: readonly Size[];
  onAdd: (size: Size) => void;
  onSubscribed: (size: Size, status: SubscriptionResponse['status']) => void;
  onClose: () => void;
}

/**
 * Slide-up size list built on a native modal `<dialog>`: the browser handles focus trapping,
 * Esc to close and the backdrop. Picking a sold-out size swaps the list for a notify form.
 */
export function SizeSheet({ open, sku, sizes, onAdd, onSubscribed, onClose }: SizeSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();
  const [notifySize, setNotifySize] = useState<Size>();
  // Set when coming back from the notify form, so focus returns to the size that was picked.
  const [returnFocusSku, setReturnFocusSku] = useState<string>();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (notifySize || !returnFocusSku) return;
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-sku="${CSS.escape(returnFocusSku)}"]`)
      ?.focus();
  }, [notifySize, returnFocusSku]);

  function close() {
    setNotifySize(undefined);
    setReturnFocusSku(undefined);
    onClose();
  }

  function handleSizeClick(size: Size) {
    if (size.inStock) {
      onAdd(size);
    } else {
      setNotifySize(size);
    }
  }

  function handleBack() {
    setReturnFocusSku(notifySize?.sku);
    setNotifySize(undefined);
  }

  function handleSubscribed(status: SubscriptionResponse['status']) {
    if (notifySize) onSubscribed(notifySize, status);
  }

  // The sheet's content fills the dialog, so a click on the dialog itself is a click on the backdrop.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a pointer shortcut; keyboard users close with Esc, which the dialog handles natively.
    <dialog
      ref={dialogRef}
      // Slides up from the bottom; @starting-style (the starting: variant) sets where the
      // animation begins. Browsers without it simply open the sheet instantly.
      className="m-auto mb-0 max-h-[80dvh] w-full max-w-content translate-y-full bg-bg text-fg transition-[translate,overlay,display] transition-discrete duration-250 ease-out backdrop:bg-transparent backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-250 open:translate-y-0 open:backdrop:bg-backdrop starting:open:translate-y-full starting:open:backdrop:bg-transparent motion-reduce:transition-none motion-reduce:backdrop:transition-none"
      aria-labelledby={titleId}
      onClose={close}
      onClick={handleClick}
    >
      <div className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between border-b border-divider">
          <h2 id={titleId} className="caps">
            {notifySize ? `Size ${notifySize.label} · Sold out` : 'Select size'}
          </h2>
          <button
            type="button"
            className="-mr-3 size-12 cursor-pointer text-lg"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {notifySize ? (
          <NotifyForm
            sku={sku}
            size={notifySize}
            onSubscribed={handleSubscribed}
            onBack={handleBack}
          />
        ) : (
          <ul ref={listRef}>
            {sizes.map((size) => (
              <li key={size.sku}>
                <button
                  type="button"
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between border-b border-divider px-2 text-left text-base hover:bg-surface"
                  onClick={() => handleSizeClick(size)}
                  data-sku={size.sku}
                >
                  <span>{size.label}</span>
                  {!size.inStock && <span className="caps text-muted">Sold out · Notify me</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
