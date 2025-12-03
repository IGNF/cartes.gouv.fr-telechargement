import { Outlet, createRootRoute } from "@tanstack/react-router";
import AppFooter from "../components/features/Layout/AppFooter";
import AppHeader from "../components/features/Layout/AppHeader.js";

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
