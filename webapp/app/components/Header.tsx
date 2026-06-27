import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-extrabold text-white">
            ◧
          </span>
          <span className="font-extrabold text-navy">CRM Plausibility</span>
        </Link>
        <nav className="flex gap-5 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-teal">
            Overview
          </Link>
          <Link href="/minerals/lithium" className="hover:text-teal">
            Lithium
          </Link>
          <Link href="/minerals/rare_earths" className="hover:text-teal">
            Rare Earths
          </Link>
          <Link href="/minerals/gold" className="hover:text-teal">
            Gold
          </Link>
        </nav>
      </div>
    </header>
  );
}
