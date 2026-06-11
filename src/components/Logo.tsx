import { Link } from "@tanstack/react-router";
import logo from "@/assets/predeparture-logo-fondblanc.png";

export function Logo({
  className = "h-12 sm:h-14",
  to = "/",
}: {
  className?: string;
  to?: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img src={logo} alt="PreDeparture" className={className} />
    </Link>
  );
}
