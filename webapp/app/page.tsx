import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardClient from "./components/DashboardClient";
import { getMinerals, getCompanies, getPaths } from "@/lib/data";

export default function Home({
  searchParams,
}: {
  searchParams: { mineral?: string };
}) {
  const minerals = getMinerals();
  const companies = getCompanies();
  const paths = getPaths("all");
  return (
    <>
      <Header />
      <DashboardClient
        minerals={minerals}
        companies={companies}
        paths={paths}
        initialMineral={searchParams.mineral || "all"}
      />
      <Footer />
    </>
  );
}
