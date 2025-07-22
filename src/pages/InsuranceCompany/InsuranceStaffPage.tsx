import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InsuranceStaffManagement from "../../components/insurance_company/InsuranceStaffMangement";

export default function InsuranceStaffPage() {
  return (
    <>
      <PageMeta
        title="Insurance Staff Page | LinkAid Dashboard"
        description="View and manage Insurance Staff in the LinkAid Insurance Company Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Company Staff" />
      <div className="space-y-6">
        <InsuranceStaffManagement />
      </div>
    </>
  );
}
