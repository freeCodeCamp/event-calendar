import { Button } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Button
          data-cy="sign-out-btn"
          sx={{ color: "white" }}
          onClick={() => signOut()}
        >
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      <Button sx={{ color: "white" }} onClick={() => signIn()}>
        Sign in
      </Button>
    </>
  );
}
