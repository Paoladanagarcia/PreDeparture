import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Start Planning", to: "/onboarding" },
  { label: "Community", to: "/community" },
  { label: "Assistant", to: "/assistant" },
  { label: "Profile", to: "/profile" },
  { label: "Account", to: "/auth" },
  { label: "About / Sources", to: "/about" },
] as const;

const resourceItems = [
  { label: "Visa guide", topic: "visa" },
  { label: "Housing guide", topic: "housing" },
  { label: "Arrival guide", topic: "arrival" },
] as const;

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] max-w-xs">
        <SheetHeader>
          <SheetTitle>PreDeparture</SheetTitle>
          <SheetDescription>Navigate your exchange preparation.</SheetDescription>
        </SheetHeader>

        <nav className="mt-6 grid gap-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.to}>
              <Link
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-6 border-t pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Guides
          </p>
          <nav className="mt-2 grid gap-1">
            {resourceItems.map((item) => (
              <SheetClose asChild key={item.topic}>
                <Link
                  to="/resources/$topic"
                  params={{ topic: item.topic }}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
