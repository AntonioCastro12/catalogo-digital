import { StoreApp } from "../../../StoreApp";

export function generateStaticParams() {
  return Array.from({ length: 25 }, (_, index) => ({ id: String(index + 1) }));
}

export default function EditarProducto() {
  return <StoreApp />;
}
