import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Backend connection failed");
      });
  }, []);

  return (
    <div>
      <h1>FinNova AI</h1>
      <p>Intelligent Financial Literacy & Personal Finance Assistant</p>

      <hr />

      <h2>Backend Status</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;