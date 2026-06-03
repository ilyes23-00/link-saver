import type { LinkStatus } from "@/types/link";

type Props = {
  status: LinkStatus;
};

export default function StatusBadge({
  status,
}: Props) {
  const styles = {
    pending:
      "border-yellow-200 bg-yellow-50 text-yellow-800",
    fetching:
      "border-sky-200 bg-sky-50 text-sky-700",
    done:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    failed:
      "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        styles[
          status as keyof typeof styles
        ]
      }`}
    >
      {status}
    </span>
  );
}
