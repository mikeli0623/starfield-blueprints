import { useState } from "react";
import Button from "../Button";

interface Props {
  editor: any;
}

export const ImageModal = ({ editor }: Props) => {
  const [imageURL, setImageURL] = useState<string>("");

  const addImage = () => {
    if (imageURL) {
      editor.chain().focus().setImage({ src: imageURL }).run();
      setImageURL("");
    }
  };

  return (
    <dialog id={`image-link-modal`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setImageURL("")}
          >
            ✕
          </button>
        </form>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg truncate">Add Image URL</h3>
          <input
            type="text"
            placeholder="Image URL"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            className="input input-bordered w-full"
          />
          <div className="modal-action">
            <form method="dialog" className="flex justify-between w-full">
              <Button handleClick={() => setImageURL("")}>Cancel</Button>
              <Button className="btn-info" handleClick={addImage}>
                Save
              </Button>
            </form>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setImageURL("")}>close</button>
      </form>
    </dialog>
  );
};
