import { ListSkeleton } from "@/components/app/list-skeleton";

export default function CustomersLoading() {
  return <ListSkeleton rows={6} columns={4} />;
}
