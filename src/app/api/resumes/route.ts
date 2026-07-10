import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { emptyResumeContent, resumeTemplateSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, template: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ resumes });
  } catch (error) {
    return toErrorResponse(error);
  }
}

const createResumeSchema = z.object({
  title: z.string().trim().min(1).max(150).default("Untitled Resume"),
  template: resumeTemplateSchema.default("classic"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = createResumeSchema.parse(await request.json());

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: body.title,
        template: body.template,
        content: emptyResumeContent,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
