import Link from 'next/link';

export function Sidebar() {
  return (
    <div id="tour-sidebar" className="hidden border-r bg-muted/40 md:block w-64 h-full shrink-0">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="">Smart City</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            id="tour-map-view"
            href="/map"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            Map View
          </Link>
        </nav>
      </div>
    </div>
  );
}
