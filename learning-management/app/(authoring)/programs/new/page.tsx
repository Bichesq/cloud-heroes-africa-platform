import { notFound } from "next/navigation";
import ProgramSetupForm from "@/components/program-setup/ProgramSetupForm";
import { canCreatePrograms } from "@/lib/program-access";
import { requireAuthor } from "@/lib/session";

/* Create Program — the Program Setup card in create mode. Directors only
 * (plan §7); everyone else gets a 404, and the server action checks again. */

export default async function NewProgramPage() {
  const author = await requireAuthor();
  if (!(await canCreatePrograms(author.id))) notFound();

  return (
    <div className="max-w-[1092px]">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Create Program</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Define the program details, content owner, and assigned instructors.
        </p>
      </header>
      <ProgramSetupForm
        program={{ id: null, title: "", description: "", creatorAuthorId: author.id, thumbnailUrl: null }}
        canEdit
        canChangeCreator={false}
        people={[]}
      />
    </div>
  );
}
