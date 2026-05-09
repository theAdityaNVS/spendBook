import { PersonList } from "@/components/settings/PersonList";
import { CategoryTagList } from "@/components/settings/CategoryTagList";
import { PaymentModeList } from "@/components/settings/PaymentModeList";
import { InviteMember } from "@/components/settings/InviteMember";
import { PWAInstallPrompt } from "@/components/settings/PWAInstallPrompt";
import { getPersons, getCategoryTags, getPaymentModes } from "@/server/queries/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [persons, tags, modes] = await Promise.all([
    getPersons(),
    getCategoryTags(),
    getPaymentModes(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your family members and preferences.</p>
      </header>

      <PWAInstallPrompt />

      <InviteMember />

      <PersonList persons={persons} />

      <CategoryTagList initialTags={tags} />

      <PaymentModeList initialModes={modes} persons={persons} />
    </div>
  );
}

