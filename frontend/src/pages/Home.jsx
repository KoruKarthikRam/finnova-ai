import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
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
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="max-w-2xl rounded-3xl bg-white p-10 text-center shadow-lg">
        <p className="mb-3 font-semibold text-indigo-600">
          WELCOME TO FINNOVA
        </p>

        <h1 className="text-5xl font-bold text-slate-900">
          Your Money.
          <br />
          Smarter Decisions.
        </h1>

        <p className="mt-5 text-lg text-slate-600">
          Intelligent Financial Literacy & Personal Finance Assistant
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-5">
          <p className="font-semibold text-slate-800">
            Backend Status
          </p>

          <p className="mt-2 text-green-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;