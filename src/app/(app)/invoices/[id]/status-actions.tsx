"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateInvoiceStatusAction, deleteInvoiceAction } from "@/app/actions/invoices";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { InvoiceStatus } from "@/lib/types";

export function InvoiceStatusActions({
  id,
  status,
  dict,
}: {
  id: string;
  status: InvoiceStatus;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function change(next: InvoiceStatus) {
    start(async () => {
      const res = await updateInvoiceStatusAction(id, next);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(dict.common.save);
        router.refresh();
      }
    });
  }

  function destroy() {
    if (!confirm("Delete this invoice?")) return;
    start(async () => {
      const res = await deleteInvoiceAction(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(dict.common.delete);
        router.push("/invoices");
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status !== "draft" && <DropdownMenuItem onSelect={() => change("draft")}>{dict.invoices.markDraft}</DropdownMenuItem>}
        {status !== "sent" && <DropdownMenuItem onSelect={() => change("sent")}>{dict.invoices.markSent}</DropdownMenuItem>}
        {status !== "paid" && <DropdownMenuItem onSelect={() => change("paid")}>{dict.invoices.markPaid}</DropdownMenuItem>}
        {status !== "void" && <DropdownMenuItem onSelect={() => change("void")}>{dict.invoices.markVoid}</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={destroy} className="text-destructive focus:text-destructive">
          {dict.common.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
