import { StoreApp } from "../../StoreApp";

export function generateStaticParams() {
  return ["dashboard", "ventas", "productos", "ropa", "calzado", "lotes", "ofertas", "agregar", "configuracion"]
    .map((section) => ({ section }));
}

export default function AdminSection() {
  return <StoreApp />;
}
