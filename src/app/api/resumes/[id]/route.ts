import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { assertReasonableBodySize } from "@/lib/request-size";
import { getOwnedResume } from "@/lib/resume-access";
import { resumeContentSchema, resumeTemplateSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const resume = await getOwnedResume(id, session.user.id);
    return NextResponse.json({ resume });
  } catch (error) {
    return toErrorResponse(error);
  }
}

const updateResumeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  template: resumeTemplateSchema.optional(),
  content: resumeContentSchema.optional(),
  /** Locks compilation to a single page — see src/lib/latex/page-fit.ts. */
  onePage: z.boolean().optional(),
  /** When true, snapshots the resume's current state into ResumeVersion
   * before applying the update — used for "save checkpoint" style saves
   * from the builder rather than every keystroke. */
  saveVersion: z.boolean().optional(),
  versionLabel: z.string().trim().max(100).optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await getOwnedResume(id, session.user.id);
    assertReasonableBodySize(request);
    const body = updateResumeSchema.parse(await request.json());

    if (body.saveVersion) {
      await prisma.resumeVersion.create({
        data: {
          resumeId: existing.id,
          template: existing.template,
          content: existing.content as object,
          label: body.versionLabel,
        },
      });
    }

    const resume = await prisma.resume.update({
      where: { id: existing.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.template !== undefined ? { template: body.template } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.onePage !== undefined ? { onePage: body.onePage } : {}),
      },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await getOwnedResume(id, session.user.id);
    await prisma.resume.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
