import { NextResponse } from "next/server";
import { fetchMetadata } from "@/lib/metadata";

export async function GET() {
  try {
    const data =
      await fetchMetadata(
        "https://google.com"
      );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}