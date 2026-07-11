async function test() {
  try {
    const msgRes = await fetch(`http://localhost:5192/api/gift-chat/suggestions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Need to pass a valid token or bypass auth if it's [Authorize]
      },
      body: JSON.stringify({ 
        prompt: "Làm vòng tay",
        maxCost: 150000,
        occasion: "Birthday",
        difficulty: "Easy"
      })
    });
    
    console.log("Status:", msgRes.status);
    console.log("Response:", await msgRes.text());
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
test();
