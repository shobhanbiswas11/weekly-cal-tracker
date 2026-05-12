import { createContext, useContext, type RefObject } from "react";
import type { FlatList } from "react-native";

const ScrollContext = createContext<RefObject<FlatList | null> | null>(null);

export const ScrollProvider = ScrollContext.Provider;
export const useListRef = () => useContext(ScrollContext);
