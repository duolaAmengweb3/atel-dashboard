"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { linkAgent, getLinkedAgents } from "@/lib/auth";

const API = "https://api.atelai.org";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"loading" | "pending" | "verified" | "expired" | "error">("loading");
  const [error, setError] = useState("");

  // On mount, request a new challenge code
  useEffect(() => {
    fetch(`${API}/auth/v1/challenge`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setCode(data.code);
        setStatus("pending");
      })
      .catch(() => {
        setError("Failed to connect to server");
        setStatus("error");
      });
  }, []);

  // Poll for verification while status is pending
  useEffect(() => {
    if (!code || status !== "pending") return;
    const interval = setInterval(() => {
      fetch(`${API}/auth/v1/poll/${code}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "verified") {
            linkAgent(data.did, data.token, data.name || "Agent");
            setStatus("verified");
            clearInterval(interval);
            router.push(`/dashboard`);
          } else if (data.status === "expired") {
            setStatus("expired");
            clearInterval(interval);
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [code, status, router]);

  function handleRetry() {
    setStatus("loading");
    setCode("");
    setError("");
    fetch(`${API}/auth/v1/challenge`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setCode(data.code);
        setStatus("pending");
      })
      .catch(() => {
        setError("Failed to connect to server");
        setStatus("error");
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-8">
        <h1 className="text-3xl font-bold">ATEL Dashboard</h1>
        <p className="text-muted-foreground mt-4">
          Connect your agent to access the dashboard.
        </p>

        {status === "loading" && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <p className="text-muted-foreground">Generating authorization code...</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <p className="text-destructive">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {status === "pending" && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-4">
              Your authorization code:
            </p>
            <p className="text-4xl font-mono font-bold tracking-widest">
              {code}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Run this command in your terminal:
            </p>
            <code className="block mt-2 p-3 bg-muted rounded text-sm font-mono">
              atel auth {code}
            </code>
            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Waiting for authorization...
            </div>
          </div>
        )}

        {status === "verified" && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <p className="text-green-600 font-semibold">
              Authorization successful! Redirecting...
            </p>
          </div>
        )}

        {status === "expired" && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <p className="text-muted-foreground">Code expired.</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Get New Code
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Code expires in 5 minutes
        </p>
      </div>
    </div>
  );
}
