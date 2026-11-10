import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { AccountNavigation } from "@/app/account/account-navigation";
import { ReviewDecisionForm } from "@/app/account/review-decision-form";

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
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <AccountNavigation active="reviews" />

        <section className="mt-10 sm:mt-14">
          {result === "approved" && <p role="status" className="mb-6 rounded-xl border border-[#3e6659] bg-[#172a25] px-4 py-3 text-sm text-[#b9eedb]">Dokazilo si potrdil_a; naloga je označena kot opravljena.</p>}
          {result === "rejected" && <p role="status" className="mb-6 rounded-xl border border-[#74603b] bg-[#2a2418] px-4 py-3 text-sm text-[#f2d49e]">Dokazilo si zavrnil_a. Odločitev je shranjena.</p>}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c3a8ff]">Skupnost</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Preverjanje dokazil</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa5c0]">Preglej dokazila drugih članov. Prvo oddano odločitev shrani sistem, nato dokazilo izgine s seznama.</p>

          {queryFailed ? (
            <p role="alert" className="mt-8 rounded-2xl border border-[#704359] bg-[#2d1b28] p-6 text-sm text-[#ffc1d8]">
              Seznama dokazil trenutno ni mogoče naložiti. Poskusi znova.
            </p>
          ) : resolved.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#62518d] bg-[#171a31] p-8 text-center">
              <p className="font-serif text-2xl">Trenutno ni dokazil za preverjanje</p>
              <p className="mt-2 text-sm text-[#aaa5c0]">Ko drugi člani oddajo dokazila, se bodo prikazala tukaj.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {resolved.map((item) => {
                const imageUrl = imageByEvidenceId.get(item.id);
                return (
                  <article key={item.id} className="rounded-3xl border border-[#302b4b] bg-gradient-to-br from-[#171a31] to-[#111326] p-6 shadow-[0_24px_70px_-48px_rgba(12,8,38,0.8)] sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9a5ff]">{item.factionName}</p>
                        <h2 className="mt-2 font-serif text-2xl sm:text-3xl">{item.task.title}</h2>
                      </div>
                      <p className="rounded-full border border-[#62518d] bg-[#27203c] px-3 py-1.5 text-xs font-semibold text-[#d3c5ff]">Čaka na preverjanje</p>
                    </div>

                    <div className="mt-5 grid gap-2 text-sm text-[#aaa5c0] sm:grid-cols-2">
                      <p>Oddal_a: <span className="font-medium text-[#e2d9ff]">{item.username}</span></p>
                      <p>Čas oddaje: <span className="font-medium text-[#e2d9ff]">{submittedDate(item.submitted_at)}</span></p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#302b4b] bg-[#0e1122]/70 p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b9a5ff]">Opis naloge</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#b9b4cf]">{item.task.description}</p>
                    </div>

                    {item.work_description && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-[#d3c5ff]">Opis opravljanja</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#e2d9f5]">{item.work_description}</p>
                      </div>
                    )}
                    {item.reflection_text && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-[#d3c5ff]">Osebni razmislek</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#e2d9f5]">{item.reflection_text}</p>
                      </div>
                    )}
                    {imageUrl && (
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-5 block w-fit rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#b9a5ff]">
                        <Image src={imageUrl} alt={`Fotografija dokazila za nalogo ${item.task.title}`} width={1200} height={900} unoptimized className="max-h-[28rem] w-auto max-w-full rounded-xl border border-[#40395e] object-contain" />
                        <span className="mt-2 block text-xs text-[#b9a5ff]">Odpri fotografijo v polni velikosti</span>
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
