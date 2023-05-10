import { Container } from "@mui/material";
import NavBar from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <NavBar />
      <Container>{children}</Container>
    </main>
  );
}
