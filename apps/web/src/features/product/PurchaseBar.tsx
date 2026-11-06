import type { Money, Size } from '@mm/shared';
import { useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { formatPrice } from '../../lib/format';
import { SizeSheet } from './SizeSheet';

interface PurchaseBarProps {
  sizes: readonly Size[];
  price: Money;
}

/**
 * Sticky bar with a "Select size" button and the price that opens the size sheet.
 * Picking a size adds it to the bag; a sold-out size leads to a back-in-stock request.
 * There's no cart or notification service, so both only show a confirmation.
 */
export function PurchaseBar({ sizes, price }: PurchaseBarProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  function openSheet() {
    setConfirmation('');
    setSheetOpen(true);
  }

  // Return focus explicitly: Safari doesn't focus buttons on tap, so the dialog has nothing to restore.
  function closeSheet() {
    setSheetOpen(false);
    buttonRef.current?.focus();
  }

  function handleAdd(size: Size) {
    closeSheet();
    setConfirmation(`Added · size ${size.label}`);
  }

  // The email isn't sent or stored anywhere: there's no notification service behind this demo.
  function handleNotify(size: Size, _email: string) {
    closeSheet();
    setConfirmation(`We’ll email you when size ${size.label} is back in stock`);
  }

  return (
    <div className="sticky bottom-0 grid gap-2 border-t border-divider bg-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Always rendered so screen readers announce the message when it changes. */}
      <p role="status" className="caps empty:hidden">
        {confirmation}
      </p>
      <div className="flex items-center gap-4">
        <Button ref={buttonRef} className="flex-1" onClick={openSheet} aria-haspopup="dialog">
          Select size
        </Button>
        <p className="shrink-0">{formatPrice(price)}</p>
      </div>
      <SizeSheet
        open={sheetOpen}
        sizes={sizes}
        onAdd={handleAdd}
        onNotify={handleNotify}
        onClose={closeSheet}
      />
    </div>
  );
}
