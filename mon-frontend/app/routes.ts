import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("boards", "routes/boards-layout.tsx", [
    index("routes/boards.tsx"),
    route(":id", "routes/board.tsx"),
  ])
] satisfies RouteConfig;