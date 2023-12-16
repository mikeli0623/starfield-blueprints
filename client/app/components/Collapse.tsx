import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import collapseOpen from "../../public/collapse-open.svg";
import collapseClose from "../../public/collapse-close.svg";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
  title: string;
  empty: boolean;
}

const Collapse = ({ children, title, empty = false }: Props) => {
  const [open, setOpen] = useState(true);

  const variants = {
    color: {
      open: { opacity: 1 },
      collapsed: { opacity: 0 },
    },
    section: {
      open: { opacity: 1, height: "auto", transform: "translateY(0)" },
      collapsed: { opacity: 0, height: 0, transform: "translateY(-20px)" },
    },
  };

  useEffect(() => {
    if (empty) setOpen(false);
  }, [empty]);

  return (
    <div className="w-full flex flex-col-reverse">
      <AnimatePresence initial={false}>
        {open && (
          <motion.section
            className="w-full overflow-hidden bg-base-200 rounded-b-2xl"
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={variants.section}
            transition={{ duration: 0.6, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {children}
          </motion.section>
        )}
      </AnimatePresence>
      <motion.header
        initial={false}
        animate={{
          filter: open && !empty ? "brightness(85%)" : "brightness(100%)",
          borderRadius: open && !empty ? "1rem 1rem 0 0" : "1rem",
        }}
        onClick={() => setOpen(!empty && !open)}
        className="w-full cursor-pointer rounded-2xl bg-base-200 flex items-center px-5 py-4 text-xl font-medium justify-between"
      >
        {title}
        <label className={`swap swap-rotate ${open ? "swap-active" : ""}`}>
          <Image
            src={collapseOpen}
            width={30}
            height={30}
            alt="open"
            className="swap-on"
          />
          <Image
            src={collapseClose}
            width={30}
            height={30}
            alt="close"
            className="swap-off"
          />
        </label>
      </motion.header>
    </div>
  );
};

export default Collapse;
