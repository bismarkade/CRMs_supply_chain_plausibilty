import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MineralView from "@/app/components/MineralView";
import { getMinerals, getCompanies, getPaths } from "@/lib/data";

export function generateStaticParams() {
  return getMinerals().map((m) => ({ mineral: m.key }));
}

export default function MineralPage({
  params,
}: {
  params: { mineral: string };
}) {
  const mineral = getMinerals().find((m) => m.key === params.mineral);
  if (!mineral) notFound();
  const companies = getCompanies().filter((c) => c.mineral === params.mineral);
  const paths = getPaths(params.mineral);
  return (
    <>
      <Header />
      <MineralView mineral={mineral!} companies={companies} paths={paths} />
      <Footer />
    </>
  );
}
