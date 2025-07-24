import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ActionsLogTable from "../../components/tables/ActionLogTable";

export default function ActionLogPage() {
  return (
    <>
      <PageMeta
        title="Activities | LinkAid Dashboard"
        description="View and manage basic tow request tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Actions logs" />
      <div className="space-y-6">
        <ActionsLogTable />
      </div>
    </>
  );
}
