import { createFileRoute } from "@tanstack/react-router"
import { AccuracyDashboard } from "@/components/AccuracyDashboard"

export const Route = createFileRoute("/")({ component: IndexPage })

function IndexPage() {
  return <AccuracyDashboard />
}
