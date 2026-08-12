"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteCloudProduct,
  getCloudSession,
  isSupabaseConfigured,
  loadCloudProducts,
  saveCloudProduct,
  signInCloudAdmin,
  signOutCloudAdmin,
  updateCloudProductFlags,
} from "../services/supabase";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Edit3,
  Eye,
  Grid2X2,
  Heart,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Package,
  Percent,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export const WHATSAPP_NUMBER = "5210000000000";

export type Product = {
  id: number;
  code: string;
  name: string;
  description: string;
  category: "Ropa" | "Calzado" | "Lotes";
  subcategory: string;
  price: number;
  previousPrice?: number;
  isOffer: boolean;
  available: boolean;
  sizes: string[];
  colors: string[];
  images: string[];
  pieces?: number;
  lotContents?: string[];
};

type CartItem = {
  key: string;
  productId: number;
  name: string;
  code: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
};

const img = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=86`;

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    code: "R-025",
    name: "Vestido Lino Rosé",
    description:
      "Vestido midi de caída suave con tirantes ajustables y una silueta que acompaña el movimiento. Un básico femenino para días especiales o tardes tranquilas.",
    category: "Ropa",
    subcategory: "Vestidos",
    price: 450,
    previousPrice: 650,
    isOffer: true,
    available: true,
    sizes: ["CH", "M", "G", "EG"],
    colors: ["Rosa", "Beige", "Negro"],
    images: [
      img("photo-1585487000160-6ebcfceb0d03"),
      img("photo-1595777457583-95e059d581b8"),
      img("photo-1566174053879-31528523f8ae"),
    ],
  },
  {
    id: 2,
    code: "R-031",
    name: "Blusa Serena",
    description:
      "Blusa ligera con manga amplia y textura sutil. Diseñada para combinar con denim, sastrería o faldas fluidas.",
    category: "Ropa",
    subcategory: "Blusas",
    price: 380,
    isOffer: false,
    available: true,
    sizes: ["CH", "M", "G"],
    colors: ["Marfil", "Rosa", "Café"],
    images: [
      img("photo-1605763240000-7e93b172d754"),
      img("photo-1551163943-3f6a855d1153"),
    ],
  },
  {
    id: 3,
    code: "R-042",
    name: "Conjunto Arena",
    description:
      "Conjunto de dos piezas en tono neutro, cómodo y pulido. Perfecto para resolver un look completo en segundos.",
    category: "Ropa",
    subcategory: "Conjuntos",
    price: 720,
    isOffer: false,
    available: true,
    sizes: ["CH", "M", "G"],
    colors: ["Arena", "Olivo"],
    images: [
      img("photo-1594633312681-425c7b97ccd1"),
      img("photo-1551028719-00167b16eac5"),
    ],
  },
  {
    id: 4,
    code: "C-018",
    name: "Tenis Aura",
    description:
      "Tenis urbanos de líneas limpias con suela ligera. Comodidad para acompañarte todo el día sin perder estilo.",
    category: "Calzado",
    subcategory: "Tenis",
    price: 750,
    isOffer: false,
    available: true,
    sizes: ["24", "25", "26", "27", "28"],
    colors: ["Blanco", "Rosa"],
    images: [
      img("photo-1549298916-b41d501d3772"),
      img("photo-1595950653106-6c9ebd614d3a"),
    ],
  },
  {
    id: 5,
    code: "C-023",
    name: "Sandalia Emilia",
    description:
      "Sandalia de tacón medio con tiras delicadas. Un diseño versátil para celebraciones, cenas y eventos.",
    category: "Calzado",
    subcategory: "Sandalias",
    price: 590,
    previousPrice: 780,
    isOffer: true,
    available: true,
    sizes: ["23", "24", "25", "26", "27"],
    colors: ["Nude", "Negro"],
    images: [
      img("photo-1603487742131-4160ec999306"),
      img("photo-1543163521-1bf539c55dd2"),
    ],
  },
  {
    id: 6,
    code: "C-029",
    name: "Botín Olivia",
    description:
      "Botín de acabado mate y tacón estable. Una pieza atemporal que eleva vestidos, jeans y pantalones sastre.",
    category: "Calzado",
    subcategory: "Botines",
    price: 890,
    isOffer: false,
    available: false,
    sizes: ["24", "25", "26", "27"],
    colors: ["Camel", "Negro"],
    images: [
      img("photo-1608256246200-53e635b5b65f"),
      img("photo-1542840410-3092f99611a3"),
    ],
  },
  {
    id: 7,
    code: "L-015",
    name: "Lote Boutique Rosé",
    description:
      "Selección curada para iniciar o renovar tu inventario con prendas combinables en tonos suaves y cortes actuales.",
    category: "Lotes",
    subcategory: "Mixto",
    price: 2500,
    previousPrice: 2900,
    isOffer: true,
    available: true,
    sizes: [],
    colors: [],
    pieces: 25,
    lotContents: ["8 blusas", "5 vestidos", "7 pantalones", "5 conjuntos"],
    images: [
      img("photo-1668011372564-fc933d6c84d8", 1400),
      img("photo-1558769132-cb1aea458c5e", 1400),
    ],
  },
  {
    id: 8,
    code: "L-021",
    name: "Lote Esencial Neutro",
    description:
      "Lote versátil en una paleta neutra, pensado para ofrecer piezas fáciles de vender y de combinar durante todo el año.",
    category: "Lotes",
    subcategory: "Ropa",
    price: 3200,
    isOffer: false,
    available: true,
    sizes: [],
    colors: [],
    pieces: 30,
    lotContents: ["10 blusas", "8 pantalones", "6 vestidos", "6 faldas"],
    images: [
      img("photo-1558769132-cb1aea458c5e", 1400),
      img("photo-1687380268003-64710b6a878b", 1400),
    ],
  },
  {
    id: 9,
    code: "R-056",
    name: "Falda Magnolia",
    description:
      "Falda midi con volumen sutil, pretina definida y textura ligera para lograr un look femenino sin esfuerzo.",
    category: "Ropa",
    subcategory: "Faldas",
    price: 420,
    previousPrice: 520,
    isOffer: true,
    available: true,
    sizes: ["CH", "M", "G"],
    colors: ["Marfil", "Rosa viejo"],
    images: [
      img("photo-1583496661160-fb5886a13d27"),
      img("photo-1577900232427-18219b9166a0"),
    ],
  },
];

const categories = [
  {
    name: "Ropa",
    slug: "ropa",
    eyebrow: "Siluetas que inspiran",
    image: img("photo-1585487000160-6ebcfceb0d03", 1200),
  },
  {
    name: "Calzado",
    slug: "calzado",
    eyebrow: "Pasos con intención",
    image: img("photo-1543163521-1bf539c55dd2", 1200),
  },
  {
    name: "Lotes",
    slug: "lotes",
    eyebrow: "Más piezas, mejor valor",
    image: img("photo-1668011372564-fc933d6c84d8", 1200),
  },
  {
    name: "Ofertas",
    slug: "ofertas",
    eyebrow: "Favoritos a precio especial",
    image: img("photo-1607083206968-13611e3d76db", 1200),
  },
];

const peso = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function AppLink({
  href,
  children,
  className,
  ariaLabel,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        router.push(href);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {children}
    </a>
  );
}

function Header({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/catalogo?q=${encodeURIComponent(value)}` : "/catalogo");
    setSearchOpen(false);
  };

  const links = [
    ["Inicio", "/"],
    ["Novedades", "/catalogo"],
    ["Ropa", "/categoria/ropa"],
    ["Calzado", "/categoria/calzado"],
    ["Lotes", "/categoria/lotes"],
    ["Ofertas", "/categoria/ofertas"],
  ];

  return (
    <>
      <div className="announcement">
        <span>Envíos a todo México</span>
        <span className="announcement-dot" />
        <span>Atención personal por WhatsApp</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Abrir menú"
          >
            <Menu size={21} />
          </button>
          <AppLink href="/" className="brand" ariaLabel="Fernanda Lara, inicio">
            <span className="brand-name">Fernanda Lara</span>
            <span className="brand-subtitle">Moda · Calzado · Lotes</span>
          </AppLink>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {links.map(([label, href]) => (
              <AppLink
                href={href}
                key={label}
                className={
                  pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                {label}
              </AppLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Buscar"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search size={20} />
            </button>
            <AppLink href="/carrito" className="cart-link" ariaLabel={`Carrito con ${cartCount} productos`}>
              <ShoppingBag size={21} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </AppLink>
          </div>
        </div>
        {searchOpen && (
          <form className="header-search" onSubmit={submitSearch}>
            <Search size={20} aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar productos"
            />
            <button type="submit">Buscar</button>
          </form>
        )}
      </header>
      {mobileMenu && (
        <div className="drawer-backdrop" role="presentation" onClick={() => setMobileMenu(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()} aria-label="Menú móvil">
            <div className="drawer-top">
              <span className="brand-name">Fernanda Lara</span>
              <button className="icon-button" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú">
                <X size={22} />
              </button>
            </div>
            <p className="drawer-kicker">Tu estilo, a tu manera.</p>
            <nav>
              {links.map(([label, href], index) => (
                <AppLink
                  href={href}
                  key={label}
                  onClick={() => setMobileMenu(false)}
                  className="drawer-link"
                >
                  <span>0{index + 1}</span>
                  {label}
                  <ArrowRight size={17} />
                </AppLink>
              ))}
            </nav>
            <div className="drawer-note">
              <Sparkles size={18} />
              <span>Nuevos estilos cada semana</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function MobileNav({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();
  const links = [
    { label: "Inicio", href: "/", icon: Store },
    { label: "Categorías", href: "/catalogo", icon: Grid2X2 },
    { label: "Buscar", href: "/catalogo?focus=search", icon: Search },
    { label: "Carrito", href: "/carrito", icon: ShoppingBag },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
      {links.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href.split("?")[0]));
        return (
          <AppLink key={label} href={href} className={active ? "mobile-nav-link active" : "mobile-nav-link"}>
            <span className="mobile-nav-icon">
              <Icon size={20} />
              {label === "Carrito" && cartCount > 0 && <span className="mini-badge">{cartCount}</span>}
            </span>
            <span>{label}</span>
          </AppLink>
        );
      })}
    </nav>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <article className="product-card">
      <AppLink href={`/producto/${product.id}`} className="product-image-wrap">
        <img src={product.images[0]} alt={product.name} className="product-image" />
        {product.isOffer && <span className="offer-badge">Oferta</span>}
        {!product.available && <span className="soldout-badge">Agotado</span>}
        <span className="product-view-hint">Ver detalle</span>
      </AppLink>
      <div className="product-card-info">
        <div className="product-meta-row">
          <span>{product.subcategory}</span>
          <span>{product.code}</span>
        </div>
        <AppLink href={`/producto/${product.id}`} className="product-name-link">
          <h3>{product.name}</h3>
        </AppLink>
        <div className="price-row">
          <strong>{peso(product.price)}</strong>
          {product.previousPrice && <del>{peso(product.previousPrice)}</del>}
        </div>
        <div className="product-actions">
          <AppLink href={`/producto/${product.id}`} className="button secondary compact">
            Ver producto
          </AppLink>
          <button
            className="button icon-add compact"
            onClick={() => onAdd(product)}
            disabled={!product.available}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {link && (
        <AppLink href={link} className="text-link">
          Ver todo <ArrowRight size={17} />
        </AppLink>
      )}
    </div>
  );
}

function HomeView({ products, onAdd }: { products: Product[]; onAdd: (product: Product) => void }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Colección · Agosto 2026</span>
          <h1>Detalles que hacen especial tu estilo.</h1>
          <p>
            Prendas, calzado y lotes elegidos con intención para acompañar tu forma única de verte y sentirte.
          </p>
          <div className="hero-actions">
            <AppLink href="/catalogo" className="button primary">
              Ver catálogo <ArrowRight size={18} />
            </AppLink>
            <AppLink href="/categoria/ofertas" className="soft-link">
              Descubrir ofertas
            </AppLink>
          </div>
          <div className="hero-proof">
            <span><Check size={15} /> Atención personal</span>
            <span><Check size={15} /> Compra por WhatsApp</span>
          </div>
        </div>
        <div className="hero-visual">
          <img src={img("photo-1496747611176-843222e1e57c", 1600)} alt="Mujer con un look elegante de la colección Fernanda Lara" />
          <div className="hero-caption">
            <span>Nuevo</span>
            <strong>Esenciales de temporada</strong>
            <AppLink href="/catalogo">Explorar <ArrowRight size={15} /></AppLink>
          </div>
          <div className="hero-monogram">FL</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Beneficios de compra">
        <div><ShoppingBag size={19} /><span><strong>Elige con calma</strong>Arma tu carrito sin pagar en línea</span></div>
        <div><Heart size={19} /><span><strong>Selección especial</strong>Piezas elegidas por Fernanda</span></div>
        <div><Clock3 size={19} /><span><strong>Respuesta cercana</strong>Confirma disponibilidad por WhatsApp</span></div>
      </section>

      <section className="section container category-section" id="categorias">
        <SectionHeading eyebrow="Encuentra lo tuyo" title="Compra por categoría" />
        <div className="category-grid">
          {categories.map((category, index) => (
            <AppLink href={`/categoria/${category.slug}`} className={`category-card category-${index + 1}`} key={category.slug}>
              <img src={category.image} alt="" />
              <div className="category-overlay">
                <span>{category.eyebrow}</span>
                <h3>{category.name}</h3>
                <span className="category-cta">Ver selección <ArrowRight size={15} /></span>
              </div>
            </AppLink>
          ))}
        </div>
      </section>

      <section className="section product-section">
        <div className="container">
          <SectionHeading eyebrow="Lo más buscado" title="Favoritos de la semana" link="/catalogo" />
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="story-split container">
        <div className="story-image">
          <img src={img("photo-1558769132-cb1aea458c5e", 1400)} alt="Selección de prendas en tonos neutros" />
          <span className="story-stamp">Elegido con cariño</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">La selección de Fernanda</span>
          <h2>Moda bonita, cercana y fácil de elegir.</h2>
          <p>
            Cada pieza del catálogo está pensada para sentirse especial sin dejar de ser práctica. Explora, guarda tus favoritas y envía tu pedido completo en un solo mensaje.
          </p>
          <AppLink href="/catalogo" className="text-link">Conocer la colección <ArrowRight size={17} /></AppLink>
        </div>
      </section>

      <section className="offer-banner container">
        <div>
          <span className="eyebrow light">Precios especiales</span>
          <h2>Un gusto que sí te puedes dar.</h2>
          <p>Descubre piezas seleccionadas con descuentos por tiempo limitado.</p>
        </div>
        <AppLink href="/categoria/ofertas" className="button cream">Ver ofertas <ArrowRight size={18} /></AppLink>
      </section>

      <section className="section container">
        <SectionHeading eyebrow="Oportunidades únicas" title="Ofertas que enamoran" link="/categoria/ofertas" />
        <div className="product-grid">
          {products.filter((product) => product.isOffer).slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CatalogView({
  products,
  onAdd,
  forcedCategory,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  forcedCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(forcedCategory || "Todos");
  const [sort, setSort] = useState("Destacados");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    setQuery(initialQuery);
    if (params.get("focus") === "search") {
      setTimeout(() => document.getElementById("catalog-search")?.focus(), 200);
    }
  }, []);

  const activeCategory = forcedCategory || category;
  const filtered = useMemo(() => {
    const normalized = slugify(query);
    const result = products.filter((product) => {
      const matchesSearch =
        !normalized ||
        slugify(`${product.name} ${product.code} ${product.category} ${product.description}`).includes(normalized);
      const matchesCategory =
        activeCategory === "Todos" ||
        (activeCategory === "Ofertas" ? product.isOffer : product.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
    return [...result].sort((a, b) => {
      if (sort === "Precio menor") return a.price - b.price;
      if (sort === "Precio mayor") return b.price - a.price;
      if (sort === "Nombre") return a.name.localeCompare(b.name);
      return Number(b.isOffer) - Number(a.isOffer);
    });
  }, [products, query, activeCategory, sort]);

  const title = forcedCategory || "Todo el catálogo";
  const subtitle = forcedCategory === "Ofertas"
    ? "Piezas especiales, precios que vale la pena aprovechar."
    : forcedCategory === "Lotes"
      ? "Selecciones listas para impulsar tu negocio o renovar tu guardarropa."
      : forcedCategory
        ? `Descubre nuestra selección de ${forcedCategory.toLowerCase()}, elegida para ti.`
        : "Encuentra ese detalle que transforma tu look.";

  return (
    <main className="catalog-page">
      <section className="catalog-intro container">
        <div>
          <span className="breadcrumbs"><AppLink href="/">Inicio</AppLink><ChevronRight size={14} />{title}</span>
          <span className="eyebrow">Selección Fernanda Lara</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <span className="catalog-count">{filtered.length} productos</span>
      </section>

      <section className="catalog-tools container">
        <label className="catalog-search">
          <Search size={20} />
          <input
            id="catalog-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="¿Qué estás buscando?"
          />
          {query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={18} /></button>}
        </label>
        {!forcedCategory && (
          <div className="category-tabs" aria-label="Filtrar por categoría">
            {["Todos", "Ropa", "Calzado", "Lotes", "Ofertas"].map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="sort-wrap">
          <button className="filter-mobile" onClick={() => setFilterOpen((value) => !value)}>
            <SlidersHorizontal size={18} /> Filtros
          </button>
          <label>
            <span>Ordenar:</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option>Destacados</option>
              <option>Precio menor</option>
              <option>Precio mayor</option>
              <option>Nombre</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        {filterOpen && !forcedCategory && (
          <div className="mobile-filter-panel">
            {["Todos", "Ropa", "Calzado", "Lotes", "Ofertas"].map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => { setCategory(item); setFilterOpen(false); }}>
                {item}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="container catalog-results">
        {filtered.length ? (
          <div className="product-grid catalog-grid">
            {filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={34} />
            <h2>No encontramos coincidencias</h2>
            <p>Prueba con otro nombre, código o categoría.</p>
            <button className="button secondary" onClick={() => setQuery("")}>Limpiar búsqueda</button>
          </div>
        )}
      </section>
    </main>
  );
}

function QuantitySelector({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
  return (
    <div className={compact ? "quantity compact" : "quantity"}>
      <button onClick={() => onChange(Math.max(1, value - 1))} aria-label="Disminuir cantidad"><Minus size={15} /></button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Aumentar cantidad"><Plus size={15} /></button>
    </div>
  );
}

function ProductDetailView({ product, onAdd }: { product?: Product; onAdd: (product: Product, options?: { size?: string; color?: string; quantity?: number }) => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product?.sizes[0] || "");
  const [color, setColor] = useState(product?.colors[0] || "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setImageIndex(0);
    setSize(product?.sizes[0] || "");
    setColor(product?.colors[0] || "");
    setQuantity(1);
  }, [product]);

  if (!product) {
    return <main className="not-found"><h1>Producto no encontrado</h1><AppLink href="/catalogo" className="button primary">Volver al catálogo</AppLink></main>;
  }

  return (
    <main className="product-detail-page container">
      <div className="detail-breadcrumbs">
        <AppLink href="/">Inicio</AppLink><ChevronRight size={14} />
        <AppLink href={`/categoria/${slugify(product.category)}`}>{product.category}</AppLink><ChevronRight size={14} />
        <span>{product.name}</span>
      </div>
      <section className="product-detail-grid">
        <div className="gallery">
          <div className="main-product-image">
            <img src={product.images[imageIndex]} alt={`${product.name}, vista ${imageIndex + 1}`} />
            {product.isOffer && <span className="offer-badge detail">Oferta</span>}
            {product.images.length > 1 && (
              <div className="gallery-arrows">
                <button aria-label="Imagen anterior" onClick={() => setImageIndex((imageIndex - 1 + product.images.length) % product.images.length)}><ChevronLeft /></button>
                <button aria-label="Imagen siguiente" onClick={() => setImageIndex((imageIndex + 1) % product.images.length)}><ChevronRight /></button>
              </div>
            )}
          </div>
          <div className="gallery-thumbs">
            {product.images.map((image, index) => (
              <button key={image} className={imageIndex === index ? "active" : ""} onClick={() => setImageIndex(index)}>
                <img src={image} alt={`Miniatura ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-copy">
          <div className="detail-category-row">
            <span>{product.category} · {product.subcategory}</span>
            <span className={product.available ? "availability available" : "availability unavailable"}>
              <span /> {product.available ? "Disponible" : "Agotado"}
            </span>
          </div>
          <h1>{product.name}</h1>
          <p className="detail-code">Código: {product.code}</p>
          <div className="detail-price">
            <strong>{peso(product.price)}</strong>
            {product.previousPrice && <del>{peso(product.previousPrice)}</del>}
            {product.previousPrice && <span>Ahorras {peso(product.previousPrice - product.price)}</span>}
          </div>
          <p className="detail-description">{product.description}</p>

          {product.category === "Lotes" && (
            <div className="lot-box">
              <div className="lot-piece-count"><Package size={22} /><span><strong>{product.pieces} prendas</strong>Selección lista para vender</span></div>
              <p>Este lote incluye:</p>
              <ul>{product.lotContents?.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            </div>
          )}

          {product.sizes.length > 0 && (
            <fieldset className="option-group">
              <legend>{product.category === "Calzado" ? "Talla de calzado" : "Talla"}: <strong>{size}</strong></legend>
              <div className="option-buttons">
                {product.sizes.map((item) => <button type="button" className={size === item ? "active" : ""} key={item} onClick={() => setSize(item)}>{item}</button>)}
              </div>
            </fieldset>
          )}
          {product.colors.length > 0 && (
            <fieldset className="option-group">
              <legend>Color: <strong>{color}</strong></legend>
              <div className="option-buttons colors">
                {product.colors.map((item) => <button type="button" className={color === item ? "active" : ""} key={item} onClick={() => setColor(item)}><span className={`swatch swatch-${slugify(item).replace(" ", "-")}`} />{item}</button>)}
              </div>
            </fieldset>
          )}
          <div className="detail-purchase">
            <div><span className="quantity-label">Cantidad</span><QuantitySelector value={quantity} onChange={setQuantity} /></div>
            <button className="button primary add-detail" disabled={!product.available} onClick={() => onAdd(product, { size, color, quantity })}>
              <ShoppingBag size={19} />
              {product.available ? (product.category === "Lotes" ? "Agregar lote al carrito" : "Agregar al carrito") : "Producto agotado"}
            </button>
          </div>
          <div className="detail-assurance">
            <span><ShieldCheck size={18} /><strong>Compra sin pago en línea</strong>Confirma todos los detalles con Fernanda.</span>
            <span><Sparkles size={18} /><strong>Atención personalizada</strong>Te respondemos directamente por WhatsApp.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function CartView({ items, updateQuantity, removeItem }: { items: CartItem[]; updateQuantity: (key: string, quantity: number) => void; removeItem: (key: string) => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const whatsappMessage = [
    "Hola Fernanda 👋",
    "",
    "Me interesan los siguientes productos de tu catálogo:",
    "",
    ...items.flatMap((item, index) => [
      `${index + 1}. ${item.name}`,
      `   Código: ${item.code}`,
      ...(item.size ? [`   Talla: ${item.size}`] : []),
      ...(item.color ? [`   Color: ${item.color}`] : []),
      `   Cantidad: ${item.quantity}`,
      `   Precio: ${peso(item.price * item.quantity)}`,
      "",
    ]),
    `Total aproximado: ${peso(total)}`,
    "",
    "¿Me puedes confirmar disponibilidad?",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="cart-page container">
      <div className="cart-heading">
        <span className="eyebrow">Tu selección</span>
        <h1>Mi carrito</h1>
        <p>{items.length ? `${items.reduce((sum, item) => sum + item.quantity, 0)} artículos listos para confirmar` : "Tu carrito está esperando algo especial."}</p>
      </div>
      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon"><ShoppingBag size={38} /></div>
          <h2>Aún no has agregado productos</h2>
          <p>Explora el catálogo y guarda aquí tus favoritos.</p>
          <AppLink href="/catalogo" className="button primary">Explorar catálogo <ArrowRight size={18} /></AppLink>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Productos en el carrito">
            <div className="cart-list-header"><span>Producto</span><span>Cantidad</span><span>Subtotal</span></div>
            {items.map((item) => (
              <article className="cart-item" key={item.key}>
                <AppLink href={`/producto/${item.productId}`} className="cart-item-image"><img src={item.image} alt={item.name} /></AppLink>
                <div className="cart-item-info">
                  <span className="cart-item-code">{item.code}</span>
                  <AppLink href={`/producto/${item.productId}`}><h3>{item.name}</h3></AppLink>
                  <div className="cart-variants">
                    {item.size && <span>Talla: <strong>{item.size}</strong></span>}
                    {item.color && <span>Color: <strong>{item.color}</strong></span>}
                  </div>
                  <span className="cart-unit-price">{peso(item.price)} c/u</span>
                </div>
                <div className="cart-item-quantity"><QuantitySelector compact value={item.quantity} onChange={(value) => updateQuantity(item.key, value)} /></div>
                <strong className="cart-subtotal">{peso(item.price * item.quantity)}</strong>
                <button className="remove-item" onClick={() => removeItem(item.key)} aria-label={`Eliminar ${item.name}`}><Trash2 size={17} /></button>
              </article>
            ))}
            <AppLink href="/catalogo" className="continue-shopping"><ArrowLeft size={16} /> Seguir comprando</AppLink>
          </section>
          <aside className="cart-summary">
            <span className="eyebrow">Resumen</span>
            <h2>Tu pedido</h2>
            <div className="summary-line"><span>Artículos</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="summary-line"><span>Envío</span><span>Por confirmar</span></div>
            <div className="summary-total"><span>Total aproximado</span><strong>{peso(total)}</strong></div>
            <p className="summary-note">La disponibilidad y el costo de envío se confirman directamente con Fernanda.</p>
            <a className="button whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <span className="whatsapp-symbol">W</span> Enviar pedido por WhatsApp
            </a>
            <div className="summary-safe"><ShieldCheck size={17} /> No se realizará ningún cobro en línea.</div>
          </aside>
        </div>
      )}
    </main>
  );
}

function AdminLogin({ onLogin, cloudMode }: { onLogin: (email: string, password: string) => Promise<void>; cloudMode: boolean }) {
  const [email, setEmail] = useState(cloudMode ? "" : "fernanda@demo.mx");
  const [password, setPassword] = useState(cloudMode ? "" : "fernanda123");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");
    try {
      await onLogin(email, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <span className="brand-name inverse">Fernanda Lara</span>
          <span className="eyebrow light">Administración del catálogo</span>
          <h1>Todo tu estilo,<br />en un solo lugar.</h1>
          <p>Actualiza productos, existencias y ofertas de forma sencilla.</p>
        </div>
        <span className="login-monogram">FL</span>
      </section>
      <section className="login-form-panel">
        <div className="login-form-wrap">
          <span className="login-icon"><CircleUserRound size={24} /></span>
          <h2>Bienvenida, Fernanda</h2>
          <p>Ingresa a tu panel para administrar el catálogo.</p>
          <form onSubmit={submitLogin}>
            <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Contraseña<div className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar contraseña"><Eye size={18} /></button></div></label>
            {loginError && <div className="form-error" role="alert">{loginError}</div>}
            <button className="button primary login-button" type="submit" disabled={submitting}>{submitting ? "Ingresando..." : "Iniciar sesión"} {!submitting && <ArrowRight size={18} />}</button>
          </form>
          <div className="demo-note"><Sparkles size={16} /><span><strong>{cloudMode ? "Administrador protegido" : "Modo demostración local"}</strong>{cloudMode ? "Utiliza la cuenta creada en Supabase Authentication." : "Los cambios se guardan solamente en este navegador."}</span></div>
          <AppLink href="/" className="back-store"><ArrowLeft size={16} /> Volver a la tienda</AppLink>
        </div>
      </section>
    </main>
  );
}

const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Productos", path: "/admin/productos", icon: Package },
  { label: "Ropa", path: "/admin/ropa", icon: Shirt },
  { label: "Calzado", path: "/admin/calzado", icon: ShoppingBag },
  { label: "Lotes", path: "/admin/lotes", icon: Grid2X2 },
  { label: "Ofertas", path: "/admin/ofertas", icon: Percent },
  { label: "Agregar producto", path: "/admin/agregar", icon: Plus },
];

function AdminShell({ children, onLogout, mobileOpen, setMobileOpen }: { children: React.ReactNode; onLogout: () => void; mobileOpen: boolean; setMobileOpen: (value: boolean) => void }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className={mobileOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-logo">
          <span className="admin-logo-mark">FL</span>
          <span><strong>Fernanda Lara</strong><small>Panel administrativo</small></span>
          <button className="admin-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>
        <nav className="admin-nav">
          <span className="admin-nav-title">Administración</span>
          {adminLinks.map(({ label, path, icon: Icon }) => (
            <AppLink key={path} href={path} onClick={() => setMobileOpen(false)} className={pathname === path || (pathname === "/admin" && path.includes("dashboard")) || (path === "/admin/productos" && pathname.startsWith("/admin/editar/")) ? "admin-nav-link active" : "admin-nav-link"}>
              <Icon size={18} />{label}
            </AppLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <AppLink href="/admin/configuracion" className={pathname === "/admin/configuracion" ? "admin-nav-link active" : "admin-nav-link"}><Settings size={18} />Configuración</AppLink>
          <button className="admin-nav-link logout" onClick={onLogout}><LogOut size={18} />Cerrar sesión</button>
          <div className="admin-user"><span>FL</span><div><strong>Fernanda Lara</strong><small>Administradora</small></div></div>
        </div>
      </aside>
      {mobileOpen && <button className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>
          <label className="admin-search"><Search size={18} /><input placeholder="Buscar en el panel..." /></label>
          <div className="admin-top-actions"><AppLink href="/" className="view-store"><Eye size={17} /> Ver tienda</AppLink><span className="admin-avatar">FL</span></div>
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminDashboard({ products }: { products: Product[] }) {
  const stats = [
    { label: "Productos publicados", value: products.length, note: "+2 este mes", icon: Package, tone: "rose" },
    { label: "Productos disponibles", value: products.filter((p) => p.available).length, note: "Inventario activo", icon: Check, tone: "green" },
    { label: "Productos agotados", value: products.filter((p) => !p.available).length, note: "Requiere atención", icon: Clock3, tone: "amber" },
    { label: "Productos en oferta", value: products.filter((p) => p.isOffer).length, note: "Promociones activas", icon: Percent, tone: "pink" },
    { label: "Lotes activos", value: products.filter((p) => p.category === "Lotes" && p.available).length, note: "Listos para venta", icon: Grid2X2, tone: "beige" },
  ];
  return (
    <main className="admin-content">
      <div className="admin-page-heading"><div><span className="eyebrow">Miércoles, 12 de agosto</span><h1>Buenos días, Fernanda</h1><p>Este es el resumen de tu catálogo hoy.</p></div><AppLink href="/admin/agregar" className="button admin-primary"><Plus size={17} /> Agregar producto</AppLink></div>
      <section className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}><span className={`stat-icon ${tone}`}><Icon size={20} /></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel activity-panel">
          <div className="admin-panel-heading"><div><h2>Productos recientes</h2><p>Últimos artículos agregados al catálogo</p></div><AppLink href="/admin/productos" className="text-link">Ver todos <ArrowRight size={15} /></AppLink></div>
          <div className="recent-list">
            {products.slice(0, 5).map((product) => <div className="recent-product" key={product.id}><img src={product.images[0]} alt="" /><div><strong>{product.name}</strong><span>{product.code} · {product.category}</span></div><strong>{peso(product.price)}</strong><span className={product.available ? "status-chip available" : "status-chip unavailable"}>{product.available ? "Disponible" : "Agotado"}</span></div>)}
          </div>
        </article>
        <aside className="admin-panel quick-panel">
          <div className="admin-panel-heading"><div><h2>Acciones rápidas</h2><p>Atajos para tu día</p></div></div>
          <AppLink href="/admin/agregar" className="quick-action"><span><Plus size={19} /></span><div><strong>Nuevo producto</strong><small>Agrega una pieza al catálogo</small></div><ChevronRight size={17} /></AppLink>
          <AppLink href="/admin/ofertas" className="quick-action"><span><Tag size={19} /></span><div><strong>Gestionar ofertas</strong><small>Actualiza tus promociones</small></div><ChevronRight size={17} /></AppLink>
          <AppLink href="/" className="quick-action"><span><Eye size={19} /></span><div><strong>Revisar tienda</strong><small>Mira el catálogo como cliente</small></div><ChevronRight size={17} /></AppLink>
          <div className="catalog-health"><div><span>Estado del catálogo</span><strong>89%</strong></div><div className="health-bar"><span /></div><p>Tu catálogo luce muy bien. Agrega fotos adicionales a 2 productos.</p></div>
        </aside>
      </section>
    </main>
  );
}

function AdminProducts({ products, setProducts, filter, showToast }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; filter?: string; showToast: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(filter || "Todos");
  const visible = products.filter((product) => {
    const matchesQuery = slugify(`${product.name} ${product.code}`).includes(slugify(query));
    const matchesCategory = category === "Todos" || (category === "Ofertas" ? product.isOffer : product.category === category);
    return matchesQuery && matchesCategory;
  });
  const toggle = async (id: number, field: "available" | "isOffer") => {
    const currentProduct = products.find((product) => product.id === id);
    if (!currentProduct) return;
    const nextValue = !currentProduct[field];
    setProducts((current) => current.map((product) => product.id === id ? { ...product, [field]: nextValue } : product));
    if (!isSupabaseConfigured) return;
    try {
      await updateCloudProductFlags(id, { [field]: nextValue });
      showToast("Producto actualizado ✓");
    } catch (error) {
      setProducts((current) => current.map((product) => product.id === id ? { ...product, [field]: !nextValue } : product));
      showToast(error instanceof Error ? error.message : "No se pudo actualizar el producto.");
    }
  };
  const removeProduct = async (product: Product) => {
    if (!window.confirm(`¿Eliminar ${product.name} del catálogo?`)) return;
    try {
      if (isSupabaseConfigured) await deleteCloudProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      showToast("Producto eliminado ✓");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    }
  };
  return (
    <main className="admin-content">
      <div className="admin-page-heading"><div><span className="eyebrow">Catálogo</span><h1>{filter || "Productos"}</h1><p>Administra tus productos, existencias y promociones.</p></div><AppLink href="/admin/agregar" className="button admin-primary"><Plus size={17} /> Agregar producto</AppLink></div>
      <section className="admin-table-panel">
        <div className="table-tools"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o código..." /></label>{!filter && <select value={category} onChange={(event) => setCategory(event.target.value)}><option>Todos</option><option>Ropa</option><option>Calzado</option><option>Lotes</option><option>Ofertas</option></select>}<span>{visible.length} resultados</span></div>
        <div className="table-scroll">
          <table className="products-table">
            <thead><tr><th>Producto</th><th>Código</th><th>Categoría</th><th>Precio</th><th>Disponibilidad</th><th>Oferta</th><th>Acciones</th></tr></thead>
            <tbody>{visible.map((product) => <tr key={product.id}><td><div className="table-product"><img src={product.images[0]} alt="" /><div><strong>{product.name}</strong><span>{product.subcategory}</span></div></div></td><td><span className="code-chip">{product.code}</span></td><td>{product.category}</td><td><strong>{peso(product.price)}</strong>{product.previousPrice && <del>{peso(product.previousPrice)}</del>}</td><td><button className={product.available ? "toggle-chip on" : "toggle-chip"} onClick={() => { void toggle(product.id, "available"); }}><span />{product.available ? "Disponible" : "Agotado"}</button></td><td><button className={product.isOffer ? "switch on" : "switch"} onClick={() => { void toggle(product.id, "isOffer"); }} aria-label={`Cambiar oferta de ${product.name}`}><span /></button></td><td><div className="row-actions"><AppLink href={`/admin/editar/${product.id}`} ariaLabel={`Editar ${product.name}`}><Edit3 size={17} /></AppLink><button aria-label="Eliminar" onClick={() => { void removeProduct(product); }}><Trash2 size={17} /></button></div></td></tr>)}</tbody>
          </table>
        </div>
        {!visible.length && <div className="admin-empty"><Package size={30} /><strong>No hay productos para mostrar</strong><span>Prueba cambiando los filtros.</span></div>}
      </section>
    </main>
  );
}

function AdminProductForm({
  products,
  setProducts,
  product,
  onSaved,
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  product?: Product;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [code, setCode] = useState(product?.code ?? "");
  const [category, setCategory] = useState<Product["category"]>(product?.category ?? "Ropa");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [previousPrice, setPreviousPrice] = useState(product?.previousPrice ? String(product.previousPrice) : "");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "");
  const [colors, setColors] = useState(product?.colors.join(", ") ?? "");
  const [pieces, setPieces] = useState(product?.pieces ? String(product.pieces) : "");
  const [lotContents, setLotContents] = useState(product?.lotContents?.join(", ") ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [offer, setOffer] = useState(product?.isOffer ?? false);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const optimizeImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const source = String(reader.result);
      const preview = new Image();
      preview.onerror = () => reject(new Error("El archivo no parece ser una imagen válida."));
      preview.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(preview.width, preview.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(preview.width * scale));
        canvas.height = Math.max(1, Math.round(preview.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("No se pudo procesar la imagen."));
        context.drawImage(preview, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      preview.src = source;
    };
    reader.readAsDataURL(file);
  });

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setFormError("");
    const availableSlots = Math.max(0, 8 - images.length);
    const selected = Array.from(files).slice(0, availableSlots);
    if (!availableSlots) {
      setFormError("Puedes guardar hasta 8 fotografías por producto.");
      return;
    }
    setUploading(true);
    try {
      const optimized = await Promise.all(selected.map(optimizeImage));
      setImages((current) => [...current, ...optimized].slice(0, 8));
      if (files.length > availableSlots) setFormError("Se agregaron las primeras 8 fotografías.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudieron subir las fotografías.");
    } finally {
      setUploading(false);
    }
  };
  const moveImage = (index: number, direction: -1 | 1) => setImages((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const makeMainImage = (index: number) => setImages((current) => {
    const next = [...current];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    return next;
  });

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!images.length) {
      setFormError("Agrega al menos una fotografía antes de guardar.");
      return;
    }
    const normalizedCode = code.trim().toUpperCase();
    const duplicate = products.some((item) => item.id !== product?.id && item.code.toUpperCase() === normalizedCode);
    if (duplicate) {
      setFormError("Ya existe un producto con ese código.");
      return;
    }
    const savedProduct: Product = {
      id: product?.id ?? Math.max(0, ...products.map((item) => item.id)) + 1,
      name: name.trim(),
      code: normalizedCode,
      category,
      subcategory: subcategory.trim(),
      description: description.trim(),
      price: Number(price),
      previousPrice: previousPrice ? Number(previousPrice) : undefined,
      isOffer: offer,
      available,
      sizes: sizes.split(",").map((item) => item.trim()).filter(Boolean),
      colors: colors.split(",").map((item) => item.trim()).filter(Boolean),
      images,
      pieces: category === "Lotes" && pieces ? Number(pieces) : undefined,
      lotContents: category === "Lotes" ? lotContents.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    };
    setSaving(true);
    try {
      const finalProduct = isSupabaseConfigured ? await saveCloudProduct(savedProduct) : savedProduct;
      setProducts((current) => product
        ? current.map((item) => item.id === product.id ? finalProduct : item)
        : [finalProduct, ...current]);
      onSaved(product ? "Producto actualizado correctamente ✓" : "Producto agregado correctamente ✓");
      router.push("/admin/productos");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-content">
      <div className="admin-page-heading"><div><span className="eyebrow">Catálogo</span><h1>{product ? "Editar producto" : "Agregar producto"}</h1><p>{product ? "Modifica la información y las fotografías del producto." : "Completa la información para publicar una nueva pieza."}</p></div><button className="button secondary" onClick={() => router.push("/admin/productos")}>Cancelar</button></div>
      <form className="product-form" onSubmit={saveProduct}>
        <section className="form-panel">
          <div className="form-section-heading"><span>01</span><div><h2>Información básica</h2><p>Datos principales que verán tus clientes.</p></div></div>
          <div className="form-grid"><label className="span-2">Nombre del producto<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Vestido Aurora" /></label><label>Código<input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. R-057" /></label><label>Categoría<select required value={category} onChange={(event) => setCategory(event.target.value as Product["category"])}><option>Ropa</option><option>Calzado</option><option>Lotes</option></select></label><label>Subcategoría<input value={subcategory} onChange={(event) => setSubcategory(event.target.value)} placeholder="Ej. Vestidos" /></label><label className="span-2">Descripción<textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe materiales, estilo y detalles relevantes..." /></label></div>
        </section>
        <section className="form-panel">
          <div className="form-section-heading"><span>02</span><div><h2>Precio y disponibilidad</h2><p>Define el precio y el estado del producto.</p></div></div>
          <div className="form-grid"><label>Precio actual<div className="money-input"><span>$</span><input required min="0" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" /></div></label><label>Precio anterior<div className="money-input"><span>$</span><input min="0" type="number" value={previousPrice} onChange={(event) => setPreviousPrice(event.target.value)} placeholder="Opcional" /></div></label><label className="switch-label"><span><strong>Producto en oferta</strong><small>Aparecerá automáticamente en Ofertas.</small></span><button type="button" className={offer ? "switch on" : "switch"} onClick={() => setOffer((value) => !value)}><span /></button></label><label className="switch-label"><span><strong>Producto disponible</strong><small>Los clientes podrán agregarlo al carrito.</small></span><button type="button" className={available ? "switch on" : "switch"} onClick={() => setAvailable((value) => !value)}><span /></button></label></div>
        </section>
        <section className="form-panel">
          <div className="form-section-heading"><span>03</span><div><h2>Fotografías</h2><p>La primera imagen será la portada del producto.</p></div></div>
          <label className={uploading ? "upload-zone uploading" : "upload-zone"}><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={(event) => { void uploadImages(event.target.files); event.target.value = ""; }} /><span>{uploading ? <Clock3 size={25} /> : <Upload size={25} />}</span><strong>{uploading ? "Optimizando fotografías..." : "Arrastra tus fotos aquí o haz clic para subir"}</strong><small>JPG, PNG o WEBP · Máximo 8 fotografías</small></label>
          {images.length > 0 && <><p className="image-help">Usa la estrella para elegir la portada. También puedes cambiar el orden o eliminar fotografías.</p><div className="uploaded-images">{images.map((image, index) => <div className="uploaded-image" key={`${image.slice(0, 30)}-${index}`}><img src={image} alt={`Fotografía ${index + 1} de ${name || "producto"}`} />{index === 0 && <span>Principal</span>}<div><button type="button" disabled={index === 0} onClick={() => makeMainImage(index)} aria-label="Usar como imagen principal" title="Usar como principal"><Star size={15} /></button><button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label="Mover antes" title="Mover antes"><ChevronLeft size={15} /></button><button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label="Mover después" title="Mover después"><ChevronRight size={15} /></button><button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Eliminar imagen" title="Eliminar"><Trash2 size={15} /></button></div></div>)}</div></>}
        </section>
        <section className="form-panel">
          <div className="form-section-heading"><span>04</span><div><h2>Variantes e inventario</h2><p>Separa varias opciones con comas.</p></div></div>
          <div className="form-grid"><label>Tallas disponibles<input value={sizes} onChange={(event) => setSizes(event.target.value)} placeholder="CH, M, G, EG" /></label><label>Colores disponibles<input value={colors} onChange={(event) => setColors(event.target.value)} placeholder="Rosa, Negro, Beige" /></label>{category === "Lotes" && <><label>Cantidad de prendas<input min="0" type="number" value={pieces} onChange={(event) => setPieces(event.target.value)} placeholder="Ej. 25" /></label><label>Contenido del lote<input value={lotContents} onChange={(event) => setLotContents(event.target.value)} placeholder="8 blusas, 5 vestidos..." /></label></>}</div>
        </section>
        {formError && <div className="form-error" role="alert">{formError}</div>}
        <div className="form-actions"><button type="button" className="button secondary" onClick={() => router.push("/admin/productos")}>Cancelar</button><button type="submit" className="button admin-primary" disabled={uploading || saving}><Check size={17} /> {saving ? "Guardando..." : product ? "Guardar cambios" : "Guardar producto"}</button></div>
      </form>
    </main>
  );
}

function AdminView({ products, setProducts, showToast }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; showToast: (message: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const session = isSupabaseConfigured ? await getCloudSession() : null;
        if (active) setLoggedIn(isSupabaseConfigured ? Boolean(session) : localStorage.getItem("fl_admin_session") === "active");
      } catch {
        if (active) setLoggedIn(false);
      } finally {
        if (active) setChecked(true);
      }
    };
    void checkSession();
    return () => { active = false; };
  }, []);
  if (!checked) return <div className="admin-loading"><span className="brand-name">Fernanda Lara</span></div>;
  if (!loggedIn) return <AdminLogin cloudMode={isSupabaseConfigured} onLogin={async (email, password) => {
    if (isSupabaseConfigured) await signInCloudAdmin(email, password);
    else localStorage.setItem("fl_admin_session", "active");
    setLoggedIn(true);
    router.push("/admin/dashboard");
  }} />;
  const pathParts = pathname.split("/");
  const section = pathParts[2] || "dashboard";
  const editingProduct = section === "editar" ? products.find((item) => item.id === Number(pathParts[3])) : undefined;
  const content = section === "dashboard" ? <AdminDashboard products={products} />
    : section === "agregar" ? <AdminProductForm products={products} setProducts={setProducts} onSaved={showToast} />
      : section === "editar" && editingProduct ? <AdminProductForm products={products} setProducts={setProducts} product={editingProduct} onSaved={showToast} />
        : section === "editar" ? <main className="admin-content"><div className="admin-empty"><Package size={30} /><strong>Producto no encontrado</strong><span>Es posible que haya sido eliminado.</span><AppLink href="/admin/productos" className="button secondary">Volver a productos</AppLink></div></main>
      : section === "configuracion" ? <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">Cuenta</span><h1>Configuración</h1><p>Datos generales de la tienda y contacto.</p></div></div><section className="form-panel settings-panel"><div className="form-section-heading"><span><Settings size={18} /></span><div><h2>Información de la tienda</h2><p>Estos datos se mostrarán a tus clientes.</p></div></div><div className="form-grid"><label>Nombre de la tienda<input defaultValue="Fernanda Lara" /></label><label>Número de WhatsApp<input defaultValue="+52 1 000 000 0000" /></label><label className="span-2">Descripción<textarea rows={4} defaultValue="Moda, calzado y lotes elegidos con intención para ti." /></label></div><div className="form-actions"><button className="button admin-primary" onClick={() => showToast("Configuración guardada ✓")}>Guardar cambios</button></div></section></main>
        : <AdminProducts products={products} setProducts={setProducts} showToast={showToast} filter={section === "productos" ? undefined : section === "ropa" ? "Ropa" : section === "calzado" ? "Calzado" : section === "lotes" ? "Lotes" : "Ofertas"} />;
  return <AdminShell mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={() => {
    const logout = async () => {
      if (isSupabaseConfigured) await signOutCloudAdmin();
      else localStorage.removeItem("fl_admin_session");
      setLoggedIn(false);
      router.push("/admin");
    };
    void logout();
  }}>{content}</AdminShell>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand"><span className="brand-name inverse">Fernanda Lara</span><p>Moda, calzado y lotes elegidos con intención para acompañar tu estilo.</p></div>
        <div><strong>Explorar</strong><AppLink href="/catalogo">Catálogo</AppLink><AppLink href="/categoria/ropa">Ropa</AppLink><AppLink href="/categoria/calzado">Calzado</AppLink><AppLink href="/categoria/ofertas">Ofertas</AppLink></div>
        <div><strong>Ayuda</strong><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">Contactar por WhatsApp</a><span>Envíos a todo México</span><span>Atención personalizada</span></div>
        <div className="footer-note"><Sparkles size={20} /><p>Elige tus productos y envía tu pedido completo a Fernanda en un solo mensaje.</p></div>
      </div>
      <div className="footer-bottom container"><span>© 2026 Fernanda Lara</span><span>Hecho con detalle en México</span><AppLink href="/admin">Administrar tienda</AppLink></div>
    </footer>
  );
}

export function StoreApp() {
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      try {
      const storedCart = localStorage.getItem("fernanda_lara_cart");
      if (storedCart) setCart(JSON.parse(storedCart));
        if (isSupabaseConfigured) {
          const cloudProducts = await loadCloudProducts();
          setProducts(cloudProducts);
        } else {
          const storedProducts = localStorage.getItem("fernanda_lara_products");
          if (storedProducts) setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error("No se pudo cargar el catálogo:", error);
      } finally {
        setCartReady(true);
        setCatalogReady(true);
      }
    };
    void loadStore();
  }, []);
  useEffect(() => { if (cartReady) localStorage.setItem("fernanda_lara_cart", JSON.stringify(cart)); }, [cart, cartReady]);
  useEffect(() => { if (catalogReady && !isSupabaseConfigured) localStorage.setItem("fernanda_lara_products", JSON.stringify(products)); }, [products, catalogReady]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const addToCart = (product: Product, options?: { size?: string; color?: string; quantity?: number }) => {
    if (!product.available) return;
    const size = options?.size || product.sizes[0];
    const color = options?.color || product.colors[0];
    const key = `${product.id}-${size || "na"}-${color || "na"}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + (options?.quantity || 1) } : item);
      return [...current, { key, productId: product.id, name: product.name, code: product.code, image: product.images[0], price: product.price, size, color, quantity: options?.quantity || 1 }];
    });
    showToast("Producto agregado al carrito ✓");
  };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname.startsWith("/admin")) return <><AdminView products={products} setProducts={setProducts} showToast={showToast} />{toast && <div className="toast admin-toast"><Check size={18} />{toast}</div>}</>;

  let content: React.ReactNode;
  if (pathname === "/carrito") content = <CartView items={cart} updateQuantity={(key, quantity) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity } : item))} removeItem={(key) => { setCart((current) => current.filter((item) => item.key !== key)); showToast("Producto eliminado"); }} />;
  else if (pathname.startsWith("/producto/")) content = <ProductDetailView product={products.find((product) => product.id === Number(pathname.split("/")[2]))} onAdd={addToCart} />;
  else if (pathname.startsWith("/categoria/")) {
    const slug = pathname.split("/")[2];
    const category = slug === "ropa" ? "Ropa" : slug === "calzado" ? "Calzado" : slug === "lotes" ? "Lotes" : "Ofertas";
    content = <CatalogView products={products} onAdd={addToCart} forcedCategory={category} />;
  } else if (pathname === "/catalogo") content = <CatalogView products={products} onAdd={addToCart} />;
  else content = <HomeView products={products} onAdd={addToCart} />;

  return (
    <div className="store-app">
      <Header cartCount={cartCount} />
      {content}
      <Footer />
      <MobileNav cartCount={cartCount} />
      {toast && <div className="toast"><Check size={18} />{toast}</div>}
    </div>
  );
}
