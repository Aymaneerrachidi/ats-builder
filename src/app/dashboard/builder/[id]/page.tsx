import { notFound } from "next/navigation";

import { BuilderClient } from "@/components/builder/builder-client";
import { getOwnedResume, ResumeNotFoundError } from "@/lib/resume-access";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BuilderPage({ params }: PageProps) {
  const session = await requireSession();
  const { id } = await params;

  try {
    const resume = await getOwnedResume(id, session.user.id);
    const content = resumeContentSchema.parse(resume.content);

    return (
      <BuilderClient
        resumeId={resume.id}
        initialTitle={resume.title}
        initialTemplate={resume.template}
        initialContent={content}
        initialOnePage={resume.onePage}
      />
    );
  } catch (error) {
    if (error instanceof ResumeNotFoundError) {
      notFound();
    }
    throw error;
  }
}
