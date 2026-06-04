async function testLogin() {
  const url = "http://localhost:3000/api/auth/login";
  const payload = {
    email: "admin@clinicserenity.vn",
    password: "admin123"
  };

  try {
    console.log(`Sending POST to ${url}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    console.log(`Response Status: ${status}`);
    const data = await response.json();
    console.log("Response Body:", data);
    
    if (status === 200 && data.accessToken) {
      console.log("Success! Auth logic is functioning correctly.");
    } else {
      console.error("Failed to authenticate.");
    }
  } catch (err) {
    console.error("Error connecting to server:", err.message);
  }
}

testLogin();
