"use client";

import type { ReactNode } from "react";
import {
  Input,
  Modal,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { Clock, MapPin, Paperclip, Video } from "lucide-react";
import AppButton from "@/components/ui/AppButton";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const TYPE_CHIP =
  "rounded-full border-0 bg-cha-surface-2 px-4 py-1.5 text-[13px] font-semibold text-cha-muted data-[selected=true]:bg-cha-blue data-[selected=true]:text-white";

/**
 * "Create Event" dialog — HeroUI Modal (controlled). Mirrors the popup
 * in the design: title field, Event/Task/Appointment type chips, time
 * summary, Location switch, link/location/note fields, blue CTA.
 * Submission is mocked: "Create Event" simply closes the dialog.
 */
export default function CreateEventModal({ isOpen, onOpenChange }: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="rounded-3xl sm:max-w-[380px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-lg font-bold">
              Create Event
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <TextField name="title" aria-label="Event title">
              <Input
                placeholder="Event Title..."
                className="w-full rounded-2xl"
              />
            </TextField>

            <ToggleButtonGroup
              aria-label="Entry type"
              selectionMode="single"
              disallowEmptySelection
              isDetached
              defaultSelectedKeys={["event"]}
              className="gap-2"
            >
              <ToggleButton id="event" className={TYPE_CHIP}>
                Event
              </ToggleButton>
              <ToggleButton id="task" className={TYPE_CHIP}>
                Task
              </ToggleButton>
              <ToggleButton id="appointment" className={TYPE_CHIP}>
                Appointment
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Time summary (static in the mock) */}
            <div className="rounded-2xl bg-cha-surface-2 p-4">
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <Clock size={16} /> 8:15 - 9:15 AM
              </div>
              <div className="mt-1 pl-6 text-sm text-cha-muted">01/29/26</div>
              <div className="pl-6 text-sm text-cha-muted">
                Doesn&apos;t Repeat
              </div>
            </div>

            <Switch defaultSelected className="self-start">
              <Switch.Content className="flex-row-reverse gap-2.5 text-sm font-semibold">
                <Switch.Control className="data-[selected=true]:bg-cha-blue">
                  <Switch.Thumb />
                </Switch.Control>
                Location
              </Switch.Content>
            </Switch>

            <div className="flex flex-col gap-2.5">
              <IconField
                name="link"
                ariaLabel="Meeting link"
                icon={<Video size={14} />}
                defaultValue="https://us04web.zoom.us/j/71670423115?pwd=onUL"
              />
              <IconField
                name="location"
                ariaLabel="Location"
                icon={<MapPin size={14} />}
                placeholder="Add Location"
              />
              <IconField
                name="note"
                ariaLabel="Note"
                icon={<Paperclip size={14} />}
                placeholder="Add a note"
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="justify-end gap-2">
            <AppButton
              variant="accent"
              size="sm"
              onPress={() => onOpenChange(false)}
            >
              Create Event
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onPress={() => onOpenChange(false)}
              className="bg-cha-surface-2 text-cha-muted"
            >
              Cancel
            </AppButton>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

/** TextField + Input with a leading icon (custom composition). */
function IconField({
  name,
  ariaLabel,
  icon,
  placeholder,
  defaultValue,
}: {
  name: string;
  ariaLabel: string;
  icon: ReactNode;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <TextField
      name={name}
      aria-label={ariaLabel}
      defaultValue={defaultValue}
      className="w-full"
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cha-muted">
          {icon}
        </span>
        <Input
          placeholder={placeholder}
          className="w-full truncate rounded-full pl-9 text-xs"
        />
      </div>
    </TextField>
  );
}
