import type { Route } from "./+types/home";

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
        <h1>My frontend</h1>
        <p>
          Modern Frontend with React ROuter connected to a Django backend via REST.
        </p>

        <div className="actions">
          <a href="/about">About</a>
        </div>
      </div>
    </main>
  );
}