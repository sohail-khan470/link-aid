import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmergencyReports from "../../components/emergency-reports/EmergencyReports";

export default function EmergencyReportsPage() {
  return (
    <>
      <PageMeta
        title="Towing Company Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Emergency Reports" />
      <div className="space-y-6">
        <EmergencyReports />
      </div>
    </>
  );
}
