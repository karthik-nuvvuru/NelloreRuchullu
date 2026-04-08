import { Suspense } from "react";
import MenuPageContent from "./MenuPageContent";
import { PageSkeleton } from "@/components/SkeletonLoader";

export default function MenuPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MenuPageContent />
    </Suspense>
  );
}
