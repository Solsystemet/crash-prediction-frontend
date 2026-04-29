import { createFileRoute } from "@tanstack/react-router"
import { AccuracyDashboard } from "@/components/AccuracyDashboard"

export const Route = createFileRoute("/")({ component: AccuracyPage })

function AccuracyPage() {
  return <AccuracyDashboard />
}
