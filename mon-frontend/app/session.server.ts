import { createCookieSessionStorage, redirect } from "react-router";
import { API_URL } from "./utils/config"; 

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    secrets: ["cardboard-secret-key"],
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.commitSession(session);
}

export async function getToken(request: Request) {
  const session = await getSession(request);
  return session.get("token") ?? null;
}

export async function getRefreshToken(request: Request) {
  const session = await getSession(request);
  return session.get("refreshToken") ?? null;
}


export async function requireToken(request: Request) {
  const token = await getToken(request);
  if (!token) throw redirect("/login");
  return token;
}

export async function destroySession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.destroySession(session);
}

export function fetchWithToken(url: string, token: string, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchWithAuth(url: string, request: Request, options = {}) {
  // 1. Retrieve the token from the session
  const token = await getToken(request);
  if (!token) {
    throw redirect("/");
  }
  // 2. Make the request with the token in the Authorization header
  let last_response = null;
  const response = await fetchWithToken(url, token, options);
  // 3. If 401, refresh the token and retry
  if (response.status === 401) {
    const refreshToken = await getRefreshToken(request);
    if (!refreshToken) {
      throw redirect("/");
    }
    const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!refreshResponse.ok) {
      throw redirect("/");
    }
    const session = await getSession(request);
    const refreshData = await refreshResponse.json();
    session.set("token", refreshData.access);
    await commitSession(session);
  
    const retryResponse = await fetchWithToken(url, refreshData.access, options);  
    if (!retryResponse.ok) {
      throw new Error("Request failed after token refresh");
    }
    last_response = retryResponse;
  } else if (!response.ok) {
    throw new Error("Request failed");
  } else {
    last_response = response;
  }
  
  
    // 4. Return the final response
    return last_response;
}