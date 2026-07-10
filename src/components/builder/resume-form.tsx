"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

import { BulletsField } from "@/components/builder/bullets-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeContent } from "@/lib/schema/resume";

interface ResumeFormProps {
  form: UseFormReturn<ResumeContent>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-6">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function EntryCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="relative space-y-3 rounded-sm border border-border p-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
      {children}
    </div>
  );
}

export function ResumeForm({ form }: ResumeFormProps) {
  const { register, control, watch, setValue } = form;

  const experience = useFieldArray({ control, name: "experience" });
  const education = useFieldArray({ control, name: "education" });
  const projects = useFieldArray({ control, name: "projects" });
  const languages = useFieldArray({ control, name: "languages" });
  const certifications = useFieldArray({ control, name: "certifications" });
  const links = useFieldArray({ control, name: "links" });

  const skills = watch("skills");
  function updateSkill(index: number, value: string) {
    const next = [...skills];
    next[index] = value;
    setValue("skills", next);
  }
  function removeSkill(index: number) {
    setValue(
      "skills",
      skills.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Basic info">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Title / headline</Label>
            <Input {...register("title")} placeholder="Senior Software Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register("email")} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="Remote / San Francisco, CA" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Summary</Label>
          <Textarea {...register("summary")} className="min-h-24" />
        </div>
      </SectionCard>

      <SectionCard title="Experience">
        {experience.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => experience.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input {...register(`experience.${index}.position`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input {...register(`experience.${index}.company`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input {...register(`experience.${index}.location`)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={watch(`experience.${index}.current`)}
                  onCheckedChange={(checked) =>
                    setValue(`experience.${index}.current`, checked)
                  }
                />
                <Label>Current role</Label>
              </div>
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input {...register(`experience.${index}.startDate`)} placeholder="Jan 2021" />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input
                  {...register(`experience.${index}.endDate`)}
                  placeholder="Present"
                  disabled={watch(`experience.${index}.current`)}
                />
              </div>
            </div>
            <BulletsField control={control} name={`experience.${index}.bullets`} />
          </EntryCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            experience.append({
              company: "",
              position: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              bullets: [],
            })
          }
        >
          <Plus className="size-4" />
          Add experience
        </Button>
      </SectionCard>

      <SectionCard title="Education">
        {education.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => education.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Institution</Label>
                <Input {...register(`education.${index}.institution`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Degree</Label>
                <Input {...register(`education.${index}.degree`)} placeholder="B.Sc." />
              </div>
              <div className="space-y-1.5">
                <Label>Field of study</Label>
                <Input {...register(`education.${index}.field`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input {...register(`education.${index}.location`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input {...register(`education.${index}.startDate`)} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input {...register(`education.${index}.endDate`)} />
              </div>
              <div className="space-y-1.5">
                <Label>GPA</Label>
                <Input {...register(`education.${index}.gpa`)} placeholder="3.8/4.0" />
              </div>
            </div>
            <BulletsField control={control} name={`education.${index}.bullets`} />
          </EntryCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            education.append({
              institution: "",
              degree: "",
              field: "",
              location: "",
              startDate: "",
              endDate: "",
              gpa: "",
              bullets: [],
            })
          }
        >
          <Plus className="size-4" />
          Add education
        </Button>
      </SectionCard>

      <SectionCard title="Projects">
        {projects.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => projects.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input {...register(`projects.${index}.name`)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input {...register(`projects.${index}.url`)} placeholder="https://" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Input {...register(`projects.${index}.description`)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Technologies (comma-separated)</Label>
                <Input
                  defaultValue={watch(`projects.${index}.technologies`)?.join(", ")}
                  onBlur={(e) =>
                    setValue(
                      `projects.${index}.technologies`,
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="TypeScript, Next.js, Postgres"
                />
              </div>
            </div>
            <BulletsField control={control} name={`projects.${index}.bullets`} />
          </EntryCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            projects.append({ name: "", description: "", technologies: [], url: "", bullets: [] })
          }
        >
          <Plus className="size-4" />
          Add project
        </Button>
      </SectionCard>

      <SectionCard title="Skills">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1"
            >
              <input
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                className="w-24 bg-transparent text-sm outline-none"
              />
              <button type="button" onClick={() => removeSkill(index)} aria-label="Remove skill">
                <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setValue("skills", [...skills, ""])}
        >
          <Plus className="size-3.5" />
          Add skill
        </Button>
      </SectionCard>

      <SectionCard title="Languages">
        {languages.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => languages.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input {...register(`languages.${index}.name`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Proficiency</Label>
                <Input {...register(`languages.${index}.proficiency`)} placeholder="Native, Fluent…" />
              </div>
            </div>
          </EntryCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => languages.append({ name: "", proficiency: "" })}
        >
          <Plus className="size-4" />
          Add language
        </Button>
      </SectionCard>

      <SectionCard title="Certifications">
        {certifications.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => certifications.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input {...register(`certifications.${index}.name`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Issuer</Label>
                <Input {...register(`certifications.${index}.issuer`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input {...register(`certifications.${index}.date`)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input {...register(`certifications.${index}.url`)} />
              </div>
            </div>
          </EntryCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => certifications.append({ name: "", issuer: "", date: "", url: "" })}
        >
          <Plus className="size-4" />
          Add certification
        </Button>
      </SectionCard>

      <SectionCard title="Links">
        {links.fields.map((field, index) => (
          <EntryCard key={field.id} onRemove={() => links.remove(index)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input {...register(`links.${index}.label`)} placeholder="GitHub" />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input {...register(`links.${index}.url`)} placeholder="https://" />
              </div>
            </div>
          </EntryCard>
        ))}
        <Button type="button" variant="outline" onClick={() => links.append({ label: "", url: "" })}>
          <Plus className="size-4" />
          Add link
        </Button>
      </SectionCard>
    </div>
  );
}
