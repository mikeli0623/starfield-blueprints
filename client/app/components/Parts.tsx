"use client";
import React, { useCallback, useEffect, useState } from "react";
import PartsTable from "./PartsTable";
import PinnedPartsTable from "./PinnedPartsTable";
import { Part } from "../util/types";
import { json } from "../util/constants";

interface Props {
  addedParts: { part: Part; amount: number }[];
  setAddedParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
}

const Parts = ({ addedParts, setAddedParts }: Props) => {
  const [rowSelection, setRowSelection] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const selectedRows: {
      [key: string]: boolean;
    } = {};
    addedParts.forEach(
      (part) =>
        (selectedRows[String(json.getIndexFromPartName(part.part.partName))] =
          true)
    );
    setRowSelection(selectedRows);
  }, [addedParts]);

  const removePart = useCallback(
    (partName: string) => {
      setAddedParts(
        addedParts.filter((part) => part.part.partName !== partName)
      );
    },
    [addedParts, setAddedParts]
  );

  const handleRowSelection = (key: string) => {
    const part = json.getPartFromIndex(parseInt(key));
    if (!(key in rowSelection)) {
      setAddedParts([...addedParts, { part: part, amount: 1 }]);
    } else {
      removePart(part.partName);
    }
  };

  const handleRemovePart = useCallback(
    (partName: string) => {
      removePart(partName);
    },
    [removePart]
  );

  return (
    <div className="flex flex-col gap-4 items-center">
      <PinnedPartsTable
        parts={addedParts}
        setParts={setAddedParts}
        handleRemovePart={handleRemovePart}
      />
      <PartsTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        handleRowSelection={handleRowSelection}
      />
    </div>
  );
};

export default Parts;
