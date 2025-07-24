// When the page loads, set up everything
document.addEventListener("DOMContentLoaded", function () {
  updateDate();
});

// Update the date in the header
function updateDate() {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[now.getDay()];

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;

  document.getElementById("currentDay").textContent = dayName;
  document.getElementById("currentDate").textContent = formattedDate;
}

// Global data storage for meal plans
let mealData = {};
let currentDate = new Date();

// Initialize meal data structure for a date
function initializeMealData(dateStr) {
  if (!mealData[dateStr]) {
    mealData[dateStr] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }
}

// Get formatted date string for storage key || ISO String EX: 025-06-12T14:23:45.678Z
function getDateString(date) {
  return date.toISOString().split("T")[0];
}

// Get formatted display date
function getDisplayDate(date) {
  const options = { weekday: "long", month: "long", day: "numeric" }; // short would mean that the abbreiviated version
  return date.toLocaleDateString("en-US", options);
}

// Add meal to specific meal type and date
function addMeal(mealType, mealText, date = currentDate) {
  const dateStr = getDateString(date);
  initializeMealData(dateStr);

  const meal = {
    id: Date.now() + Math.random(), // allows duplicate names to have thier own unique id
    text: mealText.trim(),
    timestamp: new Date().toISOString(),
  };

  mealData[dateStr][mealType].push(meal);
  renderMealSection(mealType, dateStr);
}

// Remove meal by ID from specific meal type
function removeMeal(mealType, mealID, date = currentDate) {
  const dateStr = getDateString(date);
  if (mealData[dateStr] && mealData[dateStr][mealType]) {
    mealData[dateStr][mealType] = mealData[dateStr][mealType].filter(
      (meal) => meal.id !== mealID
    );
    renderMealSection(mealType, dateStr);
  }
}

// Create meal item DOM element
function createMealItemElement(meal, mealType) {
  const mealItem = document.createElement("div");
  mealItem.className = "meal__item";
  mealItem.innerHTML = `
        <span class="meal__item--text">${meal.text}</span>
        <button class="meal__item--delete" onclick="removeMeal('${mealType}', ${meal.id})">×</button>
    `;
  return mealItem;
}

// Render specific meal section with current data
function renderMealSection(mealType, dateStr) {
  const container = document.getElementById(`${mealType}__items`);
  const meals = mealData[dateStr] ? mealData[dateStr][mealType] || [] : [];

  container.innerHTML = "";

  if (meals.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "meal__item--placeholder";
    placeholder.innerHTML = `<span>No ${
      mealType === "snacks" ? "snacks" : "meals"
    } planned</span>`;
    container.appendChild(placeholder);
  } else {
    meals.forEach((meal) => {
      container.appendChild(createMealItemElement(meal, mealType));
    });
  }
}

// Render all meal sections for current date
function renderAllMealSections() {
  const dateStr = getDateString(currentDate);
  initializeMealData(dateStr);

  ["breakfast", "lunch", "dinner", "snacks"].forEach((mealType) => {
    renderMealSection(mealType, dateStr);
  });
}

// Clear all meals for current date
function clearAllMeals() {
  const dateStr = getDateString(currentDate);
  if (mealData[dateStr]) {
    Object.keys(mealData[dateStr]).forEach((mealType) => {
      mealData[dateStr][mealType] = [];
    });
    renderAllMealSections();
  }
}
// Update date display in the UI
function updateDateDisplay() {
  const selectedDateElement = document.getElementById("selected__date");
  if (selectedDateElement) {
    selectedDateElement.textContent = getDisplayDate(currentDate);
  }
}

// Navigate to the previous day
function goToPreviousDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
  renderAllMealSections();
}

// Navigate to next day
function goToNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
  renderAllMealSections();
}

// Handle quick add form submission
function handleQuickAdd() {
  const input = document.getElementById("quick__meal--input");
  const select = document.getElementById("quick__meal--type");

  const mealText = input.value.trim();
  const mealType = select.value;

  if (mealText) {
    addMeal(mealType, mealText);
    input.value = "";
    showNotification(`Added "${mealText}" to ${mealType}`);
  }
}

// Show notification message
function showNotification(message) {
  // Create temporary notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgb(89, 82, 209);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Handle add meal button clicks
function handleAddMealClick(mealType) {
  const mealText = prompt(`Enter ${mealType} item:`);
  if (mealText && mealText.trim()) {
    addMeal(mealType, mealText.trim());
    showNotification(`Added to ${mealType}!`);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Day navigation buttons
  const prevButton = document.getElementById("prev__day");
  const nextButton = document.getElementById("next__day");

  if (prevButton) prevButton.addEventListener("click", goToPreviousDay);
  if (nextButton) nextButton.addEventListener("click", goToNextDay);

  // Quick add form
  const quickAddBtn = document.getElementById("quick__add--btn");
  const quickInput = document.getElementById("quick__meal--input");

  if (quickAddBtn) quickAddBtn.addEventListener("click", handleQuickAdd);
  if (quickInput) {
    quickInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleQuickAdd();
      }
    });
  }

  // Add meal buttons
  document.querySelectorAll(".add__meal--btn").forEach((button) => {
    const mealType = button.getAttribute("data__meal");
    button.addEventListener("click", () => handleAddMealClick(mealType));
    console.log("Hello");
  });
}

// Initialize keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    // Arrow keys for date navigation
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPreviousDay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNextDay();
    }
    // Focus quick add input with 'A' key
    else if (e.key === "a" || e.key === "A") {
      if (e.target.tagName !== "INPUT") {
        e.preventDefault();
        const quickInput = document.getElementById("quick__meal--input");
        if (quickInput) quickInput.focus();
      }
    }
  });
}

// Auto-save data to localStorage
function saveDataToStorage() {
  try {
    localStorage.setItem("mealPlannerData", JSON.stringify(mealData));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// Load data from localStorage
function loadDataFromStorage() {
  try {
    const saved = localStorage.getItem("mealPlannerData");
    if (saved) {
      mealData = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
    mealData = {};
  }
}

// Initialize the application
function initializeApp() {
  loadDataFromStorage();
  updateDateDisplay();
  renderAllMealSections();
  setupEventListeners();
  setupKeyboardShortcuts();

  // Auto-save every 30 seconds
  setInterval(saveDataToStorage, 30000);

  // Save on page unload
  window.addEventListener("beforeunload", saveDataToStorage);
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
