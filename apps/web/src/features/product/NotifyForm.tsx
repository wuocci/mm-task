import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../components/Button';

interface NotifyFormProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
}

/** Email field for a back-in-stock request. Uses the browser's email check, with our own message. */
export function NotifyForm({ onSubmit, onBack }: NotifyFormProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  // The form replaces the size list inside an open dialog, so move focus to the field.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    if (!input.validity.valid) {
      setError('Enter a valid email address.');
      input.focus();
      return;
    }
    onSubmit(input.value.trim());
  }

  return (
    <form
      className="grid animate-slide-up gap-2 pt-4 motion-reduce:animate-none"
      onSubmit={handleSubmit}
      noValidate
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
        onChange={() => setError(undefined)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="caps text-error">
          {error}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Notify me
        </Button>
      </div>
    </form>
  );
}
