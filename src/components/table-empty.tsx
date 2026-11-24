import { TableCell, TableRow } from "@/components/ui/table";

// Empty table body: says what is going on and, when there is something to do, offers it as a button.
export function TableEmpty({
    colSpan,
    title,
    action,
}: {
    colSpan: number;
    title: string;
    action?: React.ReactNode;
}) {
    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan} className="py-12 text-center">
                <p className="text-sm text-muted-foreground">{title}</p>
                {action && <div className="mt-3">{action}</div>}
            </TableCell>
        </TableRow>
    );
}