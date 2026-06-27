import { notFound } from "next/navigation";
import ReportView from "@/app/components/ReportView";
import { getCompanies, getCompany, getMinerals } from "@/lib/data";

export function generateStaticParams() {
  return getCompanies().map((c) => ({ id: c.id }));
}

export default function ReportPage({ params }: { params: { id: string } }) {
  let company;
  try {
    company = getCompany(params.id);
  } catch {
    notFound();
  }
  const mineral = getMinerals().find((m) => m.key === company!.mineral);
  if (!mineral) notFound();
  const date = new Date().toISOString().slice(0, 10);
  return <ReportView company={company!} mineral={mineral!} date={date} />;
}
