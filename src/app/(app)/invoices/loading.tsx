import { ListSkeleton } from "@/components/app/list-skeleton";

export default function InvoicesLoading() {
  return <ListSkeleton rows={6} columns={5} />;
}
