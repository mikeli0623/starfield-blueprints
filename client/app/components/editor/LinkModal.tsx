import React, { useCallback, useEffect, useState } from "react";
import Button from "../Button";

interface Props {
  editor: any;
  link: string;
}

function isValidUrl(url: string): boolean {
  const urlRegex = /^(http|https):\/\/[^ "]+$/;

  return urlRegex.test(url);
}

const LinkModal = ({ editor, link }: Props) => {
  const [url, setUrl] = useState<string>("");
  const [validUrl, setValidUrl] = useState<boolean>(true);

  useEffect(() => {
    setUrl(link);
    setValidUrl(isValidUrl(link));
  }, [link]);

  const saveLink = useCallback(() => {
    if (url) {
      if (isValidUrl(url)) {
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({
            href: url,
            target: "_blank",
          })
          .run();
      }
    } else {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  }, [editor, url]);

  return (
    <dialog id={`link-modal`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg truncate">
            {link ? "Edit" : "Add"} Link
          </h3>
          <input
            type="text"
            placeholder="https://www.example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setValidUrl(isValidUrl(e.target.value) || !e.target.value);
            }}
            className="input input-bordered w-full"
          />
          {!validUrl && "Not valid url"}
          <div className="modal-action">
            <form method="dialog" className="flex justify-between w-full">
              <Button>Cancel</Button>
              <Button
                className="btn-info"
                handleClick={saveLink}
                disabled={!validUrl && url.length > 0}
              >
                Save
              </Button>
            </form>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
export default LinkModal;
