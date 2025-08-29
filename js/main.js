// ===== POO =====
class Producto {
  constructor({ id, nombre, precio, stock }) {
    this.id = id;
    this.nombre = nombre;
    this.precio = Number(precio);
    this.stock = Number(stock);
  }
  hayStock(cantidad) {
    const c = Number(cantidad) || 0;
    return c >= 1 && c <= this.stock;
  }
  descontar(cantidad) {
    const c = Number(cantidad) || 0;
    if (!this.hayStock(c)) throw new Error("Stock insuficiente");
    this.stock -= c;
    return this.stock;
  }
}

class Inventario {
  constructor(items = []) { this.items = items; }
  all() { return this.items; }
  getById(id) { return this.items.find(p => p.id === id); }
  hasStock(id, cantidad) {
    const p = this.getById(id);
    const c = Number(cantidad) || 0;
    return !!p && c >= 1 && c <= p.stock;
  }
  descontar(id, cantidad) {
    const p = this.getById(id);
    if (!p) throw new Error("Producto no existe");
    const c = Number(cantidad) || 0;
    if (c < 0) throw new Error("Cantidad inválida");
    if (c > p.stock) throw new Error("Stock insuficiente");
    p.stock -= c;
    return p.stock;
  }
}

class Carrito {
  constructor() { this.items = []; } // [{ id, nombre, precio, cantidad }]
  getItems() { return this.items; }
  isEmpty() { return this.items.length === 0; }
  #idx(id) { return this.items.findIndex(i => i.id === id); }
  add(producto, cantidad = 1) {
    const qty = Number(cantidad) || 0;
    if (qty < 1) return;
    const i = this.#idx(producto.id);
    if (i >= 0) {
      this.items[i].cantidad = Math.min(this.items[i].cantidad + qty, producto.stock);
    } else {
      this.items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Math.min(qty, producto.stock),
      });
    }
  }
  increment(id, getProd) {
    const i = this.#idx(id);
    if (i < 0) return;
    const p = getProd(id);
    if (!p) return;
    this.items[i].cantidad = Math.min(this.items[i].cantidad + 1, p.stock);
  }
  decrement(id) {
    const i = this.#idx(id);
    if (i < 0) return;
    this.items[i].cantidad = Math.max(this.items[i].cantidad - 1, 0);
    if (this.items[i].cantidad === 0) this.items.splice(i, 1);
  }
  remove(id) {
    const i = this.#idx(id);
    if (i >= 0) this.items.splice(i, 1);
  }
  removeQuantity(id, qty) {
    const i = this.#idx(id);
    if (i < 0) return;
    const n = Math.max(0, (Number(this.items[i].cantidad) || 0) - (Number(qty) || 0));
    this.items[i].cantidad = n;
    if (n === 0) this.items.splice(i, 1);
  }
  clear() { this.items.length = 0; }
}

// ===== Inventario base -> instancias =====
let productos = [
  { id: 1,  nombre: "Helado Vainilla",         precio: 1.5, stock: 10 },
  { id: 2,  nombre: "Helado Chocolate",        precio: 1.8, stock: 8  },
  { id: 3,  nombre: "Cono Simple",             precio: 0.5, stock: 25 },
  { id: 4,  nombre: "Cono Doble",              precio: 0.8, stock: 15 },
  { id: 5,  nombre: "Paleta Fresa",            precio: 1.0, stock: 20 },
  { id: 6,  nombre: "Paleta Mango",            precio: 1.0, stock: 18 },
  { id: 7,  nombre: "Sundae Vainilla",         precio: 2.5, stock: 12 },
  { id: 8,  nombre: "Sundae Chocolate",        precio: 2.8, stock: 10 },
  { id: 9,  nombre: "Banana Split",            precio: 3.5, stock: 7  },
  { id: 10, nombre: "Malteada Fresa",          precio: 2.0, stock: 14 },
  { id: 11, nombre: "Malteada Vainilla",       precio: 2.0, stock: 9  },
  { id: 12, nombre: "Malteada Chocolate",      precio: 2.2, stock: 11 },
  { id: 13, nombre: "Helado Pistacho",         precio: 2.0, stock: 6  },
  { id: 14, nombre: "Helado Cookies & Cream",  precio: 2.3, stock: 8  },
  { id: 15, nombre: "Helado de Café",          precio: 2.1, stock: 5  },
];
productos = productos.map(p => new Producto(p));
const inventario = new Inventario(productos);
const carrito = new Carrito();

// ===== Dinero / IVA / Toast =====
const money = n => new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(n);
const TASA_IMPUESTO = 0.13;
const to2 = n => Math.round(n * 100) / 100;

function calcularTotales(items, aplicarImpuesto = false) {
  let subtotal = 0;
  for (const it of items) {
    const precio = Number(it?.precio) || 0;
    const cant = Number(it?.cantidad) || 0;
    subtotal += precio * cant;
  }
  subtotal = to2(subtotal);
  const impuesto = aplicarImpuesto ? to2(subtotal * TASA_IMPUESTO) : 0;
  const total = to2(subtotal + impuesto);
  return { subtotal, impuesto, total };
}

function notify(msg, type = "success") {
  const t = document.getElementById("toast");
  if (!t) { alert(msg); return; }
  t.className = "";
  t.textContent = msg;
  t.classList.add("show", type);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2300);
}

// ===== Drawer carrito + badge =====
const overlayEl = document.getElementById("overlay");
const cartFab = document.getElementById("cart-fab");

function cartItemCount(){
  return carrito.getItems().reduce((a,b)=> a + (Number(b.cantidad)||0), 0);
}
function updateCartBadge(){
  const b = document.getElementById("cart-badge");
  if (b) b.textContent = cartItemCount();
}
function openCart(){
  document.body.classList.add("cart-open");
  if (cartFab) cartFab.setAttribute("aria-expanded","true");
  if (overlayEl){ overlayEl.hidden = false; overlayEl.dataset.mode = "cart"; }
}
function closeCart(){
  document.body.classList.remove("cart-open");
  if (cartFab) cartFab.setAttribute("aria-expanded","false");
  if (overlayEl && overlayEl.dataset.mode === "cart") overlayEl.hidden = true;
}
function toggleCart(){ document.body.classList.contains("cart-open") ? closeCart() : openCart(); }

if (cartFab) cartFab.addEventListener("click", toggleCart);
if (overlayEl) overlayEl.addEventListener("click", () => {
  if (overlayEl.dataset.mode === "cart") closeCart();
  if (overlayEl.dataset.mode === "invoice") closeFacturaModal();
});

// ===== Helpers =====
const contenedor = document.getElementById("lista-productos");
function getProductoById(id) { return inventario.getById(id); }

// ---- Colores por sabor (saturados) ----
const PALETTE = {
  vanilla:    "#FFD400",
  chocolate:  "#5A2600",
  strawberry: "#FF1744",
  mango:      "#FF8A00",
  pistachio:  "#00E676",
  coffee:     "#6B3F12",
  cookie:     "#C06E2E",
  cream:      "#FFE36F",
  blue:       "#00A8FF",
  pink:       "#FF1493"
};

function flavorColorsForName(nombre = "") {
  const n = nombre.toLowerCase();
  if (n.includes("banana split")) return [PALETTE.strawberry, PALETTE.vanilla, PALETTE.chocolate];
  if (n.includes("cookies")) return [PALETTE.cream];
  if (n.includes("vainilla"))   return [PALETTE.vanilla];
  if (n.includes("chocolate"))  return [PALETTE.chocolate];
  if (n.includes("fresa"))      return [PALETTE.strawberry];
  if (n.includes("mango"))      return [PALETTE.mango];
  if (n.includes("pistacho"))   return [PALETTE.pistachio];
  if (n.includes("café") || n.includes("cafe")) return [PALETTE.coffee];
  if (n.includes("helado"))     return [PALETTE.blue, PALETTE.pink, PALETTE.blue];
  return [PALETTE.blue, PALETTE.pink];
}

function iconTypeFromName(nombre = "") {
  const n = nombre.toLowerCase();
  if (n.includes("cono"))     return "cono";
  if (n.includes("paleta"))   return "paleta";
  if (n.includes("sundae"))   return "sundae";
  if (n.includes("malteada")) return "malteada";
  if (n.includes("banana"))   return "banana";
  if (n.includes("helado"))   return "pote";
  return "pote";
}

// ---- SVG dinámico por tipo + colores de sabor ----
function makeIcon(tipo = "pote", nombreProd = "") {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.classList.add("brand-mark");

  const colors = flavorColorsForName(nombreProd);
  const main = colors[0] || PALETTE.blue;
  const c2   = colors[1] || main;
  const c3   = colors[2] || c2;

  const mango = "#FF9F43";
  const bowl  = "#8FD8FF";
  const banda = "#FFB3D1";

  const el = (name, attrs={}) => {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  };

  if (tipo === "cono") {
    const doble = /doble/i.test(nombreProd);
    if (doble) {
      svg.append(
        el("circle", { cx:10, cy:7, r:4.2, fill: main }),
        el("circle", { cx:14, cy:7, r:4.2, fill: c2 }),
        el("path",   { d:"M7 10l5 12 5-12z", fill: mango })
      );
    } else {
      svg.append(
        el("circle", { cx:12, cy:7, r:5, fill: main }),
        el("path",   { d:"M7 10l5 12 5-12z", fill: mango })
      );
    }
  } else if (tipo === "paleta") {
    svg.append(
      el("rect", { x:7, y:3, width:10, height:14, rx:4, fill: main }),
      el("rect", { x:11, y:17, width:2, height:5, rx:1, fill: mango })
    );
  } else if (tipo === "malteada") {
    svg.append(
      el("path", { d:"M8 7h8l-1 7a4 4 0 0 1-6 0L8 7z", fill: main }),
      el("rect", { x:14, y:2, width:2, height:5, fill: PALETTE.pink })
    );
  } else if (tipo === "sundae") {
    svg.append(
      el("circle", { cx:9,  cy:9, r:3, fill: main }),
      el("circle", { cx:15, cy:9, r:3, fill: c2 }),
      el("path",   { d:"M5 12h14a6 6 0 0 1-12 0z", fill: bowl })
    );
  } else if (tipo === "banana") {
    svg.append(
      el("path", { d:"M3 14c4 4 14 4 18-2", fill:"none", stroke:mango, "stroke-width":"2", "stroke-linecap":"round" }),
      el("circle",{ cx:9,  cy:10, r:2, fill: main }),
      el("circle",{ cx:13, cy:10, r:2, fill: c2 }),
      el("circle",{ cx:17, cy:10, r:2, fill: c3 })
    );
  } else {
    // Pote/tarrina
    svg.append(
      el("circle", { cx:9,  cy:9, r:3, fill: main }),
      el("circle", { cx:12, cy:8, r:3, fill: c2 }),
      el("circle", { cx:15, cy:9, r:3, fill: c3 }),
      el("path",   { d:"M4 12h16a6 6 0 0 1-12 0z", fill: bowl }),
      el("rect",   { x:7, y:15, width:10, height:3, rx:1, fill: banda })
    );
  }
  return svg;
}

function agregarAlCarrito(producto, cantidad) { carrito.add(producto, cantidad); renderCarrito(); }
function incrementarItem(id) {
  const before = carrito.getItems().find(i => i.id === id)?.cantidad ?? 0;
  carrito.increment(id, getProductoById);
  const after = carrito.getItems().find(i => i.id === id)?.cantidad ?? 0;
  if (after === before) notify("Ya no hay más stock para este producto.", "warn");
  renderCarrito();
}
function decrementarItem(id) { carrito.decrement(id); renderCarrito(); }
function eliminarItem(id) { carrito.remove(id); renderCarrito(); }
function vaciarCarrito() { carrito.clear(); renderCarrito(); }

// ===== Catálogo =====
function crearTarjetaProducto(producto) {
  const card = document.createElement("article");
  card.className = "producto";

  const icon = makeIcon(iconTypeFromName(producto.nombre), producto.nombre);
  card.appendChild(icon);

  const h3 = document.createElement("h3");
  h3.textContent = producto.nombre;

  const pPrecio = document.createElement("p");
  pPrecio.textContent = `Precio: ${money(producto.precio)}`;

  const pStock = document.createElement("p");
  pStock.textContent = `Stock: ${producto.stock}`;

  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = producto.stock;
  input.step = 1;
  input.value = 1;
  input.addEventListener("input", () => {
    let v = parseInt(input.value, 10) || 1;
    v = Math.max(1, Math.min(v, producto.stock));
    input.value = v;
  });

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Agregar";
  btn.addEventListener("click", () => {
    const qty = parseInt(input.value, 10) || 0;
    if (qty < 1) {
      notify("Ingresa una cantidad válida (mínimo 1).", "warn");
      input.value = 1;
      return;
    }
    if (qty > producto.stock) {
      notify(`Máximo disponible: ${producto.stock}.`, "warn");
      input.value = producto.stock;
      return;
    }
    agregarAlCarrito(producto, qty);
    notify(`${producto.nombre} ×${qty} agregado al carrito.`, "success");
  });

  if (producto.stock <= 0) {
    input.disabled = true;
    btn.disabled = true;
    btn.textContent = "Agotado";
  }

  card.append(h3, pPrecio, pStock, input, btn);
  return card;
}

function renderProductos(lista) {
  contenedor.textContent = "";
  for (const prod of lista) contenedor.appendChild(crearTarjetaProducto(prod));
}
renderProductos(inventario.all());

// ===== Carrito (UI) =====
function renderCarrito() {
  const panel = document.getElementById("carrito");
  panel.textContent = "";

  const h3 = document.createElement("h3");
  h3.textContent = "Tu carrito";
  panel.appendChild(h3);

  const items = carrito.getItems();
  if (items.length === 0) {
    const p = document.createElement("p");
    p.textContent = "El carrito está vacío.";
    panel.appendChild(p);
    updateCartBadge();
    return;
  }

  const lista = document.createElement("ul");
  let totalGeneral = 0;

  items.forEach(item => {
    const prod = getProductoById(item.id);
    const subtotal = item.precio * item.cantidad;
    totalGeneral += subtotal;
    const restante = prod.stock - item.cantidad;

    const li = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = `${item.nombre} — x${item.cantidad} — PU: ${money(item.precio)} — Subtotal: ${money(subtotal)}`;

    const controles = document.createElement("div");
    controles.style.display = "inline-flex";
    controles.style.gap = ".5rem";
    controles.style.marginLeft = ".75rem";

    const btnMenos = document.createElement("button");
    btnMenos.className = "btn";
    btnMenos.textContent = "−";
    btnMenos.title = "Restar 1";
    btnMenos.disabled = item.cantidad <= 1;
    btnMenos.addEventListener("click", () => decrementarItem(item.id));

    const btnMas = document.createElement("button");
    btnMas.className = "btn";
    btnMas.textContent = "+";
    btnMas.title = "Sumar 1";
    btnMas.disabled = item.cantidad >= prod.stock;
    btnMas.addEventListener("click", () => incrementarItem(item.id));

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn btn-danger";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.title = "Quitar del carrito";
    btnEliminar.addEventListener("click", () => eliminarItem(item.id));

    const infoRestante = document.createElement("small");
    infoRestante.textContent = `Quedan ${restante} en stock`;

    controles.append(btnMenos, btnMas, btnEliminar, infoRestante);
    li.append(texto, controles);
    lista.appendChild(li);
  });

  const pTotal = document.createElement("p");
  pTotal.style.fontWeight = "bold";
  pTotal.textContent = `Total: ${money(totalGeneral)}`;

  const btnConfirmar = document.createElement("button");
  btnConfirmar.className = "btn btn-primary";
  btnConfirmar.textContent = "Confirmar compra";
  btnConfirmar.addEventListener("click", confirmarCompra);

  const btnVaciar = document.createElement("button");
  btnVaciar.className = "btn btn-danger";
  btnVaciar.textContent = "Vaciar carrito";
  btnVaciar.addEventListener("click", vaciarCarrito);

  panel.append(lista, pTotal, btnConfirmar, btnVaciar);

  updateCartBadge();
}
renderCarrito();

// ===== Factura MODAL (previa, no descuenta stock) =====
let ventaPendiente = null;

function closeFacturaModal(){
  const modal = document.getElementById("factura-modal");
  if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
  if (overlayEl && overlayEl.dataset.mode === "invoice") {
    overlayEl.hidden = true;
    delete overlayEl.dataset.mode;
  }
  document.removeEventListener("keydown", escCloseFactura);
}
function escCloseFactura(e){ if (e.key === "Escape") closeFacturaModal(); }

function mostrarFacturaModal(items) {
  if (overlayEl) { overlayEl.hidden = false; overlayEl.dataset.mode = "invoice"; }
  document.addEventListener("keydown", escCloseFactura);

  const modal = document.createElement("section");
  modal.id = "factura-modal";
  Object.assign(modal.style, {
    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    width: "min(92vw, 640px)", zIndex: 10001,
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "1rem 1.25rem", boxShadow: "var(--shadow)"
  });

  const h3 = document.createElement("h3");
  h3.textContent = "Factura";
  modal.appendChild(h3);

  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Producto","Cantidad","Precio unitario","Subtotal"].forEach(txt=>{
    const th = document.createElement("th"); th.textContent = txt; trHead.appendChild(th);
  });
  thead.appendChild(trHead); 
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  const copia = items.map(it => ({ ...it }));
  for (const it of copia) {
    const tr = document.createElement("tr");
    const tdP = document.createElement("td"); tdP.textContent = it.nombre;
    const tdC = document.createElement("td"); tdC.textContent = it.cantidad;
    const tdU = document.createElement("td"); tdU.textContent = money(Number(it.precio));
    const tdS = document.createElement("td"); tdS.textContent = money(Number(it.precio) * Number(it.cantidad));
    tr.append(tdP, tdC, tdU, tdS);
    tbody.appendChild(tr);
  }
  // (¡FIX!) Asegurarnos de añadir el tbody a la tabla:
  tabla.appendChild(tbody);

  Object.assign(tabla.style, { width:"100%", borderCollapse:"collapse", marginTop:".5rem" });
  modal.appendChild(tabla);

  const ivaWrap = document.createElement("label");
  Object.assign(ivaWrap.style, { display:"inline-flex", alignItems:"center", gap:".4rem", marginTop:".5rem" });
  const ivaChk = document.createElement("input");
  ivaChk.type = "checkbox"; ivaChk.id = "aplicarIVA";
  ivaWrap.append(ivaChk, document.createTextNode("Aplicar IVA (13%)"));
  modal.appendChild(ivaWrap);

  const pSub = document.createElement("p");
  const pImp = document.createElement("p");
  const pTot = document.createElement("p"); pTot.style.fontWeight = "bold";
  modal.append(pSub, pImp, pTot);

  function renderTotales() {
    const { subtotal, impuesto, total } = calcularTotales(copia, ivaChk.checked);
    pSub.textContent = `Subtotal: ${money(subtotal)}`;
    pImp.textContent = `Impuesto (13%): ${money(impuesto)}`;
    pTot.textContent = `Total: ${money(total)}`;
  }
  ivaChk.addEventListener("change", renderTotales);
  renderTotales();

  const botones = document.createElement("div");
  Object.assign(botones.style, { display:"flex", gap:".5rem", marginTop:".5rem" });

  const btnSeguir = document.createElement("button");
  btnSeguir.className = "btn btn-primary";
  btnSeguir.textContent = "Seguir comprando";
  btnSeguir.addEventListener("click", closeFacturaModal);

  const btnFinalizar = document.createElement("button");
  btnFinalizar.className = "btn btn-danger";
  btnFinalizar.textContent = "Finalizar pedido";
  btnFinalizar.addEventListener("click", () => {
    closeFacturaModal();
    finalizarPedido(copia, ivaChk.checked);
  });

  botones.append(btnSeguir, btnFinalizar);
  modal.appendChild(botones);

  document.body.appendChild(modal);
}

// ===== Modal Gracias + Historial =====
function crearTabla(items) {
  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Producto","Cantidad","Precio unitario","Subtotal"].forEach(txt=>{
    const th=document.createElement("th"); th.textContent=txt; trHead.appendChild(th);
  });
  thead.appendChild(trHead); tabla.appendChild(thead);
  const tbody = document.createElement("tbody");
  items.forEach(it=>{
    const tr=document.createElement("tr");
    const tdP=document.createElement("td"); tdP.textContent=it.nombre;
    const tdC=document.createElement("td"); tdC.textContent=it.cantidad;
    const tdU=document.createElement("td"); tdU.textContent=money(Number(it.precio));
    const tdS=document.createElement("td"); tdS.textContent=money(Number(it.precio)*Number(it.cantidad));
    tr.append(tdP,tdC,tdU,tdS); tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
  Object.assign(tabla.style, { width:"100%", borderCollapse:"collapse", marginTop:".5rem" });
  return tabla;
}

function fechaCorta(d){
  try { return new Intl.DateTimeFormat("es-SV",{dateStyle:"medium", timeStyle:"short"}).format(d); }
  catch { return d.toLocaleString(); }
}

function renderGraciasModal(pedido) {
  const s = document.getElementById("gracias");
  const detalle = document.getElementById("gracias-detalle");
  const ticketBox = document.getElementById("gracias-ticket");
  if (!overlayEl || !s) { notify("Pedido finalizado.", "success"); return; }

  overlayEl.hidden = false;
  overlayEl.dataset.mode = "modal";
  s.hidden = false;

  if (detalle) detalle.textContent = `Pedido #${pedido.id} — ${fechaCorta(pedido.fecha)} — Total: ${money(pedido.totales.total)}`;
  if (ticketBox) {
    ticketBox.textContent = "";
    ticketBox.appendChild(crearTabla(pedido.items));
    const pSub = document.createElement("p");
    const pImp = document.createElement("p");
    const pTot = document.createElement("p"); pTot.style.fontWeight = "bold";
    pSub.textContent = `Subtotal: ${money(pedido.totales.subtotal)}`;
    pImp.textContent = `Impuesto (13%): ${money(pedido.totales.impuesto)}${pedido.aplicarIVA ? "" : " (no aplicado)"}`;
    pTot.textContent = `Total: ${money(pedido.totales.total)}`;
    ticketBox.append(pSub, pImp, pTot);
  }

  const btnVolver = document.getElementById("gracias-volver");
  if (btnVolver) btnVolver.onclick = () => {
    s.hidden = true;
    overlayEl.hidden = true;
    delete overlayEl.dataset.mode;
    agregarTicketHistorial(pedido);
  };
}

function agregarTicketHistorial(pedido){
  const hist = document.getElementById("historial");
  if (!hist) return;
  const card = document.createElement("article");
  card.className = "ticket";
  const h4 = document.createElement("h4");
  h4.textContent = `Pedido #${pedido.id}`;
  const small = document.createElement("small");
  small.textContent = fechaCorta(pedido.fecha);
  const tabla = crearTabla(pedido.items);

  const pSub = document.createElement("p");
  const pImp = document.createElement("p");
  const pTot = document.createElement("p"); pTot.style.fontWeight = "bold";
  pSub.textContent = `Subtotal: ${money(pedido.totales.subtotal)}`;
  pImp.textContent = `Impuesto (13%): ${money(pedido.totales.impuesto)}${pedido.aplicarIVA ? "" : " (no aplicado)"}`;
  pTot.textContent = `Total: ${money(pedido.totales.total)}`;

  card.append(h4, small, tabla, pSub, pImp, pTot);
  hist.prepend(card);
}

function mostrarGracias(total) {
  notify("Pedido finalizado. ¡Gracias!", "success");
}

// ===== Confirmar / Finalizar =====
function confirmarCompra() {
  if (carrito.isEmpty()) { notify("El carrito está vacío.", "warn"); return; }

  const items = carrito.getItems();
  for (const item of items) {
    const prod = getProductoById(item.id);
    if (!prod) { notify(`Producto no encontrado: ${item.nombre ?? item.id}`, "warn"); return; }
    if (item.cantidad > prod.stock) {
      notify(`Stock insuficiente para "${prod.nombre}".`, "warn");
      return;
    }
  }

  ventaPendiente = items.map(i => ({ ...i }));
  closeCart();                 // cierra drawer
  mostrarFacturaModal(ventaPendiente); // abre modal centrado
  notify("Revisa tu factura. Aún no se descuenta stock.", "success");
}

function finalizarPedido(itemsFactura, aplicarIVA) {
  if (!itemsFactura || itemsFactura.length === 0) {
    notify("No hay pedido para finalizar.", "warn");
    return;
  }

  for (const it of itemsFactura) {
    const p = getProductoById(it.id);
    if (!p) { notify(`Producto no encontrado: ${it.nombre ?? it.id}`, "warn"); return; }
    if (it.cantidad > p.stock) {
      notify(`Stock insuficiente para "${p.nombre}".`, "warn");
      return;
    }
  }

  for (const it of itemsFactura) inventario.descontar(it.id, it.cantidad);
  for (const it of itemsFactura) carrito.removeQuantity(it.id, it.cantidad);

  renderProductos(inventario.all());
  renderCarrito();

  const totales = calcularTotales(itemsFactura, aplicarIVA);
  const pedido = {
    id: Math.floor(100000 + Math.random() * 900000),
    fecha: new Date(),
    items: itemsFactura.map(x => ({ ...x })),
    aplicarIVA,
    totales,
  };

  renderGraciasModal(pedido);
  notify("Pedido finalizado. ¡Gracias!", "success");
  ventaPendiente = null;
}
