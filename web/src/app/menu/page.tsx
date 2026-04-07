import { Suspense } from "react";
import MenuPageContent from "./MenuPageContent";

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
    }>
      <MenuPageContent />
    </Suspense>
  );
}
