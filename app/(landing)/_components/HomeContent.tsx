"use client";

import { useSearchParams } from "next/navigation";
import { FAQCards, ContactForm } from "@/components";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery  = searchParams.get("q") || "";

  return (
    <>
      <FAQCards searchQuery={searchQuery} />
      <ContactForm />
    </>
  );
}
