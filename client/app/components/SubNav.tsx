import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SubNav = ({ children }: Props) => {
  return (
    <nav className="w-full grid grid-cols-3 items-center sticky top-16 z-50 p-2 rounded-lg glass">
      {children}
    </nav>
  );
};
export default SubNav;
