import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  title: string;
  empty: boolean;
  defaultOpen: boolean;
}

const Collapse = ({ children, title, empty = false, defaultOpen }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  const variants = {
    color: {
      open: { opacity: 1 },
      collapsed: { opacity: 0 },
    },
    section: {
      open: { opacity: 1, height: "auto" },
      collapsed: { opacity: 0, height: 0 },
    },
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          filter: open && !empty ? "brightness(85%)" : "brightness(100%)",
          borderRadius: open && !empty ? "1rem 1rem 0 0" : "1rem",
        }}
        onClick={() => setOpen(!empty && !open)}
        className="mt-5 w-full cursor-pointer rounded-2xl bg-base-200 flex items-center px-5 py-4 text-xl font-medium"
      >
        {title}
      </motion.header>
      <AnimatePresence initial={false}>
        {open && (
          <motion.section
            className="w-full grid grid-cols-4 gap-4 px-4 overflow-hidden bg-base-200 rounded-b-2xl"
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
    </>
  );
};

export default Collapse;
