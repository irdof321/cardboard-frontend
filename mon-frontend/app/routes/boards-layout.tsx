import type { Route } from "./+types/login";
import { Form, Link, Outlet, useLoaderData } from "react-router";
import { getToken } from "../session.server";

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
    const token = await getToken(request);

    const boards = await fetch("http://127.0.0.1:8000/api/boards/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

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