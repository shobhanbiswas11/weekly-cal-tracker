import { MessagePrimitive } from "@assistant-ui/react-native";
import { ComponentPropsWithoutRef } from "react";

export function MessageContainer({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof MessagePrimitive.Root>) {
  return (
    <MessagePrimitive.Root {...props} className="py-1.5">
      {children}
    </MessagePrimitive.Root>
  );
}
