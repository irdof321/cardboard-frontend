import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { fetchWithAuth } from "../session.server";
import { API_URL } from "~/utils/config";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boards" },
    { name: "description", content: "Page des tableaux" },
  ];
}


export async function loader({ request, params }: Route.LoaderArg) {

  const boardId = params.id;

  const [boardResponse, choicesResponse, ColumnResponse  ] = await Promise.all([
    fetchWithAuth(`${API_URL}/boards/${boardId}/`, request,
    {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
    }),
    fetchWithAuth(`${API_URL}/cards/card_choices`, request,
    {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
    }),
    fetchWithAuth(`${API_URL}/columns/?board=${boardId}`, request)

  ]);


  if (!boardResponse.ok) {
    throw new Error("Impossible de récupérer les données du board");
  }

  if (!ColumnResponse.ok) {
    throw new Error("Impossible de récupérer les données");
  }  

  if (!choicesResponse.ok) {
    throw new Error("Impossible de récupérer les données");
  }

  const [boardData, columnData, choices] = await Promise.all([
    boardResponse.json(),
    ColumnResponse.json(),
    choicesResponse.json()
  ]);


  const memberIds = boardData.members.join(',');
  const usersResponse = await fetchWithAuth(`${API_URL}/users/?ids=${memberIds}`, request);
  const members = await usersResponse.json();

  const url = new URL(request.url);
  const success = url.searchParams.get("success");
  const msg = url.searchParams.get("msg");

  return {columnData, boardId, boardName: boardData.name, choices, members, success, msg}
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();


  const intent = formData.get("intent");
  const boardId = formData.get("boardId");
  if (intent === "update") {    
  // PATCH /api/cards/:id/
    try {
      const cardId = formData.get("cardId");
      const patch = {
        status: formData.get("status"),
        priority: formData.get("priority"),
      };
      
      const response = await fetchWithAuth(`${API_URL}/cards/${cardId}/`, request, {
        method: 'PATCH',
        body: JSON.stringify(patch),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = encodeURIComponent(JSON.stringify(errorData));
        return redirect(`/boards/${boardId}?success=false&msg=${errorMsg}`);
      }
      
        return redirect(`/boards/${boardId}?success=true`);
      
    } catch (e) {
      return redirect(`/boards/${boardId}?success=false`);
    }

  } else if (intent === "delete") {
      // DELETE /api/cards/:id/
      try {
        const cardId = formData.get("cardId");
        const response = await fetchWithAuth(`${API_URL}/cards/${cardId}/`, request, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = encodeURIComponent(JSON.stringify(errorData));
          return redirect(`/boards/${boardId}?success=false&msg=${errorMsg}`);
        }

        return redirect(`/boards/${boardId}?success=true`);

      } catch (e) {
        return redirect(`/boards/${boardId}?success=false`);
      }
    } else {
      // POST /api/cards/ (creation)   
      
      const card = {
        title: formData.get("title"),
        column: formData.get("columnId"),
        order: formData.get("order"),
        status: formData.get("status"),
        priority: formData.get("priority"),
      };

      try {
        const response = await fetchWithAuth(`${API_URL}/cards/`, request, {
          method: 'POST',
          body: JSON.stringify(card),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = encodeURIComponent(JSON.stringify(errorData));
          return redirect(`/boards/${boardId}?success=false&msg=${errorMsg}`);
        }

        return redirect(`/boards/${boardId}?success=true`);

      } catch (e) {
        return redirect(`/boards/${boardId}?success=false`);
      }
  }
}

export default function Boards({ loaderData, actionData  }: Route.ComponentProps) {
  const [openColumnId, setOpenColumnId] = useState(null);
  const [removeCardId, setRemoveCardId] = useState(null);
  console.log(loaderData.choices);

const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (loaderData?.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // disparaît après 3s
    }
  }, [loaderData?.success]);
  return (
    <div>
      {showToast && (
        <div className={loaderData.success === "true" ? "toast-success" : "toast-error"}>
          {loaderData.success === "true" 
            ? "Action success !" 
            : loaderData.msg ? decodeURIComponent(loaderData.msg) : "Error !"}
        </div>
      )}
      <h2>Board {loaderData?.boardName}</h2>
      <div className="row">
        {loaderData?.columnData?.map((column: any) => (
          <div className="column" key={column.id}>
            <h3>{column.name}</h3>
              {column.cards.map((card: any) => (
                <div className="card" key={card.id}>
                  <h4>{card.title}</h4>
                  <hr />
                  <p>{card.content}</p>
                  <hr />
                  <p>Assigned to: {card.assigned_to}</p>
                  <form method="post" onChange={(e) => e.currentTarget.submit()}>
                    <input type="hidden" name="intent" value="update" />
                    <input type="hidden" name="cardId" value={card.id} />
                    <input type="hidden" name="boardId" value={loaderData.boardId} />
                    
                    <select name="status" defaultValue={card.status}>
                      {loaderData?.choices?.status?.map((s: any) => (
                        <option key={s[0]} value={s[0]}>{s[1]}</option>
                      ))}
                    </select>

                    <select name="priority" defaultValue={card.priority}>
                      {loaderData?.choices?.priority?.map((p: any) => (
                        <option key={p[0]} value={p[0]}>{p[1]}</option>
                      ))}
                    </select>
                  </form>
                  <form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="cardId" value={card.id} />
                    <input type="hidden" name="boardId" value={loaderData.boardId} />
                    <button type="submit">Remove</button>
                  </form>
                </div>
              ))}
            <button onClick={() => setOpenColumnId(column.id)}>+</button>

            {openColumnId === column.id && (
              <form method="post">
                <input name="title" placeholder="Card title" />
                <input name="order" type="number" min="1" value="1" />
                <input type="hidden" name="columnId" value={column.id} />
                <input type="hidden" name="boardId" value={loaderData.boardId} />

                <select name="priority" id="card-priority"> 
                {loaderData?.choices?.priority?.map((priority: any) =>
                <option key={priority[0]} value={priority[0]}> {priority[1]}</option>              
                )}
                </select>

                <select name="status" id="card-status"> 
                {loaderData?.choices?.status?.map((status: any) =>
                <option key={status[0]} value={status[0]}> {status[1]}</option>              
                )}
                </select>

                <select name="assigned_to">
                  <option value="">-- Non assigné --</option>
                  {loaderData?.members?.map((user: any) => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
              </select>

                <button onClick={() => setOpenColumnId(null)}>Cancel</button>
                <button type="submit" id="createCard">Create</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}