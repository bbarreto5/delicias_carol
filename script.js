const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  mainNav?.classList.toggle("is-open", !isOpen);
});

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menú");
  mainNav?.classList.remove("is-open");
};

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav?.classList.contains("is-open")) {
    closeMenu();
    menuToggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!mainNav?.classList.contains("is-open")) return;
  if (!mainNav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
});

// Toda la tarjeta lleva al pedido; el enlace real sigue siendo el que usa el teclado.
document.querySelectorAll("[data-card-link]").forEach((card) => {
  const link = card.querySelector("a[href]");
  if (!link) return;
  card.addEventListener("click", (event) => {
    if (event.target.closest("a") || window.getSelection()?.toString()) return;
    link.click();
  });
});

const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((item) => {
  const delay = Number(item.dataset.delay || 0);
  item.style.setProperty("--delay", `${delay}ms`);
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (supportsFinePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const tiltX = (0.5 - y) * 5;
      const tiltY = (x - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

const deliveryZones = document.querySelectorAll(".delivery-map__zone");
const deliveryStatus = document.querySelector("#delivery-zone-status");
const deliveryCta = document.querySelector("#delivery-cta");
let selectedDeliveryZone = "";

const defaultDeliveryMessage = "Elige una zona para consultar cobertura. El domicilio varía según dirección, cantidad y horario.";
const updateDeliveryPreview = (zoneName = "") => {
  if (!deliveryStatus) return;
  deliveryStatus.textContent = zoneName
    ? `Cobertura en ${zoneName}. Confírmanos tu dirección y te cotizamos el domicilio según cantidad y horario.`
    : defaultDeliveryMessage;
};

const selectDeliveryZone = (zone) => {
  selectedDeliveryZone = zone.dataset.zone || "";
  deliveryZones.forEach((item) => {
    const isSelected = item === zone;
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-pressed", String(isSelected));
  });
  updateDeliveryPreview(selectedDeliveryZone);
  if (deliveryCta && selectedDeliveryZone) {
    const message = `Hola, quisiera cotizar un domicilio en ${selectedDeliveryZone}. Mi dirección es:`;
    deliveryCta.href = `https://wa.me/573024669960?text=${encodeURIComponent(message)}`;
  }
};

deliveryZones.forEach((zone) => {
  zone.addEventListener("pointerenter", () => updateDeliveryPreview(zone.dataset.zone));
  zone.addEventListener("pointerleave", () => updateDeliveryPreview(selectedDeliveryZone));
  zone.addEventListener("focus", () => updateDeliveryPreview(zone.dataset.zone));
  zone.addEventListener("blur", () => updateDeliveryPreview(selectedDeliveryZone));
  zone.addEventListener("click", () => selectDeliveryZone(zone));
  zone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDeliveryZone(zone);
    }
  });
});
