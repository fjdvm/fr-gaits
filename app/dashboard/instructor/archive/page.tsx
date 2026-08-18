import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ArchiveView } from "@/components/features/dashboard/archive-view";

export default async function InstructorArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const classes = await prisma.class.findMany({
    where: { instructorId: user.id, archived: true },
    select: { id: true, name: true, archived: true },
    orderBy: { name: "asc" },
  });

  return <ArchiveView role="instructor" classes={classes} />;
}
