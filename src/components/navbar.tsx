import { AppBar, Toolbar, Link as MUILink, Box } from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";

import LoginButton from "@/components/login-btn";
import Logo from "./logo";
import { forwardRef } from "react";

const NextLink = forwardRef<
  HTMLAnchorElement,
  { href: string; prefetch?: false }
>(function NextLink(props, ref) {
  return <Link passHref ref={ref} {...props} />;
});

export default function NavBar() {
  const session = useSession();
  return (
    <AppBar position="static" className="navigation-container">
      <Toolbar className="navigation-toolbar">
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            textDecoration: "none",
            width: "33%",
          }}
        ></Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            textDecoration: "none",
            width: "33%",
          }}
        >
          <MUILink
            href="/"
            prefetch={false}
            component={NextLink}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Logo />
          </MUILink>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
            width: "33%",
          }}
        >
          <MUILink
            href="/"
            prefetch={false}
            component={NextLink}
            variant="h6"
            className="nav-button"
          >
            Home
          </MUILink>
          <MUILink
            href="/add-event"
            component={NextLink}
            variant="h6"
            className="nav-button"
          >
            Add Event
          </MUILink>
          <LoginButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
