import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InsuranceCompanyManagement from "../../components/insurance_company/InsuranceCompanyManagement";

export default function InsuranceCompanyPage() {
  return (
    <>
      <PageMeta
        title="Insurance Company Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Insurance Company" />
      <div className="space-y-6">
        <InsuranceCompanyManagement />
      </div>
    </>
  );
}
