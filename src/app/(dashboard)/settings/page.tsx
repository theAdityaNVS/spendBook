import { PersonList } from "@/components/settings/PersonList"
import { getPersons } from "@/server/queries/settings"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const persons = await getPersons()

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your family members and preferences.
        </p>
      </div>

      <PersonList persons={persons} />
    </div>
  )
}
