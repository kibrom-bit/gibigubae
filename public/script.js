document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    first_name: document.getElementById("first_name").value,
    father_name: document.getElementById("father_name").value,
    gender: document.getElementById("gender").value,
    department: document.getElementById("department").value,
    dorm_block: document.getElementById("dorm_block").value,
    dorm_room_number: document.getElementById("dorm_room_number").value,
    job_field: document.getElementById("job_field").value,
    phone_number: document.getElementById("phone_number").value,
  };

  const responseMessage = document.getElementById("response-message");
  const submitButton = document.querySelector('button[type="submit"]');

  try {
    // Disable the submit button while processing
    submitButton.disabled = true;
    submitButton.textContent = "እባክዎ ይጠብቁ...";

    const response = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      responseMessage.textContent = "መረጃዎ በተሳካ ሁኔታ ተመዝግቧል። እናመሰግናለን!";
      responseMessage.className = "response-message success";
      document.getElementById("userForm").reset();
    } else {
      responseMessage.textContent =
        data.message || "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።";
      responseMessage.className = "response-message error";
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
