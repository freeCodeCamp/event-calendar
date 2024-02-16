import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";

import Layout from "@/components/layout";
import "./event-fields.css";
import "./fonts.css";
import "./variables.css";
import "./main.css";

const theme = createTheme({
  typography: {
    fontFamily: ["Lato", "sans-serif"].join(","),
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <CssBaseline />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}
