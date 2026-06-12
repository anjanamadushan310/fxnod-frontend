import { Suspense } from "react";
import { CallbackInner } from "./CallbackInner";

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" />
    </div>
  );
}

export default function DerivCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackInner />
    </Suspense>
  );
}
