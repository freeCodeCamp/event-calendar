import { Container, createTheme } from "@mui/material";
import NavBar from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="light-palette main-layout">
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {children}
      </Container>
    </main>
  );
}
