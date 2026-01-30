import "./index.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/core/routers/router.tsx'
import Global from "./app/core/contexts/global.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Global>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        draggable
      />
    </Global>
  </StrictMode>,
)
