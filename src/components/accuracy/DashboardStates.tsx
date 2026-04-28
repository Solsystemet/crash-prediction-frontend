/**
 * Loading, empty, and error state components for the dashboard.
 */

import { Card, CardContent } from "@/components/ui/card"

type EmptyStateProps = {
  isCompareMode: boolean
}

export function EmptyState({ isCompareMode }: EmptyStateProps) {
  return (
    <Card className="flex h-full items-center justify-center">
      <CardContent>
        <div className="text-center">
          <p className="text-muted-foreground">
            {isCompareMode
              ? 'Click "Compare Models" to evaluate all models on the same dataset.'
              : 'Click "Fetch Data" to load accuracy metrics from recent Chicago crash data.'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This will fetch real crash data from the City of Chicago's open data
            portal and compare model predictions against actual outcomes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingState() {
  return (
    <Card className="flex h-full items-center justify-center">
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            Fetching data from Chicago API...
          </p>
          <p className="text-sm text-muted-foreground">
            This may take a moment for larger time ranges.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

type ErrorStateProps = {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="mb-4 border-destructive">
      <CardContent className="py-3">
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  )
}
