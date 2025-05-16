import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import { UIModeProvider } from "@/app/contexts/UIModeContext";
import App from "./App";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <EventProvider>
          <UIModeProvider>
            <App />
          </UIModeProvider>
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}
