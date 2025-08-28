// Inventario (ejemplo)
const productos = [
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

// Utilidades de dinero e impuestos
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

// Carrito
const carritoData = [];
const contenedor = document.getElementById("lista-productos");

function getProductoById(id) {
  return productos.find(p => p.id === id);
}

function incrementarItem(id) {
  const item = carritoData.find(i => i.id === id);
  if (!item) return;
  const prod = getProductoById(id);
  item.cantidad = Math.min(item.cantidad + 1, prod.stock);
  renderCarrito();
}

function decrementarItem(id) {
  const idx = carritoData.findIndex(i => i.id === id);
  if (idx === -1) return;
  const item = carritoData[idx];
  item.cantidad = Math.max(item.cantidad - 1, 0);
  if (item.cantidad === 0) carritoData.splice(idx, 1);
  renderCarrito();
}

function eliminarItem(id) {
  const idx = carritoData.findIndex(i => i.id === id);
  if (idx !== -1) carritoData.splice(idx, 1);
  renderCarrito();
}

function vaciarCarrito() {
  carritoData.length = 0;
  renderCarrito();
}

// Catálogo
function crearTarjetaProducto(producto) {
  const card = document.createElement("article");
  card.className = "producto";

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
  input.value = 1;
  input.addEventListener("input", () => {
    let v = parseInt(input.value, 10) || 1;
    v = Math.max(1, Math.min(v, producto.stock));
    input.value = v;
  });

  const btn = document.createElement("button");
  btn.textContent = "Agregar";
  btn.addEventListener("click", () => {
    const qty = parseInt(input.value, 10) || 0;
    if (qty > producto.stock) {
      alert(`Máximo disponible: ${producto.stock}`);
      input.value = producto.stock;
      return;
    }
    if (qty >= 1 && qty <= producto.stock) agregarAlCarrito(producto, qty);
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
renderProductos(productos);

// Carrito (UI)
function agregarAlCarrito(producto, cantidad) {
  const qty = parseInt(cantidad, 10) || 0;
  if (qty < 1) return;

  const existente = carritoData.find(i => i.id === producto.id);
  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + qty, producto.stock);
  } else {
    carritoData.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: Math.min(qty, producto.stock),
    });
  }
  renderCarrito();
}

function renderCarrito() {
  const panel = document.getElementById("carrito");
  panel.textContent = "";

  const h3 = document.createElement("h3");
  h3.textContent = "Tu carrito";
  panel.appendChild(h3);

  if (carritoData.length === 0) {
    const p = document.createElement("p");
    p.textContent = "El carrito está vacío.";
    panel.appendChild(p);
    return;
  }

  const lista = document.createElement("ul");
  let totalGeneral = 0;

  carritoData.forEach(item => {
    const prod = getProductoById(item.id);
    const subtotal = item.precio * item.cantidad;
    totalGeneral += subtotal;
    const restante = prod.stock - item.cantidad;

    const li = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = `${item.nombre} — x${item.cantidad} — ${money(item.precio)} — Subtotal: ${money(subtotal)}`;

    const controles = document.createElement("div");
    controles.style.display = "inline-flex";
    controles.style.gap = ".5rem";
    controles.style.marginLeft = ".75rem";

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "−";
    btnMenos.title = "Restar 1";
    btnMenos.disabled = item.cantidad <= 1; // UX sugerida
    btnMenos.addEventListener("click", () => decrementarItem(item.id));

    const btnMas = document.createElement("button");
    btnMas.textContent = "+";
    btnMas.title = "Sumar 1";
    btnMas.disabled = item.cantidad >= prod.stock;
    btnMas.addEventListener("click", () => incrementarItem(item.id));

    const btnEliminar = document.createElement("button");
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
  btnConfirmar.textContent = "Confirmar compra";
  btnConfirmar.addEventListener("click", confirmarCompra);

  const btnVaciar = document.createElement("button");
  btnVaciar.textContent = "Vaciar carrito";
  btnVaciar.addEventListener("click", vaciarCarrito);

  panel.append(lista, pTotal, btnConfirmar, btnVaciar);
}
renderCarrito();

// Factura (IVA opcional)
function mostrarFactura(items) {
  const seccion = document.getElementById("factura");
  seccion.textContent = "";
  seccion.hidden = false;

  const h3 = document.createElement("h3");
  h3.textContent = "Factura";
  seccion.appendChild(h3);

  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Producto", "Cantidad", "Precio", "Subtotal"].forEach(txt => {
    const th = document.createElement("th");
    th.textContent = txt;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  const copia = items.map(it => ({ ...it }));
  for (const it of copia) {
    const tr = document.createElement("tr");
    const tdProd = document.createElement("td");  tdProd.textContent = it.nombre;
    const tdCant = document.createElement("td");  tdCant.textContent = it.cantidad;
    const tdPrecio = document.createElement("td");tdPrecio.textContent = money(Number(it.precio));
    const tdSubtotal = document.createElement("td");
    tdSubtotal.textContent = money(Number(it.precio) * Number(it.cantidad));
    tr.append(tdProd, tdCant, tdPrecio, tdSubtotal);
    tbody.appendChild(tr);
  }
  tabla.appendChild(tbody);
  seccion.appendChild(tabla);

  // Checkbox IVA
  const ivaWrap = document.createElement("label");
  ivaWrap.style.display = "inline-flex";
  ivaWrap.style.alignItems = "center";
  ivaWrap.style.gap = ".4rem";
  const ivaChk = document.createElement("input");
  ivaChk.type = "checkbox";
  ivaChk.id = "aplicarIVA";
  ivaWrap.append(ivaChk, document.createTextNode("Aplicar IVA (13%)"));
  seccion.appendChild(ivaWrap);

  const pSub = document.createElement("p");
  const pImp = document.createElement("p");
  const pTot = document.createElement("p");
  pTot.style.fontWeight = "bold";
  seccion.append(pSub, pImp, pTot);

  function renderTotales() {
    const { subtotal, impuesto, total } = calcularTotales(copia, ivaChk.checked);
    pSub.textContent = `Subtotal: ${money(subtotal)}`;
    pImp.textContent = `Impuesto (13%): ${money(impuesto)}`;
    pTot.textContent = `Total: ${money(total)}`;
  }
  ivaChk.addEventListener("change", renderTotales);
  renderTotales();

  const btnSeguir = document.createElement("button");
  btnSeguir.textContent = "Seguir comprando";
  btnSeguir.addEventListener("click", () => { seccion.hidden = true; });
  seccion.appendChild(btnSeguir);
}

// Confirmar compra
function confirmarCompra() {
  if (carritoData.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  for (const item of carritoData) {
    const prod = getProductoById(item.id);
    if (!prod) { alert(`Producto no encontrado: ${item.nombre ?? item.id}`); return; }
    if (item.cantidad > prod.stock) {
      alert(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}. Pedido: ${item.cantidad}.`);
      return;
    }
  }
  const venta = carritoData.map(i => ({ ...i }));
  for (const i of carritoData) {
    const p = getProductoById(i.id);
    p.stock = p.stock - i.cantidad;
  }
  carritoData.length = 0;
  renderProductos(productos);
  renderCarrito();
  mostrarFactura(venta);
}
