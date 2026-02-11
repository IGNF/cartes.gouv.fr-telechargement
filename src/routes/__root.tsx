import { Outlet, createRootRoute } from "@tanstack/react-router";
import AppFooter from "../components/Layout/AppFooter";
import AppHeader from "../components/Layout/AppHeader.js";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {



  return (
    <>
      <AppHeader  />
      <Outlet />
      <AppFooter />
    </>
  );
}
