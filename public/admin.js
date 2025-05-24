const adminControls = document.querySelector(".admin-controls");
const dataContainer = document.getElementById("data-container");
const adminPasswordInput = document.getElementById("adminPassword");
const userDataBody = document.getElementById("userDataBody");
const authMessage = document.getElementById("authMessage");
const loadingMessage = document.getElementById("loadingMessage");
const noDataMessage = document.getElementById("noDataMessage");

// Determine the backend URL
let backendBaseUrl;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  const backendPort = 3000; // Adjust if your local server consistently uses a different port
  backendBaseUrl = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
} else {
  // For deployed environments (like Vercel), API calls are relative to the current host
  backendBaseUrl = "";
}

async function authenticateAdmin() {
  const password = adminPasswordInput.value;
  authMessage.textContent = ""; // Clear previous messages

  if (!password) {
    authMessage.textContent = "Please enter the admin password.";
    return;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        adminControls.style.display = "none";
        dataContainer.style.display = "block";
        authMessage.textContent = ""; // Clear message on success
        fetchUserData();
      } else {
        authMessage.textContent = result.message || "Invalid password.";
      }
    } else {
      const errorData = await response.json().catch(() => ({
        message: "Authentication request failed. Status: " + response.status,
      }));
      authMessage.textContent = errorData.message || "Authentication failed.";
    }
  } catch (error) {
    console.error("Authentication error:", error);
    authMessage.textContent =
      "An error occurred during authentication. Please try again.";
  }
}

async function fetchUserData() {
  userDataBody.innerHTML = ""; // Clear existing table data
  loadingMessage.style.display = "block";
  noDataMessage.style.display = "none";

  try {
    const response = await fetch(`${backendBaseUrl}/api/admin/data`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to fetch data. Status: " + response.status,
      }));
      throw new Error(errorData.message || "Failed to fetch participant data.");
    }

    const data = await response.json();
    loadingMessage.style.display = "none";

    // Ensure data is an array before trying to use array properties/methods
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${escapeHtml(user.first_name)}</td>
                    <td>${escapeHtml(user.father_name)}</td>
                    <td>${escapeHtml(user.gender)}</td>
                    <td>${escapeHtml(user.department)}</td>
                    <td>${escapeHtml(user.dorm_block)}</td>
                    <td>${escapeHtml(user.dorm_room_number)}</td>
                    <td>${escapeHtml(user.job_field)}</td>
                    <td>${escapeHtml(user.phone_number)}</td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                `;
        userDataBody.appendChild(row);
      });
    } else {
      // Handle cases where data is not an array or is empty
      console.log(
        "Received data for admin page is not a non-empty array:",
        data
      );
      noDataMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    loadingMessage.style.display = "none";
    userDataBody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
  }
}

function escapeHtml(unsafe) {
  if (unsafe === null || typeof unsafe === "undefined") {
    return "";
  }
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add event listener for password input to allow Enter key submission
adminPasswordInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    authenticateAdmin();
  }
});
