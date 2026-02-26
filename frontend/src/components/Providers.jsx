"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";

/**
 * Inner wrapper that reads the session AFTER SessionProvider mounts,
 * so CartProvider can receive the authenticated userId.
 */
function CartWrapper({ children }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  return <CartProvider userId={userId}>{children}</CartProvider>;
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartWrapper>{children}</CartWrapper>
    </SessionProvider>
  );
}

