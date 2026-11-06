import type { Size, SubscriptionResponse } from '@mm/shared';
import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { type SubscribeResult, subscribeToRestock } from '../../api/subscriptions';
import { Button } from '../../components/Button';

interface NotifyFormProps {
  sku: string;
  size: Size;
  onSubscribed: (status: SubscriptionResponse['status']) => void;
  onBack: () => void;
}

const INVALID_EMAIL = 'Enter a valid email address.';

const FAILURE_MESSAGES: Record<Exclude<SubscribeResult, { ok: true }>['reason'], string> = {
  INVALID_EMAIL,
  INVALID_SIZE: 'Alerts aren’t available for this size.',
  NOT_FOUND: 'This product is no longer available.',
  ERROR: 'Something went wrong. Please try again.',
};

/**
 * Email field for a back-in-stock request, sent to the API with the chosen size.
 * The browser's email check gives instant feedback; the API has the final say.
 */
export function NotifyForm({ sku, size, onSubscribed, onBack }: NotifyFormProps) {
  const inputId = useId();
  const emailErrorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const subscription = useMutation({
    mutationFn: (email: string) => subscribeToRestock({ data: { sku, size: size.label, email } }),
    onSuccess: (result) => {
      if (result.ok) {
        onSubscribed(result.status);
      } else if (result.reason === 'INVALID_EMAIL') {
        setEmailError(INVALID_EMAIL);
        inputRef.current?.focus();
      } else {
        setFormError(FAILURE_MESSAGES[result.reason]);
      }
    },
    // Couldn't reach this app's server at all, e.g. offline.
    onError: () => setFormError(FAILURE_MESSAGES.ERROR),
  });

  // The form replaces the size list inside an open dialog, so move focus to the field.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    if (!input || subscription.isPending) return;
    setFormError(undefined);
    if (!input.validity.valid) {
      setEmailError(INVALID_EMAIL);
      input.focus();
      return;
    }
    subscription.mutate(input.value.trim());
  }

  return (
    <form
      className="grid animate-slide-up gap-2 pt-4 motion-reduce:animate-none"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={subscription.isPending}
    >
      <p className="mb-2 font-sans text-body">We’ll email you when this size is back in stock.</p>
      <label htmlFor={inputId} className="caps">
        Email
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name="email"
        type="email"
        // text-base (16px) stops iOS Safari from zooming in on focus.
        className="h-12 border border-line bg-bg px-3 text-base aria-invalid:border-error"
        autoComplete="email"
        required
        onChange={() => setEmailError(undefined)}
        aria-invalid={emailError ? true : undefined}
        aria-describedby={emailError ? emailErrorId : undefined}
      />
      {emailError && (
        <p id={emailErrorId} className="caps text-error">
          {emailError}
        </p>
      )}
      {formError && (
        <p role="alert" className="caps text-error">
          {formError}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={subscription.isPending}>
          {subscription.isPending ? 'Sending…' : 'Notify me'}
        </Button>
      </div>
    </form>
  );
}
