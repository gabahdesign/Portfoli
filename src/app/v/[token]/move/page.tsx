import { redirect } from "next/navigation";
import { MOVE_URL } from "@/lib/move-url";

// Keep existing bookmarks and the move subdomain working during the migration.
export default function MovePage() {
  redirect(MOVE_URL);
}
