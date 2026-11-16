/* eslint-disable @next/next/no-img-element */
export function SiteHeader() {
  return (
    <div className="mx-auto flex max-w-5xl items-center px-6 pt-3">
      <img src="/logo.png" alt="Chez Léon" width={56} height={56} className="h-14 w-14 object-contain" />
    </div>
  );
}
