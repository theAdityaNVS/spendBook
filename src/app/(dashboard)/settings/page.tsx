import { PersonList } from "@/components/settings/PersonList";
import { CategoryTagList } from "@/components/settings/CategoryTagList";
import { PaymentModeList } from "@/components/settings/PaymentModeList";
import { InviteMember } from "@/components/settings/InviteMember";
import { getPersons, getCategoryTags, getPaymentModes } from "@/server/queries/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [persons, tags, modes] = await Promise.all([
    getPersons(),
    getCategoryTags(),
    getPaymentModes(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-6">
      <div className="border-border/50 flex flex-col gap-2 border-b pb-6">
        <h1 className="text-foreground/90 text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your family members and preferences.</p>
      </div>

      <InviteMember />

      <PersonList persons={persons} />

      <CategoryTagList initialTags={tags} />

      <PaymentModeList initialModes={modes} persons={persons} />
    </div>
  );
}
