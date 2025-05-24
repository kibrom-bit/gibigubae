import fetch from "node-fetch";

const testData = {
  first_name: "Abebe",
  father_name: "Kebede",
  gender: "ወንድ",
  department: "ኮምፒውተር ሳይንስ",
  dorm_block: "A",
  dorm_room_number: "101",
  job_field: "መምህር",
  phone_number: "0912345678",
};

async function testRegistration() {
  try {
    const response = await fetch("http://localhost:3000/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Registration result:", result);
  } catch (error) {
    console.error("Error testing registration:", error);
  }
}

testRegistration();
