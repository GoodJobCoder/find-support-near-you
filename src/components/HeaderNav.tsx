import { NavLink } from "react-router-dom";

const HeaderNav = () => {
  const linkBase =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors";
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      linkBase,
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <NavLink to="/" className="font-semibold tracking-tight">
          CareConnect
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={getLinkClass}>
            Home
          </NavLink>
          <NavLink to="/help" className={getLinkClass}>
            Help Center
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;
