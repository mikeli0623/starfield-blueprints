import React, { useEffect, useMemo, useRef, useState } from "react";
import { Part } from "../util/types";
import {
  formatNumberWithCommas,
  fuzzyFilter,
  dumbSort,
  charSort,
} from "../util/utils";
import { json } from "../util/constants";
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
import Image from "next/image";
import descIcon from "../../public/descending.svg";
import ascIcon from "../../public/ascending.svg";
import IndeterminateCheckbox from "./IndeterminateCheckbox";

interface Props {
  parts: { partName: string; amount: number }[];
}

const FinalPartsTable = ({ parts }: Props) => {
  const [data, setData] = useState<{ part: Part; amount: number }[]>([]);

  useEffect(() => {
    setData(
      parts.map((part) => {
        return { part: json.getPart(part.partName), amount: part.amount };
      })
    );
  }, [parts]);

  const [obtainedRows, setObtainedRows] = useState<{ [key: string]: boolean }>(
    {}
  );

  const columns = useMemo<ColumnDef<{ part: Part; amount: number }, any>[]>(
    () => [
      {
        id: "obtained",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Obtained
          </span>
        ),
        size: 100,
        cell: ({ row }) => (
          <span className="w-full h-full flex justify-center items-center">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </span>
        ),
      },
      {
        accessorKey: "amount",
        id: "amount",
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Amount
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "part.partName",
        id: "partName",
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Part Name
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
        filterFn: "fuzzy",
        sortingFn: "alphanumeric",
        size: 450,
      },
      {
        accessorKey: "part.moduleType",
        id: "moduleType",
        sortDescFirst: false,
        sortingFn: "textCaseSensitive",
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Module Type
          </span>
        ),
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
        size: 200,
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
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "part.skills",
        id: "skills",
        sortingFn: dumbSort,
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Skills
          </span>
        ),
        size: 300,
        cell: (info) => {
          const skills = info.getValue();
          const entries = Object.entries(skills);
          return (
            <span className="w-full h-full flex justify-center items-center">
              {entries.length === 0 ? (
                "N/A"
              ) : (
                <ul className="list-disc">
                  {entries.map(([skill, value]) => (
                    <li key={skill}>{`${skill}: ${value}`}</li>
                  ))}
                </ul>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "part.cost",
        id: "cost",
        sortDescFirst: false,
        header: () => (
          <span className="w-full h-full flex justify-center items-center">
            Cost
          </span>
        ),
        size: 100,
        cell: (info) => (
          <span className="w-full h-full flex justify-center items-center">
            {formatNumberWithCommas(info.getValue())}
          </span>
        ),
      },
    ],
    []
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      rowSelection: obtainedRows,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setObtainedRows,
  });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  return (
    <div className="flex flex-col lg:w-4/5 w-full gap-2 bg-white p-2 shadow rounded-lg overflow-auto">
      <div
        className={`max-h-[70vh] overflow-auto`}
        style={{ height: `${Math.max(rows.length * 90, 90)}px` }}
        ref={tableContainerRef}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
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
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <Image
                                    src={ascIcon}
                                    width={20}
                                    height={20}
                                    alt="ascending"
                                  />
                                ),
                                desc: (
                                  <Image
                                    src={descIcon}
                                    width={20}
                                    height={20}
                                    alt="descending"
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
                  <td className="text-center py-4" colSpan={8}>
                    No parts
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
                      data-index={virtualRow.key}
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
      <div className="self-end font-bold">
        Total Cost:{" "}
        {formatNumberWithCommas(
          data
            .map((part) => part.part.cost * part.amount)
            .reduce((sum, cost) => (sum += cost), 0)
        )}
      </div>
    </div>
  );
};

export default FinalPartsTable;
