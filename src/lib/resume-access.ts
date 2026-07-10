import { prisma } from "@/lib/prisma";

export class ResumeNotFoundError extends Error {
  constructor() {
    super("Resume not found.");
    this.name = "ResumeNotFoundError";
  }
}

/** Fetches a resume and verifies it belongs to `userId`. Returns the same
 * "not found" error whether the resume doesn't exist or belongs to someone
 * else, so ownership can never be probed from the outside. */
export async function getOwnedResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new ResumeNotFoundError();
  }
  return resume;
}
