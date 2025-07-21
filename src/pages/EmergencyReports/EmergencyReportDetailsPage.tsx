import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmergencyReportDetail from "../../components/emergency-reports/EmergencyReportDetail";

export default function EmergencyReportDetailsPage() {
  return (
    <>
      <PageMeta
        title="Towing Company Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Emergency Report Details" />
      <div className="space-y-6">
        <EmergencyReportDetail />
      </div>
    </>
  );
}
