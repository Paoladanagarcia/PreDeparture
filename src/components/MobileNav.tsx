import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/storage";
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
  { label: "Community", to: "/community" },
  { label: "Assistant", to: "/assistant" },
  { label: "Profile", to: "/profile" },
  { label: "Account", to: "/auth" },
  { label: "About / Sources", to: "/about" },
] as const;

const resourceItems = [
  { label: "Visa guide", topic: "visa" },
  { label: "Housing guide", topic: "housing" },
  { label: "Banking guide", topic: "banking" },
  { label: "Phone guide", topic: "phone" },
  { label: "Arrival guide", topic: "arrival" },
  { label: "Scholarships guide", topic: "scholarships" },
  { label: "Insurance guide", topic: "insurance" },
] as const;

export function MobileNav() {
  const { session } = useAuth();
  const { profile } = useProfile();
  const planningItem = session && profile
    ? { label: "Dashboard", to: "/dashboard" as const }
    : { label: "Start Planning", to: "/onboarding" as const };
  const guestDashboardItem =
    !session && profile ? [{ label: "Dashboard", to: "/dashboard" as const }] : [];
  const items = [navItems[0], ...guestDashboardItem, planningItem, ...navItems.slice(1)];

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
          {items.map((item) => (
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
          <SheetClose asChild>
            <Link
              to="/resources"
              className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Guides
            </Link>
          </SheetClose>
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
