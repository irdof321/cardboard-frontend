import type { Route } from "./+types/login";
import { useLoaderData } from "react-router";
// import { getToken } from "../session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boards" },
    { name: "description", content: "Page des tableaux" },
  ];
}

export default function Boards() {
  return (
    <div>
      <h2>Sélectionne un board2 dans la navbar</h2>
    </div>
  );
}