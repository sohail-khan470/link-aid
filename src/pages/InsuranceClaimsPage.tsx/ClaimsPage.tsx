import ClaimsManagement from "../../components/cliams/ClaimsManagement";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
export default function InsurerClaimsPage() {
  return (
    <>
      <PageMeta
        title="Insurance Company Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Claims Table" />
      <div className="space-y-6">
        <ClaimsManagement />
      </div>
    </>
  );
}
