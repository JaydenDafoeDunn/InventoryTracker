// Sample inventory data
const inventory = [
  { name: "Laptop", status: "available" },
  { name: "Projector", status: "available" },
  { name: "HDMI Cable", status: "available" },
];

// Switch between tabs
document.getElementById("tracker-tab").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  showSection("tracker-section", "tracker-tab");
});

document.getElementById("admin-tab").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  showSection("admin-section", "admin-tab");
});

// Function to show the appropriate section and highlight the active tab
function showSection(sectionId, tabId) {
  // Hide all sections
  document.getElementById("tracker-section").classList.add("hidden");
  document.getElementById("admin-section").classList.add("hidden");

  // Remove 'active' class from all tabs
  document.getElementById("tracker-tab").classList.remove("active");
  document.getElementById("admin-tab").classList.remove("active");

  // Show the selected section
  document.getElementById(sectionId).classList.remove("hidden");

  // Highlight the active tab
  document.getElementById(tabId).classList.add("active");
}

// Populate the dropdown and table on page load
document.addEventListener("DOMContentLoaded", () => {
  updateDropdown();
  updateTable();
});

// Handle inventory form submission
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
      alert(`Item is already ${item.status.replace("-", " ")}!`);
      return;
    }
  }

  updateTable();
});

// Handle admin form submission
document.getElementById("admin-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const newItemName = document.getElementById("new-item-name").value.trim();
  if (newItemName && !inventory.some((i) => i.name === newItemName)) {
    inventory.push({ name: newItemName, status: "available" });
    alert(`Item "${newItemName}" added successfully!`);
    document.getElementById("new-item-name").value = "";
    updateDropdown();
    updateTable();
  } else {
    alert("Item already exists or invalid name.");
  }
});

// Update the dropdown dynamically
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

// Update the table dynamically
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
