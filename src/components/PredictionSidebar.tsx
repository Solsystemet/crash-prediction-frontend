/**
 * Collapsible sidebar for crash severity prediction.
 */

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResult } from "@/components/PredictionResult";
import { predict, getFeatureOptions } from "@/api/prediction";
import type {
  PredictionRequest,
  PredictionResponse,
  FeatureOptions,
} from "@/types/prediction";

type PredictionSidebarProps = {
  children: React.ReactNode;
};

export function PredictionSidebar({ children }: PredictionSidebarProps) {
  const [featureOptions, setFeatureOptions] = useState<FeatureOptions | null>(
    null
  );
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feature options on mount
  useEffect(() => {
    getFeatureOptions()
      .then(setFeatureOptions)
      .catch((err) => {
        console.warn("Failed to load feature options:", err);
      });
  }, []);

  const handleSubmit = async (data: PredictionRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await predict(data);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Crash Severity Prediction</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter crash parameters to predict severity
          </p>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <PredictionForm
                featureOptions={featureOptions}
                onSubmit={handleSubmit}
                onReset={handleReset}
                isLoading={isLoading}
              />
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <PredictionResult
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Crash Prediction Map</span>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
