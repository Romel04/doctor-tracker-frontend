import { Button } from "@/components/ui/button";
import type { Pagination } from "@/lib/types";

export function PaginationControls({
    pagination,
    onPageChange,
    disabled,
}: {
    pagination: Pagination;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}) {
    const { total, page, limit, totalPages } = pagination;
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row">
            <p className="text-muted-foreground">
                Showing {start}-{end} of {total}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
                    Previous
                </Button>
                <span className="px-2">
                    Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
}