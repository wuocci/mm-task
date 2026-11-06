/** Loading placeholder with the same shape as the product page, so content doesn't jump. */
export function ProductSkeleton() {
  const block = 'animate-pulse bg-surface motion-reduce:animate-none';

  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading product…
      </p>
      <div aria-hidden="true">
        <div className={`${block} aspect-4/5`} />
        <div className="grid gap-3 px-4 py-6">
          <div className={`${block} h-8 w-3/5`} />
          <div className={`${block} h-5 w-2/5`} />
          <div className={`${block} h-5 w-2/5`} />
          <div className={`${block} mt-3 h-12`} />
        </div>
      </div>
    </div>
  );
}
