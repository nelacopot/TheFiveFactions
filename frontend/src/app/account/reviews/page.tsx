import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { AccountNavigation } from "@/app/account/account-navigation";
import { ReviewDecisionForm } from "@/app/account/review-decision-form";
import { FactionIcon } from "@/components/faction-icon";

export const metadata: Metadata = {
  title: "Preverjanje dokazil · The Five Factions",
  robots: { index: false, follow: false },
};

const submittedDate = (value: string) => new Intl.DateTimeFormat("sl-SI", {
  timeZone: "Europe/Ljubljana",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(value));

async function ReviewsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?status=required");

  const { data: evidenceRows, error: evidenceError } = await supabase
    .from("evidence")
    .select("id, assignment_id, work_description, reflection_text, file_path, submitted_at")
    .eq("status", "awaiting_review")
    .order("submitted_at", { ascending: true })
    .limit(100);

  const evidence = evidenceRows ?? [];
  const assignmentIds = [...new Set(evidence.map((item) => item.assignment_id))];
  const { data: assignments, error: assignmentsError } = assignmentIds.length
    ? await supabase.from("task_assignments").select("id, user_id, task_id").in("id", assignmentIds)
    : { data: [], error: null };
  const assignmentById = new Map((assignments ?? []).map((assignment) => [assignment.id, assignment]));
  const otherMembersEvidence = evidence.flatMap((item) => {
    const assignment = assignmentById.get(item.assignment_id);
    return assignment && assignment.user_id !== user.id ? [{ ...item, assignment }] : [];
  });

  const taskIds = [...new Set(otherMembersEvidence.map((item) => item.assignment.task_id))];
  const memberIds = [...new Set(otherMembersEvidence.map((item) => item.assignment.user_id))];
  const [{ data: tasks, error: tasksError }, { data: profiles, error: profilesError }] = await Promise.all([
    taskIds.length
      ? supabase.from("tasks").select("id, title, description, faction_id").in("id", taskIds)
      : Promise.resolve({ data: [], error: null }),
    memberIds.length
      ? supabase.from("profiles").select("id, username").in("id", memberIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const taskRows = tasks ?? [];
  const factionIds = [...new Set(taskRows.map((task) => task.faction_id))];
  const { data: factions, error: factionsError } = factionIds.length
    ? await supabase.from("factions").select("id, name").in("id", factionIds)
    : { data: [], error: null };

  const taskById = new Map(taskRows.map((task) => [task.id, task]));
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const factionById = new Map((factions ?? []).map((faction) => [faction.id, faction.name]));
  const resolved = otherMembersEvidence.flatMap((item) => {
    const task = taskById.get(item.assignment.task_id);
    if (!task) return [];
    return [{
      ...item,
      task,
      username: profileById.get(item.assignment.user_id)?.username ?? "Član",
      factionName: factionById.get(task.faction_id) ?? "Ločina",
    }];
  });

  const imageEntries = await Promise.all(resolved.map(async (item) => {
    const expectedPrefix = `${item.assignment.user_id}/${item.assignment.id}/`;
    if (!item.file_path?.startsWith(expectedPrefix)) return [item.id, null] as const;
    const { data } = await supabase.storage.from("evidence").createSignedUrl(item.file_path, 300);
    return [item.id, data?.signedUrl ?? null] as const;
  }));
  const imageByEvidenceId = new Map(imageEntries);

  const { result } = await searchParams;
  const queryFailed = evidenceError || assignmentsError || tasksError || profilesError || factionsError;

  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window p-3 sm:p-5">
        <AccountNavigation active="reviews" />

        <section className="mt-5">
          {result === "approved" && <p role="status" className="retro-paper mb-4 px-3 py-2 text-sm">Dokazilo si potrdil_a; naloga je označena kot opravljena.</p>}
          {result === "rejected" && <p role="status" className="mb-4 border-2 border-[#b7a568] bg-[#332d1f] px-3 py-2 text-sm text-[#f4e5b1]">Dokazilo si zavrnil_a. Odločitev je shranjena.</p>}
          <h1 className="border-b-2 border-double border-[#9279b2] pb-2 text-3xl">Preverjanje dokazil</h1>

          {queryFailed ? (
            <p role="alert" className="mt-4 border-2 border-[#c07d98] bg-[#3b2030] p-4 text-sm text-[#ffd3e2]">
              Seznama dokazil trenutno ni mogoče naložiti. Poskusi znova.
            </p>
          ) : resolved.length === 0 ? (
            <div className="retro-panel mt-4 p-4">
              <p className="font-serif text-xl">Ni čakajočih dokazil.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {resolved.map((item) => {
                const imageUrl = imageByEvidenceId.get(item.id);
                return (
                  <article key={item.id} className="retro-panel p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FactionIcon name={item.factionName} size={58} />
                        <div>
                          <p className="font-mono text-[10px] font-bold uppercase text-[#e7ed86]">{item.factionName}</p>
                          <h2 className="mt-1 text-xl sm:text-2xl">{item.task.title}</h2>
                        </div>
                      </div>
                      <p className="border border-[#b7a568] bg-[#332d1f] px-2 py-1 font-mono text-[10px] font-bold uppercase text-[#f4e5b1]">Čaka na preverjanje</p>
                    </div>

                    <div className="mt-4 grid gap-2 border-y border-dotted border-[#8974a8] py-2 font-mono text-xs text-[#d3c4e5] sm:grid-cols-2">
                      <p>Oddal_a: <span className="font-medium text-[#e2d9ff]">{item.username}</span></p>
                      <p>Čas oddaje: <span className="font-medium text-[#e2d9ff]">{submittedDate(item.submitted_at)}</span></p>
                    </div>

                    <div className="retro-paper mt-4 p-3">
                      <h3 className="font-mono text-xs uppercase">Opis naloge</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6">{item.task.description}</p>
                    </div>

                    {item.work_description && (
                      <div className="mt-4">
                        <h3 className="font-mono text-xs font-bold uppercase text-[#e7ed86]">Opis opravljanja</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#eee6f6]">{item.work_description}</p>
                      </div>
                    )}
                    {item.reflection_text && (
                      <div className="mt-4">
                        <h3 className="font-mono text-xs font-bold uppercase text-[#e7ed86]">Osebni razmislek</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#eee6f6]">{item.reflection_text}</p>
                      </div>
                    )}
                    {imageUrl && (
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block w-fit outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#e7ed86]">
                        <Image src={imageUrl} alt={`Fotografija dokazila za nalogo ${item.task.title}`} width={1200} height={900} unoptimized className="max-h-[28rem] w-auto max-w-full border-4 border-white object-contain" />
                        <span className="mt-2 block font-mono text-[10px]">Odpri fotografijo v polni velikosti</span>
                      </a>
                    )}

                    <ReviewDecisionForm evidenceId={item.id} />
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ReviewsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
