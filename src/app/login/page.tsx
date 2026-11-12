"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const submit = async () => {
    const url = mode==="login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email,password}) });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error); return; }
    router.push("/");
  };
  return (
    <div className="panel form-panel">
      <p className="eyebrow">Welcome to Thavala</p>
      <h1 className="page-title">{mode==="login"?"Sign in":"Create an account"}</h1>
      <div className="form-stack">
        <label className="form-label">Email address
          <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="field" />
        </label>
        <label className="form-label">Password
          <input type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="field" />
        </label>
        <button onClick={submit} className="button button-primary">{mode==="login"?"Sign in":"Create account"}</button>
      </div>
      <p className="form-note">
        <button onClick={()=>setMode(mode==="login"?"register":"login")} className="text-button">
          {mode==="login"?"New here? Create an account":"Already have an account? Sign in"}
        </button>
      </p>
      {msg && <p className="form-message" role="alert">{msg}</p>}
    </div>
  );
}
