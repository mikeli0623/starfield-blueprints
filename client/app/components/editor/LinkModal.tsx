import { useCallback, useEffect, useState } from "react";
import Button from "../Button";

interface Props {
  editor: any;
}

const LinkModal = ({ editor }: Props) => {
  const [url, setUrl] = useState<string>(
    editor?.getAttributes("link").href ?? ""
  );

  const saveLink = useCallback(() => {
    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank" })
        .run();
    } else {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setUrl("");
  }, [editor, url]);

  return (
    <dialog id={`link-modal`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setUrl("")}
          >
            ✕
          </button>
        </form>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg truncate">Edit Link</h3>
          <input
            type="text"
            placeholder="Enter a link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input input-bordered w-full"
          />
          <div className="modal-action">
            <form method="dialog" className="flex justify-between w-full">
              <Button handleClick={() => setUrl("")}>Cancel</Button>
              <Button className="btn-info" handleClick={saveLink}>
                Save
              </Button>
            </form>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setUrl("")}>close</button>
      </form>
    </dialog>
  );
};
export default LinkModal;
