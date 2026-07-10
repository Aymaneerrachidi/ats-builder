import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { getOwnedResume } from "@/lib/resume-access";
import { requireSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await getOwnedResume(id, session.user.id);

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `${existing.title} (Copy)`,
        template: existing.template,
        content: existing.content as object,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
