import type { Route } from "./+types/about";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About" },
    { name: "description", content: "Page About" },
  ];
}

export async function loader() {
  const fakeToken = "MON_TOKEN_TEMPORAIRE";

  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    headers: {
      Authorization: `Bearer ${fakeToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les données");
  }

  const data = await response.json();

  return {
    todo: data,
    sentAuthHeader: true,
  };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <h1>About</h1>
      <p>Todo title: {loaderData.todo.title}</p>
      <p>Completed: {loaderData.todo.completed ? "yes" : "no"}</p>
      <p>Auth header sent: {loaderData.sentAuthHeader ? "yes" : "no"}</p>
      <Link to="/">Home</Link>
    </main>
  );
}