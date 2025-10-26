import { Route, Routes } from "react-router";
import Home from "../app/Home";
import FernList from "../app/FernList";
import Hello from "../app/Hello";

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/hello" element={<Hello />} />
      <Route path="/ferns" element={<FernList />} />
    </Routes>
  );
}
