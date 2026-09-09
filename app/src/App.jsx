import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Startseite from "@/pages/Startseite";
import Stellenanzeigen from "@/pages/Stellenanzeigen";
import StellenanzeigeDetail from "@/pages/StellenanzeigeDetail";
import Statistik from "@/pages/Statistik";
import Auftragsabwicklung from "@/pages/Auftragsabwicklung";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />} path="/">
        <Route index element={<Startseite />} />
        <Route element={<Stellenanzeigen />} path="stellenanzeigen" />
        <Route element={<StellenanzeigeDetail />} path="stellenanzeigen/:id" />
        <Route element={<Statistik />} path="statistik" />
        <Route element={<Auftragsabwicklung />} path="auftragsabwicklung" />
      </Route>
    </Routes>
  );
}
