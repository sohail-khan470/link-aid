import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import IncidentsReportsTable from "../../components/tables/IncidentReportsTable";

export default function IncidentsReportsPage() {
  return (
    <>
      <PageMeta
        title="Incidents Reports Page | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Incident Reports" />
      <div className="space-y-6">
        <IncidentsReportsTable />
      </div>
    </>
  );
}
