import type { ReactNode } from "react";
import { Identity } from "./identity";
import { Storage } from "./storage";
import { ModalProvider } from "./modal";

export default function Global({ children }: { children: ReactNode }) {
  return (
    <Storage>
      <Identity>
        <ModalProvider>{children}</ModalProvider>
      </Identity>
    </Storage>
  );
}
