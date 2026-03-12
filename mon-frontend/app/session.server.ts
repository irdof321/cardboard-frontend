import { createCookieSessionStorage, redirect } from "react-router";
import { API_URL, TOKEN_URL } from "./utils/config"; 

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

export function fetchWithToken(url: string, token: string, options: any = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchWithAuth(url: string, request: Request, options: any = {}) {
  const token = await getToken(request);
  if (!token) {
    throw redirect("/");
  }

  const response = await fetchWithToken(url, token, options);

  if (response.status === 401) {
    const refreshToken = await getRefreshToken(request);
    if (!refreshToken) {
      throw redirect("/");
    }

    const body = new URLSearchParams();
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", refreshToken);
    body.append("client_id", CLIENT_ID);
    body.append("client_secret", CLIENT_SECRET);

    const refreshResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    });

    if (!refreshResponse.ok) {
      throw redirect("/");
    }

    const refreshData = await refreshResponse.json();
    const session = await getSession(request);
    session.set("token", refreshData.access);
    await commitSession(session);

    return fetchWithToken(url, refreshData.access, options);
  }

  return response;
}