import { createContext, useContext, useState } from "react";

export type ModalType = "signIn" | "signUp" | "recover" | "reset" | "report";

export interface ModalData {
  [key: string]: any;
}

export interface ModalContextType {
  modals: Record<ModalType, boolean>;
  modalData: Record<ModalType, ModalData>;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Record<ModalType, boolean>>({
    signIn: false,
    signUp: false,
    recover: false,
    reset: false,
    report: false,
  });

  const [modalData, setModalData] = useState<Record<ModalType, ModalData>>({
    signIn: {},
    signUp: {},
    recover: {},
    reset: {},
    report: {},
  });

  const openModal = (type: ModalType, data?: ModalData) => {
    setModals((prev) => ({ ...prev, [type]: true }));
    if (data) {
      setModalData((prev) => ({ ...prev, [type]: data }));
    }
  };

  const closeModal = (type: ModalType) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    // Opcional: limpiar datos al cerrar
    setModalData((prev) => ({ ...prev, [type]: {} }));
  };

  const closeAllModals = () => {
    setModals({
      signIn: false,
      signUp: false,
      recover: false,
      reset: false,
      report: false,
    });
    setModalData({
      signIn: {},
      signUp: {},
      recover: {},
      reset: {},
      report: {},
    });
  };

  return (
    <ModalContext.Provider
      value={{ modals, modalData, openModal, closeModal, closeAllModals }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}
