import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/order/:orderId" element={<OrderPage />} />
    </Routes>
  );
}
