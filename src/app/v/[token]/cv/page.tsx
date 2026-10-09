import { redirect } from "next/navigation";

export default async function CVPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/v/${token}/sobre-mi`);
}
