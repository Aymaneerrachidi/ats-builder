import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { getOwnedResume } from "@/lib/resume-access";
import { requireSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const resume = await getOwnedResume(id, session.user.id);

    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId: resume.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, template: true, label: true, createdAt: true },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    return toErrorResponse(error);
  }
}
