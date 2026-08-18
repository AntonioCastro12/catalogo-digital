import { StoreApp } from "../../StoreApp";

export function generateStaticParams() {
  return ["ropa", "calzado", "lotes", "ofertas"].map((slug) => ({ slug }));
}

export default function Categoria() {
  return <StoreApp />;
}
