"use client";

import type { Key } from "react";
import { Description, FieldError, Label, ListBox, Select } from "@heroui/react";
import type { PersonOption } from "@/components/people/types";

/* People are chosen by name from known Microsoft accounts (decision-log
 * 2026-09-17: "assigned by name via dropdown… not free-text email"), i.e.
 * existing LpAuthor rows. The submitted value is the author id; the server
 * re-checks it exists. */

export default function PersonSelect({
  label,
  people,
  value,
  onChange,
  name,
  defaultValue,
  description,
  errorMessage,
  isDisabled,
  className,
  placeholder = "Choose a person",
}: {
  label: string;
  people: PersonOption[];
  value?: string | null;
  onChange?: (id: string | null) => void;
  name?: string;
  defaultValue?: string | null;
  description?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const controlled = onChange !== undefined;
  return (
    <Select
      name={name}
      className={className}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isInvalid={Boolean(errorMessage)}
      {...(controlled
        ? { value: value ?? null, onChange: (k: Key | Key[] | null) => onChange(typeof k === "string" ? k : null) }
        : { defaultValue: defaultValue ?? null })}
    >
      <Label className="text-sm font-semibold text-cha-ink">{label}</Label>
      <Select.Trigger className="rounded-md">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {description && <Description className="text-xs text-cha-muted">{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Select.Popover>
        <ListBox>
          {people.map((p) => (
            <ListBox.Item key={p.id} id={p.id} textValue={p.label}>
              <div className="min-w-0">
                <p className="truncate text-sm">{p.label}</p>
                {p.label !== p.email && <p className="truncate text-xs text-cha-muted">{p.email}</p>}
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
