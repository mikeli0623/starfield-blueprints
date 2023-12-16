import Image from "next/image";
import { useCallback } from "react";

const iconSize = 24;
const btnClassName = "btn btn-square btn-sm";
const btnActive = "btn-neutral";
const btnInactive = "btn-ghost";

interface Props {
  editor: any;
  editLink: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editImageLink: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Toolbar = ({ editor, editLink, editImageLink }: Props) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("paragraph") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/paragraph.svg"}
          className={`${editor.isActive("paragraph") ? "svg-white" : ""}`}
          alt="paragraph"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={`${btnClassName} ${
          editor.isActive("heading", { level: 1 }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/h1.svg"}
          className={`${
            editor.isActive("heading", { level: 1 }) ? "svg-white" : ""
          }`}
          alt="h1"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={`${btnClassName} ${
          editor.isActive("heading", { level: 2 }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/h2.svg"}
          className={`${
            editor.isActive("heading", { level: 2 }) ? "svg-white" : ""
          }`}
          alt="h2"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={`${btnClassName} ${
          editor.isActive("heading", { level: 3 }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/h3.svg"}
          className={`${
            editor.isActive("heading", { level: 3 }) ? "svg-white" : ""
          }`}
          alt="h3"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("bold") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/bold.svg"}
          className={`${editor.isActive("bold") ? "svg-white" : ""}`}
          alt="bold"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("italic") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/italic.svg"}
          className={`${editor.isActive("italic") ? "svg-white" : ""}`}
          alt="italic"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("underline") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/underline.svg"}
          className={`${editor.isActive("underline") ? "svg-white" : ""}`}
          alt="underline"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${btnClassName} ${
          editor.isActive("strike") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/strike.svg"}
          className={`${editor.isActive("strike") ? "svg-white" : ""}`}
          alt="strikethrough"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("blockquote") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/blockquote.svg"}
          className={`${editor.isActive("blockquote") ? "svg-white" : ""}`}
          alt="blockquote"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("left").run();
        }}
        className={`${btnClassName} ${
          editor.isActive({ textAlign: "left" }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/align-left.svg"}
          className={`${
            editor.isActive({ textAlign: "left" }) ? "svg-white" : ""
          }`}
          alt="align-left"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("center").run();
        }}
        className={`${btnClassName} ${
          editor.isActive({ textAlign: "center" }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/align-center.svg"}
          className={`${
            editor.isActive({ textAlign: "center" }) ? "svg-white" : ""
          }`}
          alt="align-center"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("right").run();
        }}
        className={`${btnClassName} ${
          editor.isActive({ textAlign: "right" }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/align-right.svg"}
          className={`${
            editor.isActive({ textAlign: "right" }) ? "svg-white" : ""
          }`}
          alt="align-right"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("justify").run();
        }}
        className={`${btnClassName} ${
          editor.isActive({ textAlign: "justify" }) ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/align-justify.svg"}
          className={`${
            editor.isActive({ textAlign: "justify" }) ? "svg-white" : ""
          }`}
          alt="align-justify"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("bulletList") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/list-bullet.svg"}
          className={`${editor.isActive("bulletList") ? "svg-white" : ""}`}
          alt="list-bullet"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`${btnClassName} ${
          editor.isActive("orderedList") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/list-numbered.svg"}
          className={`${editor.isActive("orderedList") ? "svg-white" : ""}`}
          alt="list-numbered"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setHorizontalRule().run();
        }}
        className={`${btnClassName} btn-ghost`}
      >
        <Image
          src={"/editor/rule.svg"}
          alt="horizontal-rule"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setHardBreak().run();
        }}
        className={`${btnClassName} btn-ghost`}
      >
        <Image
          src={"/editor/break.svg"}
          alt="page break"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button onClick={editImageLink} className={`${btnClassName} btn-ghost`}>
        <Image
          src={"/editor/add-photo.svg"}
          alt="add photo"
          width={iconSize}
          height={iconSize}
        />
      </button>
      <button
        onClick={editLink}
        className={`${btnClassName} ${
          editor.isActive("link") ? btnActive : btnInactive
        }`}
      >
        <Image
          src={"/editor/link-on.svg"}
          alt="set link"
          width={iconSize}
          height={iconSize}
        />
      </button>
      {/* <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().unsetLink().run();
        }}
        disabled={!editor.isActive("link")}
        className={`${btnClassName} btn-ghost`}
      >
        <Image
          src={"/editor/link-off.svg"}
          className={`${!editor.isActive("link") ? "svg-muted" : ""}`}
          alt="unset link"
          width={iconSize}
          height={iconSize}
        />
      </button> */}
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().undo().run();
        }}
        disabled={!editor.can().chain().focus().undo().run()}
        className={`${btnClassName} btn-ghost`}
      >
        <Image
          src={"/editor/undo.svg"}
          alt="undo"
          width={iconSize}
          height={iconSize}
          className={`${
            !editor.can().chain().focus().undo().run() ? "svg-muted" : ""
          }`}
        />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().redo().run();
        }}
        disabled={!editor.can().chain().focus().redo().run()}
        className={`${btnClassName} btn-ghost`}
      >
        <Image
          src={"/editor/redo.svg"}
          alt="redo"
          width={iconSize}
          height={iconSize}
          className={`${
            !editor.can().chain().focus().redo().run() ? "svg-muted" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default Toolbar;
