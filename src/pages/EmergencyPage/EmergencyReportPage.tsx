import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmergencyReportsTable from "../../components/tables/EmergencyReportsTable";

export default function EmergencyReportPage() {
  return (
    <>
      <PageMeta
        title="Emergency Report Page | LinkAid Dashboard"
        description="View and manage emergency reports in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Emergency Reports" />
      <div className="space-y-6">
        <EmergencyReportsTable />
      </div>
    </>
  );
}
