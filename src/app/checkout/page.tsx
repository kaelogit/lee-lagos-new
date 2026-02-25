"use client";

import dynamic from "next/dynamic";

// Tell Next.js to NEVER run this component on the server
const CheckoutClient = dynamic(() => import("./CheckoutClient"), {
  ssr: false,
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}