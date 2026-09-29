const CLEANING_TYPES = {
  maintenance: {
    label: "Поддерживающая",
    rate: 90,
    minPrice: 3500,
    speed: 22,
    minHours: 2
  },
  deep: {
    label: "Генеральная",
    rate: 150,
    minPrice: 6500,
    speed: 14,
    minHours: 4
  },
  renovation: {
    label: "После ремонта",
    rate: 190,
    minPrice: 9000,
    speed: 10,
    minHours: 5
  }
};

const EXTRA_SERVICES = {
  windows: { label: "Окна", price: 1800, hours: 1.5 },
  furniture: { label: "Химчистка мебели", price: 3200, hours: 2 },
  carpets: { label: "Ковры", price: 1500, hours: 1 },
  bathroom: { label: "Сантехника", price: 1200, hours: 1 },
  kitchen: { label: "Кухня", price: 1800, hours: 1.5 }
};

const areaInput = document.querySelector("#area");
const areaHint = document.querySelector("#area-hint");
const calculatorForm = document.querySelector("#calculator-form");
const resultPrice = document.querySelector("#result-price");
const resultTime = document.querySelector("#result-time");
const resultNote = document.querySelector("#result-note");
const selectedSummary = document.querySelector("#selected-summary");
const leadForm = document.querySelector("#lead-form");
const formStatus = document.querySelector("#form-status");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

function roundToHundreds(value) {
  return Math.ceil(value / 100) * 100;
}

function roundToHalfHour(value) {
  return Math.ceil(value * 2) / 2;
}

function normalizeArea(rawValue) {
  const parsed = Number.parseFloat(rawValue);

  if (!Number.isFinite(parsed)) {
    return {
      area: 10,
      message: "Введите площадь. Пока считаем по минимальному значению 10 м²."
    };
  }

  if (parsed < 10) {
    return {
      area: 10,
      message: "Для маленькой площади применён минимальный расчёт 10 м²."
    };
  }

  if (parsed > 300) {
    return {
      area: 300,
      message: "Для учебного demo расчёт ограничен 300 м²."
    };
  }

  return {
    area: parsed,
    message: "Для расчёта используется диапазон от 10 до 300 м²."
  };
}

function calculateCleaning(rawArea, cleaningType, extras) {
  const normalized = normalizeArea(rawArea);
  const tariff = CLEANING_TYPES[cleaningType] || CLEANING_TYPES.maintenance;
  const selectedExtras = extras
    .map((extra) => EXTRA_SERVICES[extra])
    .filter(Boolean);

  const basePrice = Math.max(normalized.area * tariff.rate, tariff.minPrice);
  const extraPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const baseHours = Math.max(normalized.area / tariff.speed, tariff.minHours);
  const extraHours = selectedExtras.reduce((sum, extra) => sum + extra.hours, 0);

  return {
    area: normalized.area,
    areaMessage: normalized.message,
    typeLabel: tariff.label,
    extras: selectedExtras.map((extra) => extra.label),
    price: roundToHundreds(basePrice + extraPrice),
    hours: roundToHalfHour(baseHours + extraHours)
  };
}

function getCalculatorState() {
  const selectedType = calculatorForm.elements.cleaningType.value;
  const extras = [...calculatorForm.querySelectorAll('input[name="extras"]:checked')]
    .map((input) => input.value);

  return calculateCleaning(areaInput.value, selectedType, extras);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatHours(value) {
  return Number.isInteger(value) ? `${value} ч` : `${value.toString().replace(".", ",")} ч`;
}

function renderCalculation() {
  const calculation = getCalculatorState();
  const extrasText = calculation.extras.length
    ? calculation.extras.join(", ")
    : "без допуслуг";

  resultPrice.textContent = `от ${formatCurrency(calculation.price)} ₽`;
  resultTime.textContent = `Примерное время: ${formatHours(calculation.hours)}`;
  resultNote.textContent = "Точная цена зависит от состояния квартиры, загрязнения, мебели, доступа и срочности.";
  selectedSummary.textContent = `${calculation.area} м², ${calculation.typeLabel.toLowerCase()}, ${extrasText}.`;
  areaHint.textContent = calculation.areaMessage;
  areaHint.classList.toggle("is-warning", calculation.area !== Number.parseFloat(areaInput.value));

  return calculation;
}

function setError(fieldName, message) {
  const error = document.querySelector(`#${fieldName}-error`);
  const field = document.querySelector(`#${fieldName}`);

  error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateLeadForm() {
  const name = leadForm.elements.name.value.trim();
  const phone = leadForm.elements.phone.value.trim();
  const comment = leadForm.elements.comment.value.trim();
  let isValid = true;

  setError("name", "");
  setError("phone", "");
  setError("comment", "");

  if (name.length < 2) {
    setError("name", "Укажите имя, минимум 2 символа.");
    isValid = false;
  }

  if (phone.replace(/\D/g, "").length < 10) {
    setError("phone", "Укажите телефон, чтобы в реальном проекте менеджер мог связаться.");
    isValid = false;
  }

  if (comment.length === 0) {
    setError("comment", "Напишите удобный день или короткий комментарий.");
    isValid = false;
  }

  return isValid;
}

function handleLeadSubmit(event) {
  event.preventDefault();
  formStatus.textContent = "";

  if (!validateLeadForm()) {
    formStatus.textContent = "Проверьте поля формы.";
    return;
  }

  renderCalculation();
  formStatus.textContent = "Спасибо. Заявка принята в demo-режиме. В реальном проекте здесь была бы отправка менеджеру.";
}

function closeMenu() {
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  const isOpen = siteNav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

calculatorForm.addEventListener("input", renderCalculation);
leadForm.addEventListener("submit", handleLeadSubmit);
menuToggle.addEventListener("click", toggleMenu);
siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

renderCalculation();
