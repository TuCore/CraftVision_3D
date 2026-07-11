async function test() {
  try {
    // 1. Create a dummy user to get a token (if auth allows register)
    const authRes = await fetch("http://localhost:5192/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Test User", email: "test@example.com", password: "Password123!" })
    });
    
    // If already exists, login
    let token = "";
    if (authRes.ok) {
      const data = await authRes.json();
      token = data.token;
    } else {
      const loginRes = await fetch("http://localhost:5192/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "Password123!" })
      });
      const data = await loginRes.json();
      token = data.token;
    }
    
    console.log("Got token:", token.substring(0, 10) + "...");

    // 2. Call suggestions endpoint
    const msgRes = await fetch(`http://localhost:5192/api/gift-chat/suggestions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        prompt: "Làm vòng tay",
        maxCost: 150000,
        occasion: "Birthday",
        difficulty: "Easy"
      })
    });
    
    console.log("Suggestions Status:", msgRes.status);
    console.log("Suggestions Response:", await msgRes.text());
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
test();
