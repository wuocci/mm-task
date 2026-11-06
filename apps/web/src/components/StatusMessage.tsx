import { Button } from './Button';

interface MessageProps {
  title: string;
  text: string;
}

function Message({ title, text, children }: MessageProps & { children?: React.ReactNode }) {
  return (
    <section className="grid justify-items-start gap-4 px-4 py-8">
      <h1 className="text-lg font-medium tracking-caps uppercase">{title}</h1>
      <p>{text}</p>
      {children}
    </section>
  );
}

export function NotFoundMessage(props: MessageProps) {
  return <Message {...props} />;
}

export function ErrorMessage({ onRetry, ...props }: MessageProps & { onRetry: () => void }) {
  return (
    <Message {...props}>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </Message>
  );
}
