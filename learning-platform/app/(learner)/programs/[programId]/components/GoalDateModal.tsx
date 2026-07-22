"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Loader2 } from "lucide-react";
import AppButton from "@/components/ui/AppButton";
import type { OverviewUnit } from "./ProgramOverview";

/* "Set deadline" dialog — unit completion goals feed the Goals Meeting
 * Streak (consecutive deadlines met, decision 2026-07-09). Mounted once at
 * the overview level; `unit` doubles as the open flag. */

export default function GoalDateModal({
  unit,
  onClose,
  onSaved,
}: {
  unit: OverviewUnit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal.Backdrop isOpen={unit !== null} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="rounded-3xl sm:max-w-[420px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-lg font-bold">
              Set a completion goal
            </Modal.Heading>
          </Modal.Header>
          {unit && <GoalForm unit={unit} onClose={onClose} onSaved={onSaved} />}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function GoalForm({
  unit,
  onClose,
  onSaved,
}: {
  unit: OverviewUnit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [targetDate, setTargetDate] = useState(unit.goalTargetDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!targetDate || saving) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId: unit.id, targetDate }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setError("Couldn't save your goal. Please try again.");
  }

  async function remove() {
    if (saving) return;
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId: unit.id }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setError("Couldn't remove your goal. Please try again.");
  }

  return (
    <>
      <Modal.Body className="flex flex-col gap-4">
        <p className="text-sm text-cha-muted">
          When do you plan to finish{" "}
          <span className="font-semibold text-cha-ink">
            Unit {unit.order}: {unit.title}
          </span>
          ? Meeting your deadlines grows your Goals Meeting Streak.
        </p>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-cha-ink">
          Target completion date
          <input
            type="date"
            value={targetDate}
            min={today}
            onChange={(e) => setTargetDate(e.target.value)}
            className="h-10 rounded-xl border border-cha-border bg-cha-surface px-3 text-sm font-medium text-cha-ink outline-none focus:border-cha-blue"
          />
        </label>

        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-500">
            {error}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-between gap-2">
        {unit.goalTargetDate ? (
          <AppButton
            variant="ghost"
            className="text-red-500"
            onPress={remove}
            isDisabled={saving}
          >
            Remove goal
          </AppButton>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <AppButton
            variant="ghost"
            className="bg-cha-surface-2 text-cha-muted"
            onPress={onClose}
            isDisabled={saving}
          >
            Cancel
          </AppButton>
          <AppButton onPress={save} isDisabled={saving || !targetDate}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : "Save goal"}
          </AppButton>
        </div>
      </Modal.Footer>
    </>
  );
}
