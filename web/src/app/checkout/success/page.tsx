import { Suspense } from "react";
import SuccessPageContent from "./SuccessPageContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading order details...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
