import { createBrowserRouter } from "react-router-dom";
import App from "../../../App";
import Home from "../../components/pages/home";
import Settings from "../../components/pages/settings";
import Plans from "../../components/pages/plans";
import Batches from "../../components/pages/modules/inventory/batches";
import Inventory from "../../components/pages/modules/inventory/inventory";
import InventoryMovements from "../../components/pages/modules/inventory/movements";
import Products from "../../components/pages/modules/inventory/products";
import Sales from "../../components/pages/modules/sales/pos";
import Permissions from "../../components/pages/modules/permissions/permissions";
import Brands from "../../components/pages/modules/inventory/brands";
import Categories from "../../components/pages/modules/inventory/categories";
import Units from "../../components/pages/modules/inventory/units";
import Bugs from "../../components/pages/bugs";
import AuthCallback from "../../components/pages/auth/callback";
import AuthError from "../../components/pages/auth/error";
import Private from "./private";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/plans", element: <Plans /> },
      { path: "/auth/callback", element: <AuthCallback /> },
      { path: "/auth/error", element: <AuthError /> },
      { path: "/settings", element: <Private><Settings /></Private> },
      { path: "/inventory", element: <Private><Inventory /></Private> },
      { path: "/products", element: <Private><Products /></Private> },
      { path: "/brands", element: <Private><Brands /></Private> },
      { path: "/categories", element: <Private><Categories /></Private> },
      { path: "/units", element: <Private><Units /></Private> },
      { path: "/products/:productId/batches", element: <Private><Batches /></Private> },
      { path: "/movements", element: <Private><InventoryMovements /></Private> },
      { path: "/pos", element: <Private><Sales /></Private> },
      { path: "/permissions", element: <Private><Permissions /></Private> },
      { path: "/bugs", element: <Private><Bugs /></Private> },

      // { path: "/orders", element: <Orders /> },
      // { path: "/orders/:id", element: <Order /> },
      // { path: "/reservations", element: <Reservations /> },
      // { path: "/reservations/:id/check", element: <CheckInOut /> },
      // { path: "/payment-intents", element: <PaymentIntents /> },
      // { path: "/history", element: <History /> },
      // { path: "/customers", element: <Customers /> },
      // { path: "/catalogs", element: <Catalogs /> },
    ],
  },
]);
