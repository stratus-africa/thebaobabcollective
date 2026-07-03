import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMenuConfig, MENU_DEFAULTS, type MenuConfig } from "@/lib/menu.functions";

export const MENU_CONFIG_QUERY_KEY = ["menu-config"] as const;

export function useMenuConfig(): MenuConfig {
  const fetchMenu = useServerFn(getMenuConfig);
  const q = useQuery<MenuConfig>({
    queryKey: MENU_CONFIG_QUERY_KEY,
    queryFn: () => fetchMenu(),
    staleTime: 60_000,
  });
  return q.data ?? MENU_DEFAULTS;
}
