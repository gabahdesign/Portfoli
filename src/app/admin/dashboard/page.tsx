import AdminOverview from "@/components/admin/AdminOverview";
import AccessRequests from "@/components/admin/AccessRequests";
import AccessManager from "../accesos/page";
export default function Dashboard() {
  return <><div className="p-4 md:p-8"><AccessRequests/></div><AdminOverview/><div className="p-4 md:p-8"><AccessManager/></div></>;
}
