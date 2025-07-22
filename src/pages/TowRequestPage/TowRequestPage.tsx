import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TowRequestsTable from "../../components/tables/TowRequestTable";

export default function TowRequestsPage() {
  return (
    <>
      <PageMeta
        title="Tow Requests | LinkAid Dashboard"
        description="View and manage basic tow request tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Tow Request" />
      <div className="space-y-6">
        <TowRequestsTable />
      </div>
    </>
  );
}
