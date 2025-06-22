"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-[url('/aboutpagebackground.png')]">
      <h1 className="text-3xl font-bold mb-4">Welcome to POST CARD</h1>
      <div className="bg-[rgba(168,169,116,0.5)] p-10 rounded-2xl flex flex-col items-center min-h-[444px]">
        <div className="flex gap-10 mb-4">
          <div
            className={`bg-orange-400 text-center w-[140px] p-2 rounded-md cursor-pointer ${
              tab === "login" ? "bg-yellow-400" : ""
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </div>
          <div
            className={`bg-orange-400 w-[140px] text-center p-2 rounded-md cursor-pointer ${
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
            className="flex flex-col justify-between h-[250px]"
            onSubmit={handleLogin}
          >
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <label className="min-w-[100px] mr-5" htmlFor="email">
                  Email
                </label>
                <input
                  className="p-2 border-solid border-2 min-w-[400px]"
                  name="email"
                  onChange={(e) => handleChange(e, "email", "login")}
                  value={loginForm.email}
                  id="email"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="min-w-[100px] mr-5" htmlFor="password">
                  Password
                </label>
                <input
                  className="p-2 border-solid border-2 min-w-[400px]"
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
              className="bg-orange-400 p-2 rounded-md cursor-pointer text-center w-[140px] mx-[50%] translate-x-[-50%]"
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form className="flex flex-col gap-5" onSubmit={handleRegistration}>
            <div className="flex justify-between items-center">
              <label className="min-w-[100px] mr-5" htmlFor="name">
                Name
              </label>
              <input
                className="p-2 border-solid border-2 min-w-[400px]"
                name="name"
                onChange={(e) => handleChange(e, "name", "register")}
                value={registerForm.name}
                id="name"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="min-w-[100px] mr-5" htmlFor="email">
                Email
              </label>
              <input
                className="p-2 border-solid border-2 min-w-[400px]"
                name="email"
                onChange={(e) => handleChange(e, "email", "register")}
                value={registerForm.email}
                id="email"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="min-w-[100px] mr-5" htmlFor="password">
                Password
              </label>
              <input
                className="p-2 border-solid border-2 min-w-[400px]"
                type="password"
                name="password"
                onChange={(e) => handleChange(e, "password", "register")}
                value={registerForm.password}
                id="password"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="min-w-[100px] mr-5" htmlFor="pic">
                Picture
              </label>
              <input
                className="p-2 border-solid border-2 min-w-[400px]"
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
              className="bg-orange-400 p-2 rounded-md cursor-pointer text-center w-[140px] mx-[50%] translate-x-[-50%]"
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
