document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    first_name: document.getElementById("first_name").value.trim(),
    father_name: document.getElementById("father_name").value.trim(),
    gender: document.getElementById("gender").value,
    department: document.getElementById("department").value.trim(),
    dorm_block: document.getElementById("dorm_block").value.trim(),
    dorm_room_number: document.getElementById("dorm_room_number").value.trim(),
    job_field: document.getElementById("job_field").value,
    phone_number: document.getElementById("phone_number").value.trim(),
  };

  const responseMessage = document.getElementById("response-message");
  const submitButton = document.querySelector('button[type="submit"]');

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

  // Basic client-side validation
  for (const [key, value] of Object.entries(formData)) {
    if (!value) {
      responseMessage.textContent = "እባክዎ ሁሉንም መረጃዎች ያስገቡ።";
      responseMessage.className = "response-message error";
      // Highlight the empty field
      document.getElementById(key).classList.add("error-field");
      return;
    }
  }

  // Phone number validation
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(formData.phone_number)) {
    responseMessage.textContent = "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ። (ምሳሌ: 0912345678)";
    responseMessage.className = "response-message error";
    document.getElementById("phone_number").classList.add("error-field");
    return;
  }

  try {
    // Remove error highlighting from all fields
    document.querySelectorAll(".error-field").forEach((field) => {
      field.classList.remove("error-field");
    });

    // Disable the submit button while processing
    submitButton.disabled = true;
    submitButton.textContent = "እባክዎ ይጠብቁ...";

    const response = await fetch(`${backendBaseUrl}/api/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      responseMessage.textContent =
        data.message || "መረጃዎ በተሳካ ሁኔታ ተመዝግቧል። እናመሰግናለን!";
      responseMessage.className = "response-message success";
      document.getElementById("userForm").reset();
    } else {
      responseMessage.textContent =
        data.message || "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።";
      responseMessage.className = "response-message error";

      // If there are specific field errors, highlight them
      if (data.details) {
        const fields = data.details.split(",").map((f) => f.trim());
        fields.forEach((field) => {
          const element = document.getElementById(field);
          if (element) {
            element.classList.add("error-field");
          }
        });
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    responseMessage.textContent = "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።";
    responseMessage.className = "response-message error";
  } finally {
    // Re-enable the submit button
    submitButton.disabled = false;
    submitButton.textContent = "ያስገቡ";

    // Scroll to the response message
    responseMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
