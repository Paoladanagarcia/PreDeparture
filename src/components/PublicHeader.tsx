import { AppHeader } from "@/components/AppHeader";

type PublicHeaderProps = {
  active?: "home" | "sources" | "profile";
};

export function PublicHeader({ active }: PublicHeaderProps) {
  return <AppHeader active={active} />;
}
