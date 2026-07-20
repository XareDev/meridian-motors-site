// Meridian Motors — data + interactions

const CARS = [
  {
    id: "aurelia-gt", name: "Aurelia GT", tagline: "Luxury SUV",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80",
    priceDZD: 8450000, year: 2024,
    description: "A commanding presence with quiet interior refinement. The Aurelia GT blends spacious comfort with confident all-terrain capability, ideal for both city routes and long expeditions.",
    specs: { engine: "3.0L V6 Turbo", maxSpeed: "235 km/h", mileage: "12,400 km", tankSize: "80 L", drivetrain: "4WD", transmission: "8-speed automatic", seats: 7, fuel: "Petrol" }
  },
  {
    id: "rossa-coupe", name: "Rossa Coupé", tagline: "Sport Coupé",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    priceDZD: 11900000, year: 2024,
    description: "Track-tuned agility wrapped in a sculpted body. Every line of the Rossa serves aerodynamics — from the front splitter to the ducktail spoiler.",
    specs: { engine: "2.5L Boxer", maxSpeed: "268 km/h", mileage: "5,200 km", tankSize: "62 L", drivetrain: "2WD", transmission: "6-speed manual", seats: 4, fuel: "Petrol" }
  },
  {
    id: "meridian-s", name: "Meridian S", tagline: "Executive Sedan",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
    priceDZD: 6200000, year: 2023,
    description: "Effortless power and quiet composure. The Meridian S is engineered for those who value understated presence and long-distance comfort.",
    specs: { engine: "2.0L Turbo", maxSpeed: "245 km/h", mileage: "22,800 km", tankSize: "66 L", drivetrain: "AWD", transmission: "9-speed automatic", seats: 5, fuel: "Petrol" }
  },
  {
    id: "atlas-rx", name: "Atlas RX", tagline: "Utility Pickup",
    image: "https://images.unsplash.com/photo-1595758228888-70199ea24d5d?w=1200&q=80",
    priceDZD: 7150000, year: 2024,
    description: "Built for work and weekends. The Atlas RX pairs heavy-duty capability with a refined cabin, all-terrain tires, and a bed ready for anything.",
    specs: { engine: "3.5L V6 Diesel", maxSpeed: "195 km/h", mileage: "18,600 km", tankSize: "95 L", drivetrain: "4WD", transmission: "10-speed automatic", seats: 5, fuel: "Diesel" }
  },
  {
    id: "nova-city", name: "Nova City", tagline: "Urban Hatchback",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80",
    priceDZD: 3450000, year: 2023,
    description: "Compact, efficient, and easy on any street. The Nova City is a smart daily driver with modern comfort and impressive fuel economy.",
    specs: { engine: "1.4L Inline-4", maxSpeed: "180 km/h", mileage: "34,100 km", tankSize: "45 L", drivetrain: "2WD", transmission: "6-speed automatic", seats: 5, fuel: "Petrol" }
  },
  {
    id: "titan-4x", name: "Titan 4X", tagline: "Off-road SUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80",
    priceDZD: 9780000, year: 2024,
    description: "A serious off-roader with locking differentials and low-range gearing. Built for dunes, mountain trails, and everything between.",
    specs: { engine: "4.0L V8", maxSpeed: "210 km/h", mileage: "9,300 km", tankSize: "87 L", drivetrain: "4WD", transmission: "8-speed automatic", seats: 5, fuel: "Petrol" }
  }
];

const formatDZD = n => new Intl.NumberFormat("fr-DZ").format(n) + " DZD";

// SVG icons
const ICONS = {
  engine: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  speed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14 4 22"/><path d="M12 14a8 8 0 1 0-8-8"/><path d="M12 14a8 8 0 0 1 8-8"/></svg>',
  mileage: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
  tank: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
  drive: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
  gearbox: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  fuel: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
  seats: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  chevron: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

// ============ Card rendering ============
function renderCard(car) {
  return `
    <article class="card" data-car-id="${car.id}" tabindex="0" role="button" aria-label="View ${car.name} details">
      <div class="card-media">
        <img src="${car.image}" alt="${car.name}" loading="lazy" />
        <span class="tag">${car.tagline}</span>
      </div>
      <div class="card-body">
        <div class="card-row">
          <div>
            <div class="card-name">${car.name}</div>
            <div class="card-sub">${car.year} · ${car.specs.drivetrain}</div>
          </div>
          <div class="card-price">${formatDZD(car.priceDZD)}</div>
        </div>
        <button type="button" class="card-btn" data-details="${car.id}">
          <span>View details</span>
          ${ICONS.chevron}
        </button>
      </div>
    </article>
  `;
}

function renderCards(list, container) {
  container.innerHTML = list.map(renderCard).join("");
}

// ============ Modal ============
function specHTML(icon, label, value) {
  return `
    <div class="spec">
      ${icon}
      <div>
        <div class="spec-label">${label}</div>
        <div class="spec-value">${value}</div>
      </div>
    </div>
  `;
}

function openModal(car) {
  const backdrop = document.getElementById("modal-backdrop");
  const body = document.getElementById("modal-content");
  body.innerHTML = `
    <div class="modal-media">
      <img src="${car.image}" alt="${car.name}" />
    </div>
    <div class="modal-body">
      <div class="modal-head">
        <div>
          <div class="section-eyebrow">${car.tagline}</div>
          <h2>${car.name}</h2>
          <div class="sub">${car.year} · ${car.specs.drivetrain}</div>
        </div>
        <div class="modal-price">${formatDZD(car.priceDZD)}</div>
      </div>
      <p class="modal-desc">${car.description}</p>
      <div class="specs-grid">
        ${specHTML(ICONS.engine, "Engine", car.specs.engine)}
        ${specHTML(ICONS.speed, "Top speed", car.specs.maxSpeed)}
        ${specHTML(ICONS.mileage, "Mileage", car.specs.mileage)}
        ${specHTML(ICONS.tank, "Tank size", car.specs.tankSize)}
        ${specHTML(ICONS.drive, "Drivetrain", car.specs.drivetrain)}
        ${specHTML(ICONS.gearbox, "Transmission", car.specs.transmission)}
        ${specHTML(ICONS.fuel, "Fuel", car.specs.fuel)}
        ${specHTML(ICONS.seats, "Seats", car.specs.seats)}
      </div>
    </div>
  `;
  backdrop.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  backdrop.classList.remove("open");
  document.body.classList.remove("modal-open");
}

// ============ Event delegation ============
function initCardEvents(container) {
  container.addEventListener("click", (e) => {
    const card = e.target.closest("[data-car-id]");
    if (!card) return;
    const car = CARS.find(c => c.id === card.dataset.carId);
    if (car) openModal(car);
  });
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest("[data-car-id]");
    if (!card) return;
    e.preventDefault();
    const car = CARS.find(c => c.id === card.dataset.carId);
    if (car) openModal(car);
  });
}

function initModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (!backdrop) return;
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop || e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ============ Mobile nav ============
function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".mobile-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

// ============ Filters (showcase page) ============
function initFilters() {
  const chips = document.querySelectorAll(".chip");
  const grid = document.getElementById("cards");
  if (!chips.length || !grid) return;
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      const list = f === "All" ? CARS : CARS.filter(c => c.specs.drivetrain === f);
      renderCards(list, grid);
    });
  });
}

// ============ Contact form ============
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const card = document.getElementById("form-card");
    card.innerHTML = `
      <div class="form-success">
        <div>
          <div class="check">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Message sent</h3>
          <p>Thank you. We've received your message and will get back to you shortly.</p>
        </div>
      </div>
    `;
  });
}

// ============ Init ============
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initModal();

  const featured = document.getElementById("featured-cards");
  if (featured) {
    renderCards(CARS.slice(0, 3), featured);
    initCardEvents(featured);
  }
  const all = document.getElementById("cards");
  if (all) {
    renderCards(CARS, all);
    initCardEvents(all);
    initFilters();
  }
  initContactForm();
});
