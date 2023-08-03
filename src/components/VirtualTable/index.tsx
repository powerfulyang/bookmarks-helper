import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import browser, { Cookies } from 'webextension-polyfill';
import { cn } from '@/lib/utils';
import './index.scss';
import Cookie = Cookies.Cookie;

export const columns: ColumnDef<Cookie>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
];

export const VirtualTable = () => {
  // The scrollable element for your list
  const parentRef = useRef<HTMLDivElement>(null!);

  const { data = [] } = useQuery({
    queryKey: ['cookies'],
    keepPreviousData: true,
    queryFn: async () => {
      const cookies = await browser.cookies.getAll({});
      return cookies;
    },
  });

  const rowVirtual = useVirtualizer({
    count: data.length,
    estimateSize: () => 50,
    getScrollElement: () => parentRef.current,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div ref={parentRef} className={cn('overflow-auto rounded-md border')}>
      <div className="text-sm">
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="flex">
            {headerGroup.headers.map((header) => {
              return (
                <div
                  className="h-12 flex-1 whitespace-pre border-r border-solid border-r-gray-200 px-4 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={cn('max-h-[75vh]')}>
        {table.getRowModel().rows?.length ? (
          <div
            style={{
              height: `${rowVirtual.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtual.getVirtualItems().map((virtualItem) => {
              const row = table.getRowModel().rows[virtualItem.index];
              return (
                <div
                  className="flex items-center border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="border-r border-solid border-r-gray-200 p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-24 text-center">No results.</div>
        )}
      </div>
    </div>
  );
};
