import {
  isRouteErrorResponse,
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
} from "react-router";
import { getToken} from "./session.server";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];


export async function loader({ request }) {
  const token = await getToken(request);

  return {
    "token" : token,
  };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}


export function Layout({ children }: { children: React.ReactNode }) {
  const  data = useLoaderData<typeof loader>()?? { token: null };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside className="w-56 p-4 border-r border-gray-200">
            <h2>CardBoard</h2>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link to="/">Accueil</Link>
              <Link to="/about">About</Link>              
              {data.token && <Link to="/boards">Boards</Link>}
              {data.token ?  (
                
                <Form method="post" action="/logout">
                  <button type="submit">Logout</button>
                </Form>
              ):
              (
                <Form method="post" action="/login">
                  <div>
                    <label>
                      Username
                      <input type="text" name="username" />
                    </label>
                  </div>

                  <div>
                    <label>
                      Password
                      <input type="password" name="password" />
                    </label>
                  </div>

                  <button type="submit">LogIn</button>
                </Form>
              ) 
            }
              
              {/* <Link to="/login">Login</Link> */}
            </nav>
          </aside>

          <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
