import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { ResumeNotFoundError, getOwnedResume } from "@/lib/resume-access";
import { requireSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string; versionId: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id, versionId } = await params;
    const resume = await getOwnedResume(id, session.user.id);

    const version = await prisma.resumeVersion.findUnique({ where: { id: versionId } });
    if (!version || version.resumeId !== resume.id) {
      throw new ResumeNotFoundError();
    }

    // Snapshot the current state before overwriting it, so restoring is itself reversible.
    await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        template: resume.template,
        content: resume.content as object,
        label: "Before restore",
      },
    });

    const updated = await prisma.resume.update({
      where: { id: resume.id },
      data: { template: version.template, content: version.content as object },
    });

    return NextResponse.json({ resume: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
