// Simple in-memory inventory array
const inventory = [
  { name: "Laptop", status: "available" },
  { name: "Projector", status: "available" },
  { name: "HDMI Cable", status: "checked-out" },
];

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Cache element references
  const trackerTab = document.getElementById("tracker-tab");
  const adminTab = document.getElementById("admin-tab");
  const trackerSection = document.getElementById("tracker-section");
  const adminSection = document.getElementById("admin-section");

  // Populate initial UI
  updateDropdown();
  updateTable();

  // Tab Click Handlers
  trackerTab.addEventListener("click", (e) => {
    e.preventDefault();
    // Show tracker section
    trackerSection.classList.remove("hidden");
    // Hide admin section
    adminSection.classList.add("hidden");

    // Update active tab styling
    trackerTab.classList.add("active");
    adminTab.classList.remove("active");
  });

  adminTab.addEventListener("click", (e) => {
    e.preventDefault();
    // Show admin section
    adminSection.classList.remove("hidden");
    // Hide tracker section
    trackerSection.classList.add("hidden");

    // Update active tab styling
    adminTab.classList.add("active");
    trackerTab.classList.remove("active");
  });

  // Handle Inventory Form submission
  document.getElementById("inventory-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const itemName = document.getElementById("item-name").value;
    const action = document.getElementById("action").value;

    const item = inventory.find((i) => i.name === itemName);
    if (!item) return;

    if (action === "check-out" && item.status === "available") {
      item.status = "checked-out";
    } else if (action === "check-in" && item.status === "checked-out") {
      item.status = "available";
    } else {
      alert(`Item is already ${item.status.replace("-", " ")}!`);
      return;
    }

    updateTable();
  });

  // Handle Admin Form submission
  document.getElementById("admin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const newItemName = document.getElementById("new-item-name").value.trim();
    if (!newItemName) return;

    // Check if item already exists
    if (inventory.some((i) => i.name.toLowerCase() === newItemName.toLowerCase())) {
      alert("Item already exists.");
      return;
    }

    inventory.push({ name: newItemName, status: "available" });
    alert(`Item "${newItemName}" added successfully!`);
    document.getElementById("new-item-name").value = "";

    updateDropdown();
    updateTable();
  });
});

// Populate the dropdown
function updateDropdown() {
  const dropdown = document.getElementById("item-name");
  dropdown.innerHTML = ""; // clear existing

  inventory.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

// Update the table display
function updateTable() {
  const tableBody = document.getElementById("inventory-table");
  tableBody.innerHTML = ""; // clear existing

  inventory.forEach((item) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = item.name;

    const statusTd = document.createElement("td");
    statusTd.textContent = item.status.replace("-", " ");
    statusTd.classList.add("status", item.status);

    tr.appendChild(nameTd);
    tr.appendChild(statusTd);
    tableBody.appendChild(tr);
  });
}
