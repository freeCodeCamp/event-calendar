"use client";

import { CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CssBaseline />
      <SessionProvider>{children}</SessionProvider>
    </>
  );
}
