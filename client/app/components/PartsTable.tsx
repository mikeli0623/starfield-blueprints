import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Part } from "../util/types";
import TableHeader from "./TableHeader";
import Button from "./Button";
import Image from "next/image";
import addIcon from "../../public/add.svg";

interface Props {
  parts: Part[];
  setAddedParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
}

const PartsTable = ({ parts, setAddedParts }: Props) => {
  const [sortColumn, setSortColumn] = useState<keyof Part | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (column: any) => {
    if (sortColumn === column) {
      // If clicking on the same column, toggle the sorting order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking on a different column, set it as the new sorting column
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    setSortColumn(null);
    setSortOrder("asc");
  }, [parts]);

  const handleAddPart = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    part: Part
  ) => {
    e.preventDefault();
    setAddedParts((prevParts) => {
      const prevIndex = prevParts.findIndex(
        (prevPart) => prevPart.part.partName === part.partName
      );
      if (prevIndex === -1) {
        return [...prevParts, { part, amount: 1 }];
      } else {
        const prevAmount = prevParts[prevIndex].amount;
        const clone = [...prevParts];
        clone[prevIndex] = { ...clone[prevIndex], amount: prevAmount + 1 };
        return clone;
      }
    });
  };

  const sortFn = useCallback(
    (a: Part, b: Part) => {
      const aValue = sortColumn
        ? sortColumn === "partName"
          ? a[sortColumn]?.toLowerCase()
          : a[sortColumn]
        : undefined;
      const bValue = sortColumn
        ? sortColumn === "partName"
          ? b[sortColumn]?.toLowerCase()
          : b[sortColumn]
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

      // Sorting logic for unpinned parts
      if (aValue === bValue) {
        return 0;
      }

      if (sortOrder === "asc") {
        return aValue! < bValue! ? -1 : 1;
      } else {
        return aValue! > bValue! ? -1 : 1;
      }
    },
    [sortColumn, sortOrder]
  );

  const sortedParts = useMemo(() => {
    return [...parts].sort(sortFn);
  }, [sortFn, parts]);

  return (
    <table className="table table-sm table-pin-rows">
      <thead>
        <tr className="h-[52px]">
          <th></th>
          <TableHeader
            handleSort={handleSort}
            name="Part Name"
            order={sortOrder}
            isSorted={sortColumn === "partName"}
          />
          <TableHeader name="Module Type" />
          <TableHeader name="Class" />
          <th></th>
        </tr>
      </thead>
      <tbody className={`h-[${52 * sortedParts.length}px]`}>
        {sortedParts.length > 0 ? (
          sortedParts.map((part: Part) => {
            return (
              <tr key={part.partName} className="h-[52px]">
                <th>
                  <Button
                    className="btn-square btn-sm btn-outline"
                    handleClick={(e) => handleAddPart(e, part)}
                  >
                    <Image src={addIcon} alt="add" width={22} height={22} />
                  </Button>
                </th>
                <td>{part.partName}</td>
                <td>{part.moduleType}</td>
                <td>{part.class || "N/A"}</td>
                <th></th>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={5} className="text-center">
              No parts found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PartsTable;
