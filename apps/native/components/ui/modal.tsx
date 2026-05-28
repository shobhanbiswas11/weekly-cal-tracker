import { createContext, useContext, useState, type ReactNode } from "react";
import {
  Pressable,
  Modal as RNModal,
  type DimensionValue,
  type ModalProps as RNModalProps,
} from "react-native";

// --- Context ---

type ModalContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal components must be used within <Modal>");
  return ctx;
}

// --- Root ---

function Modal({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;

  const value: ModalContextValue = {
    open: isControlled ? open : internalOpen,
    onOpenChange: isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

// --- Trigger ---

function ModalTrigger({ children }: { children: ReactNode }) {
  const { onOpenChange } = useModalContext();

  return <Pressable onPress={() => onOpenChange(true)}>{children}</Pressable>;
}

// --- Content ---

function ModalContent({
  children,
  height = "80%",
  animationType = "slide",
  ...rest
}: {
  children: ReactNode;
  height?: DimensionValue;
  animationType?: RNModalProps["animationType"];
} & Omit<
  RNModalProps,
  "visible" | "transparent" | "onRequestClose" | "animationType"
>) {
  const { open, onOpenChange } = useModalContext();

  return (
    <RNModal
      visible={open}
      transparent
      animationType={animationType}
      onRequestClose={() => onOpenChange(false)}
      {...rest}
    >
      <Pressable
        className="flex-1 bg-black/80 justify-center items-center p-5"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          style={{ height }}
          className="w-full bg-card rounded-2xl overflow-hidden"
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

// --- Close ---

function ModalClose({ children }: { children: ReactNode }) {
  const { onOpenChange } = useModalContext();

  return <Pressable onPress={() => onOpenChange(false)}>{children}</Pressable>;
}

// --- Exports ---

export { Modal, ModalClose, ModalContent, ModalTrigger };
