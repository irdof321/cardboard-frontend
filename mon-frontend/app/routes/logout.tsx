import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { destroySession, getSession } from "../session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Logout" },
    { name: "description", content: "Page de déconnexion" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();


  try {
    const session = await getSession(request);

    return redirect("/", {
    headers: {
        "Set-Cookie": await destroySession(session), 
    },
    });

  } catch (error) {
    return {
      success: false,
      error: "Impossible de contacter le serveur",
    };
  }
}



export default function Logout({ actionData }: Route.ComponentProps) {

  return (
    <main>

    </main>
  );
}