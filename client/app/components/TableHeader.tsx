import Image from "next/image";
import React from "react";
import descIcon from "../../public/descending.svg";
import ascIcon from "../../public/ascending.svg";

function combineAndCapitalize(strings: string[]): string {
  if (strings.length === 0) {
    return "";
  }

  const [first, ...rest] = strings;

  const combined = rest
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join("");

  return first + combined;
}

const TableHeader = ({
  handleSort = undefined,
  name,
  order,
  isSorted = false,
}: {
  handleSort?: (name: string) => void;
  name: string;
  order?: "asc" | "desc";
  isSorted?: boolean;
}) => {
  return (
    <td
      onClick={() =>
        handleSort
          ? handleSort(combineAndCapitalize(name.toLowerCase().split(" ")))
          : {}
      }
      className={`${handleSort ? "cursor-pointer" : ""}`}
    >
      <div className="flex gap-1 items-center">
        {name}
        {isSorted &&
          (order === "asc" ? (
            <Image src={descIcon} width={20} height={20} alt="descending" />
          ) : (
            <Image src={ascIcon} width={20} height={20} alt="ascending" />
          ))}
      </div>
    </td>
  );
};

export default TableHeader;
