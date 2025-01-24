let inventory = [];
document.addEventListener("DOMContentLoaded", () => {
  loadInventoryFromServer()
    .then(() => {
      setupTabs();
      setupForms();
      updateTable();
      updateCategoryDropdown();
      showTab("checkio");
    })
    .catch((error) => {
      console.error("Error loading inventory:", error);
      setupTabs();
      setupForms();
    });
});

/**
 * Load inventory from JSON file
 */
async function loadInventoryFromServer() {
  try {
    const response = await fetch('/.netlify/functions/fetchInventory');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    inventory = data;
  } catch (error) {
    console.error("Error fetching inventory from server:", error);
  }
}

async function logInventoryChange(action, itemName, userName = "", projectNumber = "") {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    itemName,
    userName,
    projectNumber
  };

  try {
    const response = await fetch('/.netlify/functions/logInventoryChange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Log entry added:', data);
  } catch (error) {
    console.error('Error logging inventory change:', error);
  }

  const logEntryElement = document.createElement("li");
  logEntryElement.textContent = `${new Date().toLocaleString()}: ${action} - ${itemName} by ${userName} for project ${projectNumber}`;
  const inventoryLog = document.getElementById("inventory-log");
  if (inventoryLog) {
    inventoryLog.appendChild(logEntryElement);
  }
}

/**
 * Update the inventory table
 */
function updateTable() {
  const tableBodyCategory1 = document.getElementById("inventory-table-category1");
  const tableBodyCategory2 = document.getElementById("inventory-table-category2");
  const tableBodyCategory3 = document.getElementById("inventory-table-category3");
  const tableBodyCategory4 = document.getElementById("inventory-table-category4");
  if (!tableBodyCategory1 || !tableBodyCategory2 || !tableBodyCategory3 || !tableBodyCategory4) return;

  tableBodyCategory1.innerHTML = ""; // Clear out old rows
  tableBodyCategory2.innerHTML = ""; // Clear out old rows
  tableBodyCategory3.innerHTML = ""; // Clear out old rows
  tableBodyCategory4.innerHTML = ""; // Clear out old rows

  inventory.forEach((item) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    const statusCell = document.createElement("td");
    statusCell.textContent = item.status;
    if (item.status === "available") {
      statusCell.classList.add("status-available");
    } else if (item.status === "checked-out") {
      statusCell.classList.add("status-checked-out");
    }

    row.appendChild(nameCell);
    row.appendChild(statusCell);

    // Add the row to the appropriate category table
    if (item.category === "High Volume Pumps") {
      tableBodyCategory1.appendChild(row);
    } else if (item.category === "Low Volume Pumps") {
      tableBodyCategory2.appendChild(row);
    } else if (item.category === "Timers") {
      tableBodyCategory3.appendChild(row);
    } else if (item.category === "Pump Stands") {
      tableBodyCategory4.appendChild(row);
    }
  });
}
/**
 * Populate category dropdown with unique categories from the inventory
 */
function updateCategoryDropdown() {
  const categoryDropdown = document.getElementById("checkio-category-name");
  if (!categoryDropdown) return;

  const categories = [...new Set(inventory.map(item => item.category))];
  categoryDropdown.innerHTML = "";

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryDropdown.appendChild(option);
  });

  categoryDropdown.addEventListener("change", updateItemDropdown);
  updateItemDropdown(); // Initial population of items dropdown
}

/**
 * Populate items dropdown based on the selected category
 */
function updateItemDropdown() {
  const categoryDropdown = document.getElementById("checkio-category-name");
  const itemDropdown = document.getElementById("checkio-item-name");
  if (!categoryDropdown || !itemDropdown) return;

  const selectedCategory = categoryDropdown.value;
  const items = inventory.filter(item => item.category === selectedCategory);
  itemDropdown.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    itemDropdown.appendChild(option);
  });
}

/**
 * Populate dropdowns with the current inventory
 */
function updateDropdowns() {
  updateCategoryDropdown();
}

/**
 * Setup event listeners for forms:
 *  - Add Item
 *  - Remove Item
 *  - Check In/Out
 */
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function setupForms() {
  const addItemForm = document.getElementById("add-item-form");
  if (addItemForm) {
    addItemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newItemName = sanitizeInput(document.getElementById("new-item-name").value.trim());
      if (newItemName) {
        const existing = inventory.find((i) => i.name.toLowerCase() === newItemName.toLowerCase());
        if (existing) {
          alert("Item already exists.");
        } else {
          inventory.push({ name: newItemName, status: "available" });
          logInventoryChange("Added", newItemName);
          alert(`"${newItemName}" added!`);
          document.getElementById("new-item-name").value = "";
          updateTable();
          updateDropdowns();
          await updateInventoryOnServer(inventory);
        }
      }
    });
  }

  const removeItemForm = document.getElementById("remove-item-form");
  if (removeItemForm) {
    removeItemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const removeName = sanitizeInput(document.getElementById("remove-item-name").value);
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
        await updateInventoryOnServer(inventory);
      }
    });
  }

  const selectItemDropdown = document.getElementById("checkio-item-name");
  if (selectItemDropdown) {
    selectItemDropdown.addEventListener("change", addItemToList);
    selectItemDropdown.addEventListener("blur", addItemToList);
  }

  const btnRemoveAll = document.getElementById("btn-remove-all");
  if (btnRemoveAll) {
    btnRemoveAll.addEventListener("click", removeAllItems);
  }

  const btnCheckIn = document.getElementById("btn-checkin");
  const btnCheckOut = document.getElementById("btn-checkout");

  if (btnCheckIn) {
    btnCheckIn.addEventListener("click", async () => {
      await checkInItems();
      await updateInventoryOnServer(inventory);
    });
  }
  if (btnCheckOut) {
    btnCheckOut.addEventListener("click", async () => {
      await checkOutItems();
      await updateInventoryOnServer(inventory);
    });
  }
}

function addItemToList() {
  const select = document.getElementById("checkio-item-name");
  const selectedItemsList = document.getElementById("selected-items-list");
  const selectedItemsLabel = document.getElementById("selected-items-label");
  const btnRemoveAll = document.getElementById("btn-remove-all");
  if (!select || !selectedItemsList) return;

  const itemName = select.value;
  if (!itemName) return;

  // Check if the item is already in the list
  const existingItem = Array.from(selectedItemsList.children).find(
    (item) => item.dataset.itemName === itemName
  );
  if (existingItem) return;

  const listItem = document.createElement("li");
  listItem.textContent = itemName;
  listItem.dataset.itemName = itemName;

  selectedItemsList.appendChild(listItem);

  // Show the selected items label and remove all button
  selectedItemsLabel.classList.remove("hidden");
  selectedItemsList.classList.remove("hidden");
  btnRemoveAll.classList.remove("hidden");

  // Reset the dropdown to the placeholder option
  select.value = "";
}

function removeAllItems() {
  const selectedItemsList = document.getElementById("selected-items-list");
  const selectedItemsLabel = document.getElementById("selected-items-label");
  const btnRemoveAll = document.getElementById("btn-remove-all");
  if (selectedItemsList) {
    selectedItemsList.innerHTML = "";

    // Hide the selected items label and remove all button
    selectedItemsLabel.classList.add("hidden");
    selectedItemsList.classList.add("hidden");
    btnRemoveAll.classList.add("hidden");
  }
}

async function checkInItems() {
  const selectedItemsList = document.getElementById("selected-items-list");
  const userName = document.getElementById('checkio-user-name').value;
  const projectNumber = document.getElementById('checkio-project-number').value;
  if (!selectedItemsList) return;

  const items = selectedItemsList.querySelectorAll("li");
  if (items.length === 0) return alert("Please add at least one item.");

  let errorMessages = [];

  items.forEach((item) => {
    const itemName = item.dataset.itemName;
    const inventoryItem = inventory.find((i) => i.name === itemName);
    if (inventoryItem) {
      if (inventoryItem.status === "checked-out") {
        inventoryItem.status = "available";
        logInventoryChange("Checked In", itemName, userName, projectNumber);
      } else {
        errorMessages.push(`"${itemName}" is already checked in.`);
      }
    }
  });

  if (errorMessages.length > 0) {
    alert(errorMessages.join("\n"));
  } else {
    alert("Selected items have been checked in.");
  }

  updateTable();
  selectedItemsList.innerHTML = "";
}

async function checkOutItems() {
  const selectedItemsList = document.getElementById("selected-items-list");
  const userName = document.getElementById('checkio-user-name').value;
  const projectNumber = document.getElementById('checkio-project-number').value;
  if (!selectedItemsList) return;

  const items = selectedItemsList.querySelectorAll("li");
  if (items.length === 0) return alert("Please add at least one item.");

  let errorMessages = [];

  items.forEach((item) => {
    const itemName = item.dataset.itemName;
    const inventoryItem = inventory.find((i) => i.name === itemName);
    if (inventoryItem) {
      if (inventoryItem.status === "available") {
        inventoryItem.status = "checked-out";
        logInventoryChange("Checked Out", itemName, userName, projectNumber);
      } else {
        errorMessages.push(`"${itemName}" is already checked out.`);
      }
    }
  });

  if (errorMessages.length > 0) {
    alert(errorMessages.join("\n"));
  } else {
    alert("Selected items have been checked out.");
  }

  updateTable();
  selectedItemsList.innerHTML = "";
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

  // Show the selected section and set the active state on the corresponding nav link
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

function setupTabs() {
  const tabInventory = document.getElementById("show-inventory");
  const tabAdmin = document.getElementById("show-admin");
  const tabCheckIO = document.getElementById("show-checkio");

  if (tabInventory) {
    tabInventory.addEventListener("click", () => showTab("inventory"));
  }
  if (tabAdmin) {
    tabAdmin.addEventListener("click", () => showTab("admin"));
  }
  if (tabCheckIO) {
    tabCheckIO.addEventListener("click", () => showTab("checkio"));
  }
}

/**
 * Update the inventory on the server
 */
async function updateInventoryOnServer(newInventory) {
  const response = await fetch('/.netlify/functions/updateInventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newInventory),
  });

  if (!response.ok) {
    throw new Error('Failed to update inventory on server');
  }
}
