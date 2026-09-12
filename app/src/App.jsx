import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Startseite from "@/pages/Startseite";
import Stellenanzeigen from "@/pages/Stellenanzeigen";
import StellenanzeigeDetail from "@/pages/StellenanzeigeDetail";
import Statistik from "@/pages/Statistik";
import Auftragsabwicklung from "@/pages/Auftragsabwicklung";
import Empfehlungen from "@/pages/Empfehlungen";
import Portalvergleich from "@/pages/Portalvergleich";
import CandidateJourney from "@/pages/CandidateJourney";
import BudgetKosten from "@/pages/BudgetKosten";
import Reports from "@/pages/Reports";
import HilfeDatenbasis from "@/pages/HilfeDatenbasis";
import Einstellungen from "@/pages/Einstellungen";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />} path="/">
        <Route index element={<Startseite />} />
        <Route element={<Stellenanzeigen />} path="stellenanzeigen" />
        <Route element={<StellenanzeigeDetail />} path="stellenanzeigen/:id" />
        <Route element={<Statistik />} path="statistik" />
        <Route element={<Auftragsabwicklung />} path="auftragsabwicklung" />
        <Route element={<Empfehlungen />} path="empfehlungen" />
        <Route element={<Portalvergleich />} path="portalvergleich" />
        <Route element={<CandidateJourney />} path="candidate-journey" />
        <Route element={<BudgetKosten />} path="budget-kosten" />
        <Route element={<Reports />} path="reports" />
        <Route element={<HilfeDatenbasis />} path="hilfe-datenbasis" />
        <Route element={<Einstellungen />} path="einstellungen" />
      </Route>
    </Routes>
  );
}
