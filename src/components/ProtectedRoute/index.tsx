import { observer } from "mobx-react";
import { isAlive } from "mobx-state-tree";
import { Outlet } from "react-router-dom";
import { useUserStore } from "../../api/services/User";
import AccessDenied from "../../pages/AccessDenied";

/**
 * Guard for routes flagged `requiresAuth`. Authorization is route metadata, not
 * a per-path `if` in Root: every protected route is simply nested under this
 * element in the route tree. Renders the children (<Outlet/>) when a user is
 * present, otherwise the AccessDenied page.
 */
const ProtectedRoute = observer(() => {
  const userStore = useUserStore();
  const user = userStore?.user;
  const isAuthenticated = !!user && isAlive(user);

  return isAuthenticated ? <Outlet /> : <AccessDenied />;
});

export default ProtectedRoute;
