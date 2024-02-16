import { Button } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Button
          sx={{ color: "white", fontSize: "18px" }}
          onClick={() => signOut()}
        >
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      <Button
        sx={{
          color: "#0a0a23",
          fontSize: "18px",
          maxHeight: "30px",
          marginLeft: "1rem",
          border: "3px solid #feac32",
          borderRadius: "0",
          background: "#feac32",
          backgroundImage: "linear-gradient(#fecc4c,#ffac33)",
          textTransform: "none",
          padding: "0.5rem 1rem",
        }}
        className="login-btn"
        onClick={() => signIn()}
      >
        Sign in
      </Button>
    </>
  );
}
