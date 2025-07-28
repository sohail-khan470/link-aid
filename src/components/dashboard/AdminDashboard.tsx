import EcommerceMetrics from "../ecommerce/EcommerceMetrics";
import StatisticsChart from "../ecommerce/StatisticsChart";
import MonthlyTarget from "../ecommerce/MonthlyTarget";
import RecentOrders from "../ecommerce/RecentOrders";
import PageMeta from "../common/PageMeta";
import MonthlyRegistrationsChart from "../ecommerce/MonthlyRegistrationsChart";
import ActionsLogChart from "../ecommerce/ActionsLogChart";

export default function AdminDashboard() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlyRegistrationsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-3">
          <ActionsLogChart />
          <RecentOrders />
        </div>

        <div className="col-span-12">{/* <RecentOrders /> */}</div>
      </div>
    </>
  );
}
