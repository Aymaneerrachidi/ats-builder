"use client";

import { Plus, X } from "lucide-react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BulletsFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

/**
 * Editable list of plain-text bullet points. `useFieldArray` is typed for
 * arrays of objects, not primitive string arrays like `bullets: string[]`,
 * so this reads/writes the array directly via `useController` instead.
 */
export function BulletsField<T extends FieldValues>({ control, name }: BulletsFieldProps<T>) {
  const { field } = useController({ control, name });
  const bullets = (field.value as string[] | undefined) ?? [];

  function update(next: string[]) {
    field.onChange(next as PathValue<T, Path<T>>);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Bullet points</p>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={bullet}
            onChange={(e) => {
              const next = [...bullets];
              next[index] = e.target.value;
              update(next);
            }}
            placeholder="Led a team of 5 to ship..."
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => update(bullets.filter((_, i) => i !== index))}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => update([...bullets, ""])}>
        <Plus className="size-3.5" />
        Add bullet
      </Button>
    </div>
  );
}
