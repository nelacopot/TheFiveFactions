"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitEvidenceAction, type EvidenceActionState } from "./evidence-actions";

const initialState: EvidenceActionState = { status: "idle", message: "" };

export function EvidenceForm({ assignmentId }: { assignmentId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const submitForAssignment = submitEvidenceAction.bind(null, assignmentId);
  const [state, formAction] = useActionState(submitForAssignment, initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadMessage("");

    const formData = new FormData(event.currentTarget);
    const photoEntry = formData.get("photo");
    const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;
    formData.delete("photo");

    if (photo) {
      if (photo.size > 50 * 1024 * 1024) {
        setUploadMessage("Fotografija je lahko velika največ 50 MiB.");
        return;
      }

      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensions[photo.type];
      if (!extension) {
        setUploadMessage("Naloži fotografijo v formatu JPEG, PNG ali WebP.");
        return;
      }

      setIsUploading(true);
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setUploadMessage("Za oddajo dokazila se ponovno prijavi.");
          return;
        }

        const filePath = `${user.id}/${assignmentId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("evidence")
          .upload(filePath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) {
          setUploadMessage("Fotografije ni bilo mogoče varno shraniti. Poskusi znova.");
          return;
        }
        formData.set("filePath", filePath);
      } catch {
        setUploadMessage("Pri nalaganju fotografije je prišlo do napake. Poskusi znova.");
        return;
      } finally {
        setIsUploading(false);
      }
    }

    startSubmitting(() => formAction(formData));
  }

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-[#302b4b] pt-5">
      <div>
        <label htmlFor={`work-${assignmentId}`} className="mb-2 block text-sm font-medium text-[#d3c5ff]">
          Opis opravljanja naloge <span className="font-normal text-[#aaa5c0]">(neobvezno)</span>
        </label>
        <textarea
          id={`work-${assignmentId}`}
          name="workDescription"
          rows={3}
          maxLength={5000}
          placeholder="Opiši, kako si opravil_a nalogo …"
          className="w-full resize-y rounded-xl border border-[#40395e] bg-[#0e1122] px-4 py-3 text-sm leading-6 text-[#f0edfa] outline-none transition placeholder:text-[#817b9d] focus:border-[#9f85ed] focus:ring-2 focus:ring-[#7762be]/25"
        />
      </div>

      <div>
        <label htmlFor={`reflection-${assignmentId}`} className="mb-2 block text-sm font-medium text-[#d3c5ff]">
          Osebni razmislek <span className="font-normal text-[#aaa5c0]">(neobvezno)</span>
        </label>
        <textarea
          id={`reflection-${assignmentId}`}
          name="reflectionText"
          rows={3}
          maxLength={5000}
          placeholder="Kaj si opazil_a ali se naučil_a?"
          className="w-full resize-y rounded-xl border border-[#40395e] bg-[#0e1122] px-4 py-3 text-sm leading-6 text-[#f0edfa] outline-none transition placeholder:text-[#817b9d] focus:border-[#9f85ed] focus:ring-2 focus:ring-[#7762be]/25"
        />
      </div>

      <div>
        <label htmlFor={`photo-${assignmentId}`} className="mb-2 block text-sm font-medium text-[#d3c5ff]">
          Fotografija <span className="font-normal text-[#aaa5c0]">(neobvezno)</span>
        </label>
        <input
          id={`photo-${assignmentId}`}
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full cursor-pointer rounded-xl border border-[#40395e] bg-[#0e1122] text-sm text-[#c9c2dc] file:mr-4 file:border-0 file:bg-[#27203c] file:px-4 file:py-3 file:font-medium file:text-[#d3c5ff] hover:file:bg-[#38305f]"
        />
        <p className="mt-2 text-xs text-[#aaa5c0]">JPEG, PNG ali WebP; največ 50 MiB. Vsaj eno polje mora vsebovati dokazilo.</p>
      </div>

      {(uploadMessage || state.message) && (
        <p
          role={uploadMessage || state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${uploadMessage || state.status === "error" ? "border-[#704359] bg-[#2d1b28] text-[#ffc1d8]" : "border-[#3e6659] bg-[#172a25] text-[#b9eedb]"}`}
        >
          {uploadMessage || state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isUploading || isSubmitting}
        className="rounded-full bg-[#423875] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#594b91] disabled:cursor-wait disabled:opacity-65"
      >
        {isUploading || isSubmitting ? "Oddajam dokazilo …" : "Oddaj dokazilo"}
      </button>
    </form>
  );
}
