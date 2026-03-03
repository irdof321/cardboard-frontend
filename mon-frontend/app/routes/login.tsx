import type { Route } from "./+types/login";
import { Form, Link } from "react-router";
import { useEffect } from "react";
import { redirect } from "react-router";
import { getSession, commitSession } from "../session.server";
import { API_URL } from "~/utils/config";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Page de connexion" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return {
      success: false,
      error: "Username ou password manquant",
    };
  }

  try {
    const res = await fetch(`${API_URL}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Erreur lors de la récupération du token",
      };
    }

    const data = await res.json();

    
    const session = await getSession(request);
    session.set("token", data.access);
    session.set("refreshToken", data.refresh);
    session.set("username", String(username));

    return redirect("/boards-layout", {
    headers: {
        "Set-Cookie": await commitSession(session),
    },
    });


  } catch (error) {
    return {
      success: false,
      error: "Impossible de contacter le serveur",
    };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    if (actionData?.success && actionData.accessToken) {
      
    }
  }, [actionData]);

  return (
    <main>
      <h1>Login</h1>

      {actionData?.success === false && (
        <div>
          <p>{actionData.error}</p>
        </div>
      )}

      <p>
        <Link to="/">Retour à l'accueil</Link>
      </p>
    </main>
  );
}