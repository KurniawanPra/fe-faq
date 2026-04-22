import { Suspense } from "react";
import HomeContent from "./_components/HomeContent";

/**
 * Server component wrapper.
 * HomeContent dipisahkan ke _components/ agar useSearchParams
 * bisa di-wrap Suspense di sini (Next.js requirement).
 */
export default function HomePage() {
  return (
    <main>
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
