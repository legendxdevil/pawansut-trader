import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/require-admin";

interface AdminIndexPageProps {
  params: { adminPath: string };
}

export default async function AdminIndexPage({ params }: AdminIndexPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect(`/${params.adminPath}/dashboard`);
  } else {
    redirect(`/${params.adminPath}/login`);
  }
}
