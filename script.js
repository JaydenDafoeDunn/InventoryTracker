// The 'inventory' array will be loaded from "inventory.json".
let inventory = [];

// An array to store log entries, if you want to track changes:
let inventoryLog = [];

// When the DOM loads, fetch the JSON first, then initialize the rest
document.addEventListener("DOMContentLoaded", () => {
  loadInventoryFromJSON()
    .then(() => {
      // Now that 'inventory' is loaded, set up everything else:
      setupTabs();
      setupForms();
      // Initial UI updates
      updateTable();
      updateDropdowns();
      // Show the "Check In/Out" tab by default (or "inventory" if you prefer)
      showTab("checkio");
    })
    .catch((error) => {
      console.error("Error loading inventory:", error);
      // We can still continue with an empty 'inventory' if needed
      setupTabs();
      setupForms();
    });
});

/**
 * Fetch the inventory data from "inventory.json" and store it in the 'inventory' array.
 */
function loadInventoryFromJSON() {
  return fetch("inventory.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // 'data' should be an array of { name, status }
      inventory = data;
    });
}

/**
 * Setup event listeners for the nav tabs: Inventory, Admin, Check In/Out.
 */
function setupTabs() {
  const tabInventory = document.getElementById("show-inventory");
  const tabAdmin = document.getElementById("show-admin");
  const tabCheckIO = document.getElementById("show-checkio");

  if (tabInventory) {
    tabInventory.addEventListener("click", (e) => {
      e.preventDefault();
      showTab("inventory");
    });
  }
  if (tabAdmin) {
    tabAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      showTab("admin");
    });
  }
  if (tabCheckIO) {
    tabCheckIO.addEventListener("click", (e) => {
      e.preventDefault();
      showTab("checkio");
    });
  }
}

/**
 * Setup event listeners for forms:
 *  - Add Item
 *  - Remove Item
 *  - Check In/Out
 */
function setupForms() {
  // Add Item form
  const addItemForm = document.getElementById("add-item-form");
  if (addItemForm) {
    addItemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newItemName = document
        .getElementById("new-item-name")
        .value.trim();

      if (newItemName) {
        // Check if item already exists
        const existing = inventory.find(
          (i) => i.name.toLowerCase() === newItemName.toLowerCase()
        );
        if (existing) {
          alert("Item already exists.");
        } else {
          // Add new item
          inventory.push({ name: newItemName, status: "available" });
          logInventoryChange("Added", newItemName);
          alert(`"${newItemName}" added!`);
          // Clear input
          document.getElementById("new-item-name").value = "";
          // Update UI
          updateTable();
          updateDropdowns();
        }
      }
    });
  }

  // Remove Item form
  const removeItemForm = document.getElementById("remove-item-form");
  if (removeItemForm) {
    removeItemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const removeName = document.getElementById("remove-item-name").value;
      if (!removeName) return;

      const index = inventory.findIndex((i) => i.name === removeName);
      if (index === -1) {
        alert("Item not found.");
      } else {
        inventory.splice(index, 1);
        logInventoryChange("Removed", removeName);
        alert(`"${removeName}" removed.`);
        updateTable();
        updateDropdowns();
      }
    });
  }

  // Check In/Out buttons
  const btnCheckIn = document.getElementById("btn-checkin");
  const btnCheckOut = document.getElementById("btn-checkout");

  if (btnCheckIn) {
    btnCheckIn.addEventListener("click", checkInItem);
  }
  if (btnCheckOut) {
    btnCheckOut.addEventListener("click", checkOutItem);
  }
}

/**
 * Toggle which tab/section is visible: "inventory", "admin", or "checkio".
 */
function showTab(tabName) {
  const inventorySection = document.getElementById("inventory-section");
  const adminSection = document.getElementById("admin-section");
  const checkioSection = document.getElementById("checkio-section");

  // Nav links
  const tabInventory = document.getElementById("show-inventory");
  const tabAdmin = document.getElementById("show-admin");
  const tabCheckIO = document.getElementById("show-checkio");

  // Hide all sections first
  if (inventorySection) inventorySection.classList.add("hidden");
  if (adminSection) adminSection.classList.add("hidden");
  if (checkioSection) checkioSection.classList.add("hidden");

  // Remove active state from all nav links
  if (tabInventory) tabInventory.classList.remove("active");
  if (tabAdmin) tabAdmin.classList.remove("active");
  if (tabCheckIO) tabCheckIO.classList.remove("active");

  // Show the chosen section and highlight its nav link
  switch (tabName) {
    case "inventory":
      if (inventorySection) inventorySection.classList.remove("hidden");
      if (tabInventory) tabInventory.classList.add("active");
      break;
    case "admin":
      if (adminSection) adminSection.classList.remove("hidden");
      if (tabAdmin) tabAdmin.classList.add("active");
      break;
    case "checkio":
      if (checkioSection) checkioSection.classList.remove("hidden");
      if (tabCheckIO) tabCheckIO.classList.add("active");
      break;
  }
}

/**
 * Update the table (#inventory-table) with the current items in `inventory`.
 */
function updateTable() {
  const tableBody = document.getElementById("inventory-table");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear out old rows

  inventory.forEach((item) => {
    const row = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = item.name;

    const tdStatus = document.createElement("td");
    tdStatus.textContent =
      item.status === "available" ? "Checked In" : "Checked Out";

    row.appendChild(tdName);
    row.appendChild(tdStatus);
    tableBody.appendChild(row);
  });
}

/**
 * Populate dropdowns (remove-item-name, checkio-item-name) with the current inventory
 */
function updateDropdowns() {
  // Remove item dropdown
  const removeSelect = document.getElementById("remove-item-name");
  if (removeSelect) {
    removeSelect.innerHTML = "";
    // Optional default option
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select an item";
    removeSelect.appendChild(placeholder);

    inventory.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.name;
      opt.textContent = item.name;
      removeSelect.appendChild(opt);
    });
  }

  // Check In/Out dropdown
  const checkioSelect = document.getElementById("checkio-item-name");
  if (checkioSelect) {
    checkioSelect.innerHTML = "";
    // Optional default option
    const placeholder2 = document.createElement("option");
    placeholder2.value = "";
    placeholder2.textContent = "Select an item";
    checkioSelect.appendChild(placeholder2);

    inventory.forEach((item) => {
      const opt2 = document.createElement("option");
      opt2.value = item.name;
      opt2.textContent = item.name;
      checkioSelect.appendChild(opt2);
    });
  }
}

/**
 * Check In handler
 */
function checkInItem() {
  const select = document.getElementById("checkio-item-name");
  const userName = document.getElementById('checkio-user-name').value;
  const projectNumber = document.getElementById('checkio-project-number').value;
  if (!select) return;

  const itemName = select.value;
  if (!itemName) return alert("Please select an item.");

  const item = inventory.find((i) => i.name === itemName);
  if (!item) return alert("Item not found in inventory.");

  if (item.status === "checked-out") {
    item.status = "available";
    logInventoryChange("Checked In", item.name, userName, projectNumber);
    alert(`"${item.name}" has been checked in.`);
    updateTable();
  } else {
    alert(`"${item.name}" is already checked in.`);
  }
}

/**
 * Check Out handler
 */
function checkOutItem() {
  const select = document.getElementById("checkio-item-name");
  const userName = document.getElementById('checkio-user-name').value;
  const projectNumber = document.getElementById('checkio-project-number').value;
  if (!select) return;

  const itemName = select.value;
  if (!itemName) return alert("Please select an item.");

  const item = inventory.find((i) => i.name === itemName);
  if (!item) return alert("Item not found in inventory.");

  if (item.status === "available") {
    item.status = "checked-out";
    logInventoryChange("Checked Out", item.name, userName, projectNumber);
    alert(`"${item.name}" has been checked out.`);
    updateTable();
  } else {
    alert(`"${item.name}" is already checked out.`);
  }
}

/**
 * Log an action (e.g., "Added", "Removed", "Checked In", "Checked Out")
 */
function logInventoryChange(action, itemName, userName, projectNumber) {
  inventoryLog.push({ action, itemName, userName, projectNumber, timestamp: new Date().toLocaleString() });

  const logUl = document.getElementById("inventory-log");
  if (!logUl) return;

  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString()}] ${action}: ${itemName} by ${userName} for project ${projectNumber}`;
  logUl.appendChild(li);
}
