"use client";
import { EditorContent, BubbleMenu } from "@tiptap/react";
import React from "react";
import Toolbar from "./Toolbar";

interface Props {
  editable?: boolean;
  editor: any;
  error?: boolean;
}

const Editor = ({ editable = true, editor, error = false }: Props) => {
  const editImageLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (
      document.getElementById("image-link-modal") as HTMLDialogElement
    ).showModal();
  };

  const editLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (document.getElementById("link-modal") as HTMLDialogElement).showModal();
  };

  const removeLink = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    },
    [editor]
  );

  return (
    <div
      className={`flex flex-col items-start rounded-lg border border-opacity-20 bg-white shadow ${
        editable
          ? `focus-within:outline focus-within:outline-2 focus-within:outline-[#cbccce] focus-within:outline-offset-2 ${
              error ? "border-error/90 focus-within:outline-error " : ""
            }`
          : ""
      } `}
    >
      {editable && (
        <BubbleMenu
          className="flex items-center gap-2 p-2 rounded-lg bg-white border-2"
          tippyOptions={{ duration: 150 }}
          editor={editor}
          shouldShow={({ editor, view, state, oldState, from, to }) => {
            // only show the bubble menu for links.
            return editor.isActive("link");
          }}
        >
          <button className="btn btn-accent btn-xs" onClick={editLink}>
            Edit
          </button>
          <button className="btn btn-error btn-xs" onClick={removeLink}>
            Remove
          </button>
        </BubbleMenu>
      )}
      {editable && (
        <Toolbar
          editor={editor}
          editLink={editLink}
          editImageLink={editImageLink}
        />
      )}
      <EditorContent editor={editor} className={`w-full border-t-2 `} />
    </div>
  );
};

export default Editor;
