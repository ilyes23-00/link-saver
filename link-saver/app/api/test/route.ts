import { NextResponse } from "next/server";
import { getAllLinks } from "@/lib/linkRepository";

export async function GET() {
  return NextResponse.json(
    getAllLinks()
  );
}