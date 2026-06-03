import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchMetadata } from "@/lib/metadata";
import {
  processLink,
  submitLink,
} from "@/lib/linkSubmission";
import { trackEvent } from "@/lib/tracking";
import {
  createLink,
  getAllLinks,
  getLinkByUrl,
  updateLink,
} from "@/lib/linkRepository";

const bodySchema = z.object({
  url: z
    .string()
    .trim()
    .url("A valid URL is required"),
});

export async function GET() {
  return NextResponse.json(getAllLinks());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result =
    bodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.error.issues[0]
            ?.message ??
          "A valid URL is required",
      },
      {
        status: 400,
      }
    );
  }

  const { url } = result.data;

  const submission = submitLink(url, {
    createLink,
    fetchMetadata,
    getLinkByUrl,
    trackEvent,
    updateLink,
  });

  if (!submission.isDuplicate) {
    after(async () => {
      await processLink(
        submission.link,
        {
          createLink,
          fetchMetadata,
          getLinkByUrl,
          trackEvent,
          updateLink,
        }
      );
    });
  }

  return NextResponse.json(
    submission.link,
    {
      status:
        submission.isDuplicate
          ? 200
          : 202,
    }
  );
}
