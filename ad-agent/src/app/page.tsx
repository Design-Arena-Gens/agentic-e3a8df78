"use client";

import { useMemo, useState, useTransition } from "react";
import type { GeneratedAsset, PipelineResult } from "@/lib/types";

type SceneStatusProps = {
  asset?: GeneratedAsset;
  label: string;
};

export default function Home() {
  const [product, setProduct] = useState("Vivo T3 5G");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productName = formData.get("product")?.toString().trim() ?? "";

    if (!productName) {
      setError("Product name cannot be empty.");
      return;
    }

    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: productName }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        result?: PipelineResult;
        error?: string;
      };

      if (!payload.ok) {
        setError(payload.error ?? "Pipeline failed.");
        return;
      }

      setProduct(productName);
      setResult(payload.result ?? null);
    });
  };

  const timeline = useMemo(() => {
    if (!result?.timelineSummary) return [];
    return result.timelineSummary.split("\n");
  }, [result]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 bg-zinc-950 px-6 py-16 text-zinc-50">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">
          AdAgent — AI Ad Pipeline
        </h1>
        <p className="text-base text-zinc-300">
          Generate a Hinglish script, synthesize ElevenLabs voice, trigger AI
          video shots, and package everything into a ready-to-edit storyboard.
        </p>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-lg ring-1 ring-zinc-800/40">
        <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="product"
              className="text-sm font-medium uppercase tracking-widest text-zinc-400"
            >
              Product Name
            </label>
            <input
              id="product"
              name="product"
              type="text"
              defaultValue={product}
              maxLength={80}
              className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-base text-zinc-50 shadow-inner outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40"
              placeholder="Enter product e.g. Vivo T3 5G"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="h-12 shrink-0 rounded-xl bg-cyan-500 px-6 text-base font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-700/70 disabled:text-zinc-300"
          >
            {isPending ? "Running Pipeline…" : "Generate 3-Scene Spot"}
          </button>
        </form>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </section>

      {isPending ? (
        <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 text-sm text-zinc-300">
          <span className="animate-pulse text-base font-medium text-cyan-300">
            ✨ Crafting script, voice, and video briefs…
          </span>
          <p>
            Sit tight. We&apos;re talking to OpenAI, ElevenLabs, and Runway to
            assemble your custom ad kit.
          </p>
        </div>
      ) : null}

      {result ? (
        <section className="flex flex-col gap-10">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8">
            <h2 className="text-2xl font-semibold text-zinc-50">
              {result.product} — Playbook
            </h2>
            <div className="mt-3 space-y-1 text-sm text-zinc-300">
              {timeline.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            {result.errors ? (
              <div className="mt-4 space-y-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                <p className="font-medium uppercase tracking-widest">
                  Warnings
                </p>
                {result.errors.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {result.scenes.map((scene) => (
              <article
                key={scene.id}
                className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-xl"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      {scene.id}
                    </p>
                    <h3 className="text-xl font-semibold text-zinc-50">
                      {scene.textOverlay}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-zinc-300">
                    <SceneStatus label="Voice" asset={scene.audio} />
                    <SceneStatus label="Video" asset={scene.video} />
                  </div>
                </header>

                <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
                  <div>
                    <p className="font-semibold uppercase tracking-widest text-zinc-400">
                      Dialogue (Hinglish)
                    </p>
                    <p>{scene.dialogue}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-widest text-zinc-400">
                      Image Prompt
                    </p>
                    <p>{scene.imagePrompt}</p>
                  </div>
                </div>

                {scene.audio?.base64 ? (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
                      ElevenLabs Voice
                    </p>
                    <audio
                      controls
                      className="mt-2 w-full"
                      src={`data:${scene.audio.mimeType ?? "audio/mpeg"};base64,${scene.audio.base64}`}
                    />
                  </div>
                ) : scene.audio?.url ? (
                  <AssetLink asset={scene.audio} label="Download Voice" />
                ) : null}

                {scene.video?.url ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                      AI Shot
                    </p>
                    <video
                      className="mt-3 w-full rounded-xl"
                      src={scene.video.url}
                      controls
                      playsInline
                    />
                  </div>
                ) : scene.video?.base64 ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                      AI Shot (Base64)
                    </p>
                    <video
                      className="mt-3 w-full rounded-xl"
                      src={`data:${scene.video.mimeType ?? "video/mp4"};base64,${scene.video.base64}`}
                      controls
                      playsInline
                    />
                  </div>
                ) : scene.video?.status === "pending" ? (
                  <p className="rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-200">
                    {scene.video.message ??
                      "Video generation is queued. Use the job id in the meta payload to poll Runway/Stability."}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function SceneStatus({ asset, label }: SceneStatusProps) {
  const status = asset?.status ?? "pending";

  const styleMap: Record<string, string> = {
    complete:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 border",
    pending: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 border",
    skipped: "border-zinc-700 bg-zinc-800/60 text-zinc-300 border",
    error: "border-red-500/40 bg-red-500/15 text-red-100 border",
  };

  const textMap: Record<string, string> = {
    complete: "Ready",
    pending: "Queued",
    skipped: "Skipped",
    error: "Error",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${styleMap[status] ?? styleMap.pending}`}
    >
      {label}: {textMap[status] ?? status}
    </span>
  );
}

function AssetLink({
  asset,
  label,
}: {
  asset?: GeneratedAsset;
  label: string;
}) {
  if (!asset?.url) return null;

  return (
    <a
      href={asset.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-transparent px-5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
    >
      {label}
    </a>
  );
}
