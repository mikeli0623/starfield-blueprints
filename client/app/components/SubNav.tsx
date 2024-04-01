import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SubNav = ({ children }: Props) => {
  return (
    <nav className="w-full md:grid grid-cols-3 items-center sticky top-16 z-50 p-2 rounded-lg glass hidden">
      {children}
    </nav>
  );
};
export default SubNav;
