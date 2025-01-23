// Sample inventory data
const inventory = [
  { name: "Laptop", status: "available" },
  { name: "Projector", status: "available" },
  { name: "HDMI Cable", status: "available" },
];

// Populate the dropdown and table on page load
document.addEventListener("DOMContentLoaded", () => {
  const itemNameDropdown = document.getElementById("item-name");
  const inventoryTable = document.getElementById("inventory-table");

  // Populate dropdown
  inventory.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    itemNameDropdown.appendChild(option);
  });

  // Populate table
  updateTable();
});

// Handle form submission
document.getElementById("inventory-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const itemName = document.getElementById("item-name").value;
  const action = document.getElementById("action").value;

  // Update inventory
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

  // Refresh the table
  updateTable();
});

// Update the table dynamically
function updateTable() {
  const inventoryTable = document.getElementById("inventory-table");
  inventoryTable.innerHTML = ""; // Clear the table

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
