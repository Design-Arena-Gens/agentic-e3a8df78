import { NextResponse } from "next/server";
import { runAdPipeline } from "@/lib/pipeline";
import type { PipelineResponse } from "@/lib/types";

const MAX_PRODUCT_NAME_LENGTH = 80;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const product = typeof body?.product === "string" ? body.product.trim() : "";

    if (!product) {
      return NextResponse.json<PipelineResponse>(
        { ok: false, error: "Product name is required." },
        { status: 400 },
      );
    }

    if (product.length > MAX_PRODUCT_NAME_LENGTH) {
      return NextResponse.json<PipelineResponse>(
        {
          ok: false,
          error: `Product name must be <= ${MAX_PRODUCT_NAME_LENGTH} characters.`,
        },
        { status: 422 },
      );
    }

    const result = await runAdPipeline(product);

    return NextResponse.json<PipelineResponse>({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Pipeline error", error);

    return NextResponse.json<PipelineResponse>(
      {
        ok: false,
        error:
          (error as Error)?.message ??
          "Unexpected error while running Ad Agent pipeline.",
      },
      { status: 500 },
    );
  }
}
