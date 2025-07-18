import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { SparePart } from '@/hooks/spare-parts';

interface SparePartsTableProps {
  data: SparePart[];
  loading: boolean;
  total: number;
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (field: string) => void;
  onRowClick?: (sparePart: SparePart) => void;
}

export default function SparePartsTable({ data, loading, total, pageIndex, pageSize, sortBy, sortOrder, onPageChange, onPageSizeChange, onSortChange, onRowClick }: SparePartsTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Supplier Name</TableHead>
            <TableHead>Supplier Phone</TableHead>
            <TableHead>Supplier Address</TableHead>
            <TableHead>Supplier Email</TableHead>
            <TableHead>Transport Time</TableHead>
            <TableHead><button onClick={() => onSortChange('inventoryQuantity')}>Inventory {sortBy === 'inventoryQuantity' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</button></TableHead>
            <TableHead>Estimated Usage</TableHead>
            <TableHead><button onClick={() => onSortChange('sparePartPrice')}>Price {sortBy === 'sparePartPrice' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</button></TableHead>
            <TableHead>Plant</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Lower Bound</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={14}>Loading...</TableCell></TableRow>
          ) : data.length === 0 ? (
            <TableRow><TableCell colSpan={14}>No data</TableCell></TableRow>
          ) : (
            data.map((part: SparePart) => (
              <TableRow 
                key={part.sparePartCode}
                onClick={() => onRowClick?.(part)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                <TableCell>{part.sparePartCode}</TableCell>
                <TableCell>{part.sparePartName}</TableCell>
                <TableCell>{part.supplierName}</TableCell>
                <TableCell>{part.supplierPhone}</TableCell>
                <TableCell>{part.supplierAddress}</TableCell>
                <TableCell>{part.supplierEmail}</TableCell>
                <TableCell>{part.transportTime}</TableCell>
                <TableCell>{part.inventoryQuantity}</TableCell>
                <TableCell>{part.estimatedUsage}</TableCell>
                <TableCell>${part.sparePartPrice}</TableCell>
                <TableCell>{part.plant}</TableCell>
                <TableCell>{part.description}</TableCell>
                <TableCell>{part.lowerBoundInventory}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap gap-4 items-center mt-4 justify-between">
        <div className="flex gap-2 items-center">
          <label>Page Size:</label>
          <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} className="border rounded px-2 py-1">
            {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => onPageChange(1)} disabled={pageIndex === 1}>{'<<'}</Button>
          <Button size="sm" variant="outline" onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex === 1}>Prev</Button>
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageIndex}
            onChange={e => onPageChange(Number(e.target.value))}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span>of {totalPages}</span>
          <Button size="sm" variant="outline" onClick={() => onPageChange(pageIndex + 1)} disabled={pageIndex === totalPages}>Next</Button>
          <Button size="sm" variant="outline" onClick={() => onPageChange(totalPages)} disabled={pageIndex === totalPages}>{'>>'}</Button>
        </div>
        <span>Total: {total}</span>
      </div>
    </div>
  );
} 