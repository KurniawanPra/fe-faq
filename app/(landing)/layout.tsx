import React, { Suspense } from "react";
import { Navbar, SearchHeader, Footer } from "@/components";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <SearchHeader />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
