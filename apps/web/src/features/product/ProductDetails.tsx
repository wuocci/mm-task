import type { Product } from '@mm/shared';

interface ProductDetailsProps {
  pattern?: Product['pattern'] | undefined;
  details: Product['details'];
}

export function ProductDetails({ pattern, details }: ProductDetailsProps) {
  return (
    <section>
      <h2 className="sr-only">Product details</h2>
      {pattern && (
        <p className="caps pb-4">
          Pattern: {/* Looks like a link; becomes an <a href> once pattern pages exist. */}
          <span className="underline underline-offset-2">
            {pattern.name}, {pattern.designer}
          </span>
        </p>
      )}
      <div className="divide-y divide-divider border-y border-divider">
        <DetailItem title="Material">{details.material}</DetailItem>
        {details.fit && <DetailItem title="Fit">{details.fit}</DetailItem>}
      </div>
    </section>
  );
}

function DetailItem({ title, children }: { title: string; children: string }) {
  return (
    <details className="group">
      <summary className="caps flex min-h-12 cursor-pointer list-none items-center justify-between after:text-base after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <p className="pb-4 font-sans text-body">{children}</p>
    </details>
  );
}
