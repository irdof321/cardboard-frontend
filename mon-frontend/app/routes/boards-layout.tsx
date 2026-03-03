import type { Route } from "./+types/login";
import { Form, Link, Outlet, useLoaderData } from "react-router";
import { fetchWithAuth } from "../session.server";
import { API_URL } from "~/utils/config";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boards" },
    { name: "description", content: "Page des tableaux" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
    return{};
}


export async function loader({ request }: Route.LoaderArgs) {

    const boards = await fetchWithAuth(`${API_URL}/boards/`, request);

    if (!boards.ok) {
        throw new Error("Impossible de récupérer les tableaux");
    }

    return { boards: await boards.json() };
}

export default function BoardsLayout() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <nav>
        {data.boards.map((board: any) => (
          <Link key={board.id} to={`/boards/${board.id}`}>
            {board.name}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}