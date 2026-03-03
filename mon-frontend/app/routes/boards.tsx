import type { Route } from "./+types/login";
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
      <h2>Select a board</h2>
    </div>
  );
}