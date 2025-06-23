"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Always push a dummy state on first load to trap the back button
    window.history.pushState({ trapped: true }, "");

    const onPopState = () => {
      alert("Back button pressed! Staying here.");
      window.history.pushState({ trapped: true }, "");
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    pic: "", // just a string (URL or empty)
  });

  const handleChange = (e, key, form) => {
    const value =
      form === "register" && key === "pic"
        ? e.target.value // ← no file input now, just text
        : e.target.value;

    if (form === "register") {
      setRegisterForm({ ...registerForm, [key]: value });
    } else {
      setLoginForm({ ...loginForm, [key]: value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://chat-backend-bgsn.onrender.com/api/user/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginForm),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      router.push("/chat"); // redirect to chat page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://chat-backend-bgsn.onrender.com/api/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerForm),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      router.push("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onPopState = () => {
      alert(
        "This runs when user presses mobile back button or browser back button"
      );
      // This runs when user presses mobile back button or browser back button
      setSelectedChat(null); // reset chat selection
    };

    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-[url('/aboutpagebackground.png')] bg-no-repeat">
      <div className="bg-[rgba(92,89,89,0.6)] backdrop-blur-sm p-10 md:rounded-2xl flex flex-col items-center md:min-h-[480px] max-md:h-[100vh] shadow-[34px_8px_24px_rgba(0,0,0,0.2),_18px_28px_24px_rgba(0,0,0,0.2)]">
        <h1 className="text-3xl font-bold mb-4 font-sans text-white text-center">Welcome to POST CARD</h1>
        <div className="flex gap-2 mb-4 w-full">
          <div
            className={`bg-orange-400 text-center w-full p-2 rounded-md cursor-pointer font-sans ${
              tab === "login" ? "bg-yellow-400" : ""
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </div>
          <div
            className={`bg-orange-400 w-full text-center p-2 rounded-md cursor-pointer font-sans ${
              tab === "register" ? "bg-yellow-400" : ""
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {tab === "login" && (
          <form
            className="flex flex-col justify-between h-[250px] w-full"
            onSubmit={handleLogin}
          >
            <div className="flex flex-col gap-5 w-full">
              <div className="flex flex-col md:justify-between items-center">
                <label
                  className="min-w-full font-sans"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                  name="email"
                  onChange={(e) => handleChange(e, "email", "login")}
                  value={loginForm.email}
                  id="email"
                />
              </div>
              <div className="flex md:justify-between flex-col items-center">
                <label
                  className="min-w-full font-sans"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                  type="password"
                  name="password"
                  onChange={(e) => handleChange(e, "password", "login")}
                  value={loginForm.password}
                  id="password"
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="bg-orange-400 p-2 rounded-md cursor-pointer text-center w-[140px] mx-[50%] translate-x-[-50%] border-white font-sans"
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form className="flex flex-col gap-5 w-full" onSubmit={handleRegistration}>
            <div className="flex flex-col md:justify-between items-center">
              <label
                className="min-w-full font-sans"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                name="name"
                onChange={(e) => handleChange(e, "name", "register")}
                value={registerForm.name}
                id="name"
              />
            </div>
            <div className="flex md:justify-between flex-col items-center">
              <label
                className="min-w-full font-sans"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                name="email"
                onChange={(e) => handleChange(e, "email", "register")}
                value={registerForm.email}
                id="email"
              />
            </div>
            <div className="flex md:justify-between flex-col items-center">
              <label
                className="min-w-full font-sans"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                type="password"
                name="password"
                onChange={(e) => handleChange(e, "password", "register")}
                value={registerForm.password}
                id="password"
              />
            </div>
            <div className="flex md:justify-between flex-col items-center">
              <label
                className="min-w-full font-sans"
                htmlFor="pic"
              >
                Picture
              </label>
              <input
                className="p-2 border-solid border-2 min-w-full border-white rounded-md"
                type="text"
                placeholder="Optional picture URL"
                onChange={(e) => handleChange(e, "pic", "register")}
                name="pic"
                value={registerForm.pic}
                id="pic"
              />
            </div>
            <button
              disabled={loading}
              className="bg-orange-400 p-2 rounded-md cursor-pointer text-center w-[140px] mx-[50%] translate-x-[-50%] font-sans"
              type="submit"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
