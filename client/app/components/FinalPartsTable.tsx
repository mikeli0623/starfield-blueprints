import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TableHeader from "./TableHeader";
import { Part } from "../util/types";
import { formatNumberWithCommas } from "../util/util";
import { json } from "../util/constants";
import useOnScreen from "../hooks/useOnScreen";

interface Props {
  parts: { partName: string; amount: number }[];
}

const FinalPartsTable = ({ parts }: Props) => {
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
    return parts
      .map((part) => {
        return { part: json.getPart(part.partName), amount: part.amount };
      })
      .sort(sortFn);
  }, [sortFn, parts]);

  return (
    <table className="table table-lg w-full">
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
          <TableHeader
            handleSort={handleSort}
            name="Skills"
            order={sortOrder}
            isSorted={sortColumn === "skills"}
          />
          <TableHeader
            handleSort={handleSort}
            name="Cost"
            order={sortOrder}
            isSorted={sortColumn === "cost"}
          />
        </tr>
      </thead>
      <tbody>
        {partsArray.length === 0 ? (
          <tr>
            <td className="text-center py-4" colSpan={9}>
              No parts
            </td>
          </tr>
        ) : (
          partsArray.map((part: { part: Part; amount: number }) => {
            return (
              <tr key={part.part.partName}>
                <th />
                <td className="">
                  {
                    parts[
                      partsArray.findIndex(
                        (indexPart) =>
                          indexPart.part.partName === part.part.partName
                      )
                    ].amount
                  }
                </td>
                <td>{part.part.partName}</td>
                <td>{part.part.moduleType}</td>
                <td>{part.part.unlockLevel}</td>
                <td>{part.part.class || "N/A"}</td>
                <td>
                  {part.part.skills ? (
                    <ul className="list-disc pl-4">
                      {Object.entries(part.part.skills).map(
                        ([skill, value]) => (
                          <li key={skill}>{`${skill}: ${value}`}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{formatNumberWithCommas(part.part.cost)}</td>
              </tr>
            );
          })
        )}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={6}></td>
          <td>Total Cost:</td>
          <td>
            {formatNumberWithCommas(
              partsArray
                .map((part) => part.part.cost * part.amount)
                .reduce((sum, cost) => (sum += cost), 0)
            )}
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default FinalPartsTable;
