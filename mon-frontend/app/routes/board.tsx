import type { Route } from "./+types/login";
import { useLoaderData } from "react-router";
import { getToken } from "../session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boards" },
    { name: "description", content: "Page des tableaux" },
  ];
}


export async function loader({ request, params }: Route.LoaderArg) {
  const token = await getToken(request);
  console.log("Token in boards loader:", token);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const boardId = params.id;
  const boardResponse = await fetch(`http://localhost:8000/api/boards/${boardId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!boardResponse.ok) {
    throw new Error("Impossible de récupérer les données du board");
  }
  const boardData = await boardResponse.json();

  const response = await fetch(`http://localhost:8000/api/columns/?board=${boardId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les données");
  }

  const data = await response.json();

  return {data, boardId, boardName: boardData.name};
}

export default function Boards({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h2>Board {loaderData?.boardName}</h2>
      <div className="row">
        {loaderData?.data?.map((column: any) => (
          <div className="column" key={column.id}>
            <h3>{column.name}</h3>
              {column.cards.map((card: any) => (
                <div className="card" key={card.id}>
                  <h4>{card.title}</h4>
                  <hr />
                  <p>{card.content}</p>
                  <hr />
                  <p>Assigned to: {card.assigned_to}</p>
                  <p>Status: {card.status}</p>
                  <p>Priority: {card.priority}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}