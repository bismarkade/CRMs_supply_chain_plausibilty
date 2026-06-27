import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import CompanyView from "@/app/components/CompanyView";
import { getCompanies, getCompany } from "@/lib/data";

export function generateStaticParams() {
  return getCompanies().map((c) => ({ id: c.id }));
}

export default function CompanyPage({ params }: { params: { id: string } }) {
  let data;
  try {
    data = getCompany(params.id);
  } catch {
    notFound();
  }
  return (
    <>
      <Header />
      <CompanyView data={data!} />
    </>
  );
}
