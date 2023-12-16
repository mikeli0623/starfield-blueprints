import React, { useMemo, useRef, useState } from "react";
import { Part } from "../util/types";
import Button from "./Button";
import Image from "next/image";
import deleteIcon from "../../public/delete.svg";
import descIcon from "../../public/descending.svg";
import ascIcon from "../../public/ascending.svg";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnFiltersState,
  getSortedRowModel,
  Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { charSort, fuzzyFilter } from "../util/utils";

interface InputProps {
  partName: string;
  value: number;
  parts: { part: Part; amount: number }[];
  setParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
  handleRemovePart: (partName: string) => void;
}

const PartAmountInput = ({
  partName,
  value,
  parts,
  setParts,
  handleRemovePart,
}: InputProps) => {
  const [amount, setAmount] = useState<number>(value);

  return (
    <input
      className="input"
      type="number"
      max={99}
      min={0}
      onBlur={() => {
        if (amount === 0 || Number.isNaN(amount)) {
          handleRemovePart(partName);
        } else {
          const indexOfObjectToUpdate = parts.findIndex(
            (part) => part.part.partName === partName
          );

          const newArray = [...parts];
          newArray[indexOfObjectToUpdate] = {
            ...newArray[indexOfObjectToUpdate],
            amount: amount,
          };

          setParts(newArray);
        }
      }}
      value={amount}
      onChange={(e) => setAmount(Math.min(parseInt(e.target.value), 99))}
    />
  );
};

interface Props {
  parts: { part: Part; amount: number }[];
  setParts: React.Dispatch<
    React.SetStateAction<{ part: Part; amount: number }[]>
  >;
  handleRemovePart: (partName: string) => void;
}

const PinnedPartsTable = ({ parts, setParts, handleRemovePart }: Props) => {
  const columns = useMemo<ColumnDef<{ part: Part; amount: number }, any>[]>(
    () => [
      {
        id: "delete",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Delete
          </span>
        ),
        size: 100,
        cell: ({ row }) => (
          <span className="w-full h-full flex justify-center items-center">
            <Button
              className="btn-square btn-sm btn-outline"
              handleClick={(e) => {
                e.preventDefault();
                handleRemovePart(row.original.part.partName);
              }}
            >
              <Image src={deleteIcon} alt="add" width={20} height={20} />
            </Button>
          </span>
        ),
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Amount
          </span>
        ),
        size: 150,
        sortDescFirst: false,
        cell: (info) => (
          <div className="w-full h-full flex justify-center items-center">
            <PartAmountInput
              parts={parts}
              setParts={setParts}
              partName={info.row.original.part.partName}
              value={info.getValue()}
              handleRemovePart={handleRemovePart}
            />
          </div>
        ),
      },
      {
        accessorKey: "part.partName",
        id: "partName",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Part Name
          </span>
        ),
        size: 450,
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
        filterFn: "fuzzy",
        sortDescFirst: false,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "part.moduleType",
        id: "moduleType",
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Module Type
          </span>
        ),
        size: 250,
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "part.unlockLevel",
        id: "unlockLevel",
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Level
          </span>
        ),
        size: 100,
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "part.class",
        id: "class",
        sortingFn: charSort,
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Class
          </span>
        ),
        size: 100,
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
    ],
    [handleRemovePart, parts, setParts]
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: parts,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef(null);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 81,
    overscan: 5,
  });

  return (
    <div
      className="min-h-[100px] max-h-[75vh] w-[1150px] flex flex-col overflow-auto"
      ref={tableContainerRef}
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-1"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <Image
                                  src={descIcon}
                                  width={20}
                                  height={20}
                                  alt="descending"
                                />
                              ),
                              desc: (
                                <Image
                                  src={ascIcon}
                                  width={20}
                                  height={20}
                                  alt="ascending"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().length === 0 ? (
              <tr>
                <td className="text-center py-4" colSpan={6}>
                  No parts selected. Select them from the table below.
                </td>
              </tr>
            ) : (
              virtualizer.getVirtualItems().map((virtualRow, index) => {
                const row = rows[virtualRow.index] as Row<{
                  part: Part;
                  amount: number;
                }>;
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-500/20`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${
                        virtualRow.start - index * virtualRow.size
                      }px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PinnedPartsTable;
