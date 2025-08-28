// ============================================================
//  Inventario (datos de ejemplo)
//  Cada producto: { id, nombre, precio, stock }
// ============================================================
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

console.log("Inventario cargado:", productos);

// ============================================================
//  Carrito en memoria
//  Nota: evitamos llamar a la variable 'carrito' porque existe
//  <aside id="carrito"> en el HTML y puede chocar con el nombre.
//  Estructura de cada item: { id, nombre, precio, cantidad }
// ============================================================
const carritoData = [];

// ============================================================
//  UTILIDADES para trabajar con productos y carrito
// ============================================================

/** Devuelve el producto completo del inventario por id. */
function getProductoById(id) {
  return productos.find(p => p.id === id);
}

/** Suma 1 unidad al item del carrito sin pasarse del stock. */
function incrementarItem(id) {
  const item = carritoData.find(i => i.id === id);
  if (!item) return;
  const prod = getProductoById(id);
  item.cantidad = Math.min(item.cantidad + 1, prod.stock);
  renderCarrito();
}

/** Resta 1 unidad; si queda en 0, quita el item del carrito. */
function decrementarItem(id) {
  const idx = carritoData.findIndex(i => i.id === id);
  if (idx === -1) return;
  const item = carritoData[idx];
  item.cantidad = Math.max(item.cantidad - 1, 0);
  if (item.cantidad === 0) {
    carritoData.splice(idx, 1);
  }
  renderCarrito();
}

/** Elimina por completo un item del carrito. */
function eliminarItem(id) {
  const idx = carritoData.findIndex(i => i.id === id);
  if (idx !== -1) {
    carritoData.splice(idx, 1);
  }
  renderCarrito();
}

/** Vacía el carrito. */
function vaciarCarrito() {
  carritoData.length = 0;
  renderCarrito();
}

// ============================================================
//  Render de tarjetas de productos (catálogo)
// ============================================================
const contenedor = document.getElementById("lista-productos");

/**
 * Crea el HTML de una tarjeta de producto.
 * Muestra: nombre, precio, stock, input de cantidad y botón "Agregar".
 */
function crearTarjetaProducto(producto) {
  const card = document.createElement("article");
  card.className = "producto";

  const h3 = document.createElement("h3");
  h3.textContent = producto.nombre;

  const pPrecio = document.createElement("p");
  pPrecio.textContent = `Precio: $${producto.precio.toFixed(2)}`;

  const pStock = document.createElement("p");
  pStock.textContent = `Stock: ${producto.stock}`;

  // Campo para que el usuario elija cuántas unidades quiere
  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = producto.stock;
  input.value = 1;

  // Botón para agregar al carrito
  const btn = document.createElement("button");
  btn.textContent = "Agregar";

  // Al clickear: leemos y validamos la cantidad, y agregamos al carrito
  btn.addEventListener("click", () => {
    const qty = parseInt(input.value, 10) || 0;
    if (qty >= 1 && qty <= producto.stock) {
      agregarAlCarrito(producto, qty);
    } else {
      console.warn("Cantidad inválida:", qty);
    }
  });

  // Armado de la tarjeta
  card.appendChild(h3);
  card.appendChild(pPrecio);
  card.appendChild(pStock);
  card.appendChild(input);
  card.appendChild(btn);

  return card;
}

/** Inserta todas las tarjetas en el contenedor del catálogo. */
function renderProductos(lista) {
  contenedor.textContent = ""; // limpiar cualquier render previo
  for (const prod of lista) {
    const tarjeta = crearTarjetaProducto(prod);
    contenedor.appendChild(tarjeta);
  }
}

// Primer render del catálogo
renderProductos(productos);

// ============================================================
//  Lógica para agregar al carrito (acumula cantidades con tope)
// ============================================================

/**
 * Agrega un producto al carrito con la cantidad indicada.
 * Si ya existe, acumula; nunca supera el stock disponible.
 */
function agregarAlCarrito(producto, cantidad) {
  const qty = parseInt(cantidad, 10) || 0;
  if (qty < 1) {
    console.warn("Cantidad inválida, debe ser >= 1");
    return;
  }

  const existente = carritoData.find(i => i.id === producto.id);

  if (existente) {
    const sumada = existente.cantidad + qty;
    // Math.min evita superar el stock del producto
    existente.cantidad = Math.min(sumada, producto.stock);
  } else {
    carritoData.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      // Si piden más que el stock, se limita al tope.
      cantidad: Math.min(qty, producto.stock),
    });
  }

  console.log("carrito:", carritoData);
  renderCarrito(); // cada cambio en datos del carrito actualiza la vista
}

// ============================================================
//  Render del carrito en el <aside id="carrito">
//  Muestra: nombre, xCantidad, precio, subtotal; y total general.
//  Incluye controles +/−, eliminar y vaciar.
// ============================================================
function renderCarrito() {
  const panel = document.getElementById("carrito");
  panel.textContent = ""; // limpiar contenido anterior

  // Encabezado (opcional para dar contexto)
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

    // Texto informativo del item
    const texto = document.createElement("span");
    texto.textContent = `${item.nombre} — x${item.cantidad} — $${item.precio.toFixed(2)} — Subtotal: $${subtotal.toFixed(2)}`;

    // Controles del item
    const controles = document.createElement("div");
    controles.style.display = "inline-flex";
    controles.style.gap = ".5rem";
    controles.style.marginLeft = ".75rem";

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "−";
    btnMenos.title = "Restar 1";
    // Si hay 1 unidad, permitimos restar; si llega a 0, se elimina el item.
    btnMenos.disabled = item.cantidad <= 0; // se habilita mientras haya algo
    btnMenos.addEventListener("click", () => decrementarItem(item.id));

    const btnMas = document.createElement("button");
    btnMas.textContent = "+";
    btnMas.title = "Sumar 1";
    // Deshabilitamos si ya está al tope de stock
    btnMas.disabled = item.cantidad >= prod.stock;
    btnMas.addEventListener("click", () => incrementarItem(item.id));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.title = "Quitar del carrito";
    btnEliminar.addEventListener("click", () => eliminarItem(item.id));

    const infoRestante = document.createElement("small");
    infoRestante.textContent = `Quedan ${restante} en stock`;

    controles.appendChild(btnMenos);
    controles.appendChild(btnMas);
    controles.appendChild(btnEliminar);
    controles.appendChild(infoRestante);

    li.appendChild(texto);
    li.appendChild(controles);
    lista.appendChild(li);
  });

  // Total general del carrito
  const pTotal = document.createElement("p");
  pTotal.style.fontWeight = "bold";
  pTotal.textContent = `Total: $${totalGeneral.toFixed(2)}`;

  // Botón para vaciar todo el carrito
  const btnVaciar = document.createElement("button");
  btnVaciar.textContent = "Vaciar carrito";
  btnVaciar.addEventListener("click", vaciarCarrito);

  panel.appendChild(lista);
  panel.appendChild(pTotal);
  panel.appendChild(btnVaciar);
}

// Estado inicial del aside (muestra "El carrito está vacío.")
renderCarrito();
