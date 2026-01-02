import { Route, Routes } from "react-router";
import FernList from "../app/FernList";
import FernDetail from "../app/FernDetail";
import Home from "../app/Home";
import Habitats from "../app/Habitats";
import Status from "../app/Status";
import Demo from "../app/Demo";
import Key from "../app/Key";

export function AppRoutes() {
  return (
    <Routes>
      {/* <Route index element={<FernList />} /> */}
      <Route index element={<Home />} />
      <Route path="/ferns/:name" element={<FernDetail />} />
      <Route path="/ferns" element={<FernList />} />
      <Route path="/habitats" element={<Habitats />} />
      <Route path="/status" element={<Status />} />
      <Route path="/key" element={<Key />} />
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
}
