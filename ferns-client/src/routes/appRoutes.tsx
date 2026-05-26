import { Navigate, Route, Routes } from "react-router";
import Home from "../app/Home";
import FernDetail from "../app/FernDetail";
import Identify from "../app/Key";
import Habitats from "../app/Habitats";
import Status from "../app/Status";
import About from "../app/About";

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/ferns" element={<Home />} />
      <Route path="/ferns/:name" element={<FernDetail />} />
      <Route path="/identify" element={<Identify />} />
      <Route path="/key" element={<Identify />} />
      <Route path="/habitats" element={<Habitats />} />
      <Route path="/status" element={<Status />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
