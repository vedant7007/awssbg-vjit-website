import { LoadingState } from "@/components/feedback/LoadingState";

/** Default route-transition fallback while a segment streams in. */
export default function Loading() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <LoadingState label="Loading" />
    </div>
  );
}
