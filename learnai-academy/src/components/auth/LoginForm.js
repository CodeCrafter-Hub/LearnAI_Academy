"use client";
import { useState } from "react";
import { Button } from "../ui/Button";
export default function LoginForm(){
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const onSubmit = async (e)=>{ e.preventDefault();
    const res = await fetch('/api/auth/login', {method:'POST', body: JSON.stringify({email,password})});
    console.log(await res.json());
  };
  return (<form onSubmit={onSubmit}><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
    <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
    <Button type="submit">Login</Button></form>);
}
