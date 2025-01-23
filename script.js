// Inventory data
const inventory = [
  { name: "Laptop", status: "available" },
  { name: "Projector", status: "available" },
  { name: "HDMI Cable", status: "available" },
];

// Tab switching logic
document.getElementById("tracker-tab").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  switchTab("tracker-section", "tracker-tab");
});

document.getElementById("admin-tab").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  switchTab("admin-section", "admin-tab");
});

function switchTab(sectionId, tabId) {
  // Hide all sections
  document.querySelectorAll(".container > div").forEach((section) => {
    section.classList.add("hidden");
  });

  // Remove 'active' class from all tabs
  document.querySelectorAll("nav a").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show the selected section
  document.getElementById(sectionId).classList.remove("hidden");

  // Highlight the active tab
  document.getElementById(tabId).classList.add("active");
}

// Inventory form logic
document.getElementById("inventory-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const itemName = document.getElementById("item-name").value;
  const action = document.getElementById("action").value;

  const item = inventory.find((i) => i.name === itemName);
  if (item) {
    if (action === "check-out" && item.status === "available") {
      item.status = "checked-out";
    } else if (action === "check-in" && item.status === "checked-out") {
      item.status = "available";
    } else {
      alert(`Item is already ${item.status.replace("-", " ")}.`);
      return;
    }
  }
  updateTable();
});

// Admin form logic
document.getElementById("admin-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newItemName = document.getElementById("new-item-name").value.trim();
  if (newItemName && !inventory.some((i) => i.name === newItemName)) {
    inventory.push({ name: newItemName, status: "available" });
    alert(`Item "${newItemName}" added successfully.`);
    document.getElementById("new-item-name").value = "";
    updateDropdown();
    updateTable();
  } else {
    alert("Item already exists or invalid name.");
  }
});

// Populate dropdown and table
document.addEventListener("DOMContentLoaded", () => {
  updateDropdown();
  updateTable();
});

function updateDropdown() {
  const itemNameDropdown = document.getElementById("item-name");
  itemNameDropdown.innerHTML = "";
  inventory.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    itemNameDropdown.appendChild(option);
  });
}

function updateTable() {
  const inventoryTable = document.getElementById("inventory-table");
  inventoryTable.innerHTML = "";
  inventory.forEach((item) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    const statusCell = document.createElement("td");
    statusCell.textContent = item.status.replace("-", " ");
    statusCell.className = `status ${item.status}`;

    row.appendChild(nameCell);
    row.appendChild(statusCell);

    inventoryTable.appendChild(row);
  });
}
