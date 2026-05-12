"use client";

import Link from "next/link";
import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCustomerAction } from "@/app/actions/customers";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CustomerRowActions({ id, dict }: { id: string; dict: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/customers/${id}`}>{dict.common.edit}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await deleteCustomerAction(id);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Deleted");
                router.refresh();
              }
            });
          }}
        >
          {dict.common.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
