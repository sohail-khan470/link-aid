import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InsurancePolicyTable from "../../components/insurance_company/InsurancePolicyTable";

export default function InsurancePolicyPage() {
  return (
    <>
      <PageMeta
        title="Insurance Policy Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Insurance Policy" />
      <div className="space-y-6">
        <InsurancePolicyTable />
      </div>
    </>
  );
}
