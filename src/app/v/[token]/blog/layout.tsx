
export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {

  return <>{children}</>;
}
