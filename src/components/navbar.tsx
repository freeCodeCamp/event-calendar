import {
  AppBar,
  Toolbar,
  Link as MUILink,
  Container,
  Box,
} from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";

import LoginButton from "@/components/login-btn";
import { forwardRef } from "react";

const NextLink = forwardRef<HTMLAnchorElement, { href: string }>(
  function NextLink(props, ref) {
    return <Link passHref ref={ref} {...props} />;
  }
);

export default function NavBar() {
  const session = useSession();
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <MUILink
              href="/"
              component={NextLink}
              variant="h6"
              sx={{ color: "white", paddingRight: "1rem" }}
            >
              Home
            </MUILink>
            <MUILink
              href="/add-event"
              component={NextLink}
              variant="h6"
              sx={{ color: "white" }}
            >
              Add Event
            </MUILink>
          </Box>
          <LoginButton />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
