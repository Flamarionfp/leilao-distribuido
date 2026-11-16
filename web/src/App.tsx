import Leiloes from "./pages/Leiloes";
import Painel from "./pages/Painel";

export default function App() {
  const isPainel = window.location.pathname.startsWith("/painel");

  return isPainel ? <Painel /> : <Leiloes />;
}
