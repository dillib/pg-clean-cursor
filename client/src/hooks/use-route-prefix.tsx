import { createContext, useContext } from "react";

const RoutePrefixContext = createContext("");

export function RoutePrefixProvider({ prefix, children }: { prefix: string; children: React.ReactNode }) {
  return (
    <RoutePrefixContext.Provider value={prefix}>
      {children}
    </RoutePrefixContext.Provider>
  );
}

export function useRoutePrefix() {
  return useContext(RoutePrefixContext);
}

export function usePrefixedLink() {
  const prefix = useContext(RoutePrefixContext);
  return (path: string) => `${prefix}${path}`;
}
