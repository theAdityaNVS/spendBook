import { PersonList } from "@/components/settings/PersonList"
import { CategoryTagList } from "@/components/settings/CategoryTagList"
import { PaymentModeList } from "@/components/settings/PaymentModeList"
import { InviteMember } from "@/components/settings/InviteMember"
import { getPersons, getCategoryTags, getPaymentModes } from "@/server/queries/settings"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [persons, tags, modes] = await Promise.all([
    getPersons(),
    getCategoryTags(),
    getPaymentModes()
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your family members and preferences.
        </p>
      </div>

      <InviteMember />

      <PersonList persons={persons} />
      
      <CategoryTagList initialTags={tags} />
      
      <PaymentModeList initialModes={modes} persons={persons} />
    </div>
  )
}
