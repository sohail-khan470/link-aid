import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InsuranceHolderTable from "../../components/insurance_company/InsuranceHolderTable";

export default function InsuranceHolderPage() {
  return (
    <>
      <PageMeta
        title="Insurance Holder Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Insurance Holders" />
      <div className="space-y-6">
        <InsuranceHolderTable />
      </div>
    </>
  );
}
