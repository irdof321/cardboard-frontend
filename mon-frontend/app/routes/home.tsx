import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mon frontend" },
    { name: "description", content: "Première page Remix/React Router" },
  ];
}

export default function Home() {
  return (
    <main>
      <div className="hero">
        <h1>Mon frontend</h1>
        <p>
          Frontend moderne en React Router connecté à un backend Django REST.
        </p>

        <div className="actions">
          <a href="/about">About</a>
        </div>
      </div>
    </main>
  );
}