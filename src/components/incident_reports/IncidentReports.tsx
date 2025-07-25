import { useIncidents } from "../../hooks/useIncidents";
import IncidentsReportsTable from "../tables/IncidentReportsTable";

const IncidentReports = () => {
  const { incidents } = useIncidents();

  console.log(incidents);
  return <IncidentsReportsTable />;
};

export default IncidentReports;
