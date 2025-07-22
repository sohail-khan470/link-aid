import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useUserRole } from "../../hooks/use-role";
import InsuranceCompanyPage from "../InsuranceCompany/InsuranceCompanyPage";
import TowingCompanyPage from "../TowingCompany/TowingCompanyPage";
import { Navigate } from "react-router-dom";

const CompanyPage = () => {
  const role = useUserRole();

  if (role === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {role === "towing_company" && <TowingCompanyPage />}
      {role === "insurer" && <InsuranceCompanyPage />}
      {!["towing_company", "insurer"].includes(role) && (
        <Navigate to="/home" replace />
      )}
    </>
  );
};

export default CompanyPage;
