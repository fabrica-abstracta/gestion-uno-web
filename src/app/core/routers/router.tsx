import { createBrowserRouter } from "react-router-dom";
import App from "../../../App";
import Home from "../../components/pages/home";
import Products from "../../components/pages/modules/products";
import Batches from "../../components/pages/modules/batches";
import Sales from "../../components/pages/modules/sales";
import Users from "../../components/pages/modules/users";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/users", element: <Users /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:productId/batches", element: <Batches /> },
      { path: "/sales", element: <Sales /> },
      // { path: "/movimientos", element: <Movimientos /> },
      // { path: "/providers", element: <Providers /> },
      // { path: "/history", element: <History /> },
      // { path: "/payment-intents-history", element: <PaymentIntentsHistory /> },
      // { path: "/users", element: <Users /> },

    ],
  },
]);
