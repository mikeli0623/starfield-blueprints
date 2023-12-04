import React, { useCallback, useMemo, useState } from "react";
import { Part } from "../util/types";
import TableHeader from "./TableHeader";
import Button from "./Button";
import Image from "next/image";
import { formatNumberWithCommas } from "../util/util";
import deleteIcon from "../../public/delete.svg";

interface Props {
  parts: { part: Part; amount: number }[];
  setParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
}
const PinnedPartsTable = ({ parts, setParts }: Props) => {
  const [sortColumn, setSortColumn] = useState<keyof Part | "amount" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (column: any) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleRemovePart = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    partName: string
  ) => {
    e.preventDefault();
    setParts(parts.filter((part) => part.part.partName !== partName));
  };

  const sortFn = useCallback(
    (a: { part: Part; amount: number }, b: { part: Part; amount: number }) => {
      if (sortColumn === "amount") {
        if (sortOrder === "desc") return b.amount - a.amount;
        else return a.amount - b.amount;
      }

      const aValue = sortColumn
        ? sortColumn === "partName"
          ? a.part[sortColumn]?.toLowerCase()
          : a.part[sortColumn]
        : undefined;
      const bValue = sortColumn
        ? sortColumn === "partName"
          ? b.part[sortColumn]?.toLowerCase()
          : b.part[sortColumn]
        : undefined;

      if (sortColumn === "skills") {
        const sortedSkillsA = Object.keys(aValue || {}).sort();
        const sortedSkillsB = Object.keys(bValue || {}).sort();

        if (sortOrder === "asc") {
          return sortedSkillsA.join(", ") < sortedSkillsB.join(", ") ? -1 : 1;
        } else {
          return sortedSkillsA.join(", ") > sortedSkillsB.join(", ") ? -1 : 1;
        }
      }

      if (sortColumn === "class") {
        // Special sorting for the "class" property
        const classOrder = ["A", "B", "C", "M"];

        if (sortOrder === "asc") {
          return (
            classOrder.indexOf(aValue as string) -
            classOrder.indexOf(bValue as string)
          );
        } else {
          return (
            classOrder.indexOf(bValue as string) -
            classOrder.indexOf(aValue as string)
          );
        }
      }

      // Sorting logic for unpinned parts
      if (aValue === bValue) {
        return 0;
      }

      if (sortOrder === "desc") {
        return aValue! < bValue! ? -1 : 1;
      } else {
        return aValue! > bValue! ? -1 : 1;
      }
    },
    [sortColumn, sortOrder]
  );

  const partsArray = useMemo(() => {
    return [...parts].sort(sortFn);
  }, [sortFn, parts]);

  const handlePartAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    partName: string
  ) => {
    const amount = Math.min(parseInt(e.target.value), 99);

    if (amount < 0) return;

    const indexOfObjectToUpdate = parts.findIndex(
      (part) => part.part.partName === partName
    );

    const newArray = [...parts];
    newArray[indexOfObjectToUpdate] = {
      ...newArray[indexOfObjectToUpdate],
      amount: amount,
    };

    setParts(newArray);

    if (amount === 0) {
      setParts(parts.filter((part) => part.part.partName !== partName));
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <table className="table table-lg table-pin-rows w-full">
        <thead>
          <tr>
            <th />
            <TableHeader
              name="Amount"
              handleSort={handleSort}
              order={sortOrder}
              isSorted={sortColumn === "amount"}
            />
            <TableHeader
              handleSort={handleSort}
              name="Part Name"
              order={sortOrder}
              isSorted={sortColumn === "partName"}
            />
            <TableHeader
              name="Module Type"
              handleSort={handleSort}
              order={sortOrder}
              isSorted={sortColumn === "moduleType"}
            />
            <TableHeader
              handleSort={handleSort}
              name="Unlock Level"
              order={sortOrder}
              isSorted={sortColumn === "unlockLevel"}
            />
            <TableHeader
              handleSort={handleSort}
              name="Class"
              order={sortOrder}
              isSorted={sortColumn === "class"}
            />
          </tr>
        </thead>
        <tbody>
          {partsArray.length === 0 ? (
            <tr>
              <td className="text-center py-4" colSpan={9}>
                No parts selected. Select them from the table below.
              </td>
            </tr>
          ) : (
            partsArray.map((part: { part: Part; amount: number }) => {
              return (
                <tr key={part.part.partName}>
                  <th>
                    <Button
                      className="btn-square btn-sm btn-outline"
                      handleClick={(e) =>
                        handleRemovePart(e, part.part.partName)
                      }
                    >
                      <Image
                        src={deleteIcon}
                        alt="add"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </th>
                  <td>
                    <input
                      className="input"
                      type="number"
                      max={99}
                      min={0}
                      onBlur={() => {
                        const index = parts.findIndex(
                          (indexPart) =>
                            indexPart.part.partName === part.part.partName
                        );
                        if (Number.isNaN(parts[index].amount)) {
                          const clone = [...parts];
                          clone[index].amount = 1;
                          setParts(clone);
                        }
                      }}
                      value={parts[
                        parts.findIndex(
                          (indexPart) =>
                            indexPart.part.partName === part.part.partName
                        )
                      ].amount.toString()}
                      onChange={(e) => handlePartAmount(e, part.part.partName)}
                    />
                  </td>
                  <td>{part.part.partName}</td>
                  <td>{part.part.moduleType}</td>
                  <td>{part.part.unlockLevel}</td>
                  <td>{part.part.class || "N/A"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PinnedPartsTable;
