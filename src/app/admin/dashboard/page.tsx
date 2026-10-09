import AdminOverview from "@/components/admin/AdminOverview";
import AccessRequests from "@/components/admin/AccessRequests";
import AccessManager from "../accesos/page";
import CalendarStatistics from "@/components/admin/CalendarStatistics";
export default function Dashboard() {
  return <><div className="p-4 md:p-8"><AccessRequests/></div><AdminOverview/><CalendarStatistics/><div className="p-4 md:p-8"><AccessManager/></div></>;
}
