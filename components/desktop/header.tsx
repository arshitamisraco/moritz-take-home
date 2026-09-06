"use client";

import { Plus, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Header({
  onOpenPalette,
  onNewMatter,
}: {
  onOpenPalette: () => void;
  onNewMatter: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-border bg-background py-4">
      <p className="px-2 py-3 font-serif text-2xl font-bold tracking-tight text-foreground">Mysil</p>

      <NavigationMenu className="px-2 py-3">
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<button type="button" onClick={onOpenPalette} />}
              className={cn(navigationMenuTriggerStyle(), "gap-2 text-muted-foreground hover:text-foreground")}
            >
              <Search className="size-3.5" aria-hidden="true" />
              Search
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<button type="button" onClick={onNewMatter} />}
              className={cn(
                navigationMenuTriggerStyle(),
                "gap-1.5 bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),#fff_16%)] hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
              )}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New matter
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
