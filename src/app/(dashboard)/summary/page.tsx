import { getMonthlySummary } from "@/server/queries/summary"
import { SummaryView } from "@/components/summary/SummaryView"

export const dynamic = "force-dynamic"

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  
  const now = new Date()
  const year = params.year ? parseInt(params.year as string) : now.getFullYear()
  const month = params.month ? parseInt(params.month as string) : now.getMonth() + 1

  const { summaries, familyAggregate, categoryBreakdown } = await getMonthlySummary(year, month)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <SummaryView
        year={year}
        month={month}
        summaries={summaries}
        familyAggregate={familyAggregate}
        categoryBreakdown={categoryBreakdown}
      />
    </div>
  )
}
