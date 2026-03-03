import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { fetchWithAuth } from "../session.server";
import { API_URL } from "~/utils/config";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boards" },
    { name: "description", content: "Page des tableaux" },
  ];
}


export async function loader({ request, params }: Route.LoaderArg) {


  const boardId = params.id;
  const boardResponse = await fetchWithAuth(`${API_URL}/boards/${boardId}/`, request);
  if (!boardResponse.ok) {
    throw new Error("Impossible de récupérer les données du board");
  }
  const boardData = await boardResponse.json();

  const response = await fetchWithAuth(`${API_URL}/columns/?board=${boardId}`, request);
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