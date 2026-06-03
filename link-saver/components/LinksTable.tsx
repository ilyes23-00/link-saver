import StatusBadge from "./StatusBadge";
import type { LinkStatus } from "@/types/link";

type Link = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  status: LinkStatus;
  error: string | null;
  createdAt: string;
};

type Props = {
  links: Link[];
};

export default function LinksTable({
  links,
}: Props) {
  if (!links.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-800">
          No links saved yet
        </p>
        <p className="mt-2 text-sm leading-6">
          Paste a URL above to start building your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white">
      <div className="border-b border-slate-200 bg-slate-50/90 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Saved links
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A quick view of fetched metadata and processing status.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-6">
                Status
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-6">
                URL
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-6">
                Title
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-6">
                Description
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-6">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {links.map((link) => (
              <tr
                key={link.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70"
              >
                <td className="px-5 py-4 align-top sm:px-6">
                  <StatusBadge
                    status={link.status}
                  />
                </td>

                <td className="max-w-xs px-5 py-4 align-top sm:px-6">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm font-medium text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-900 hover:decoration-teal-500"
                  >
                    {link.url}
                  </a>
                </td>

                <td className="max-w-xs px-5 py-4 align-top text-sm font-medium text-slate-900 sm:px-6">
                  {link.title ? (
                    link.title
                  ) : link.status ===
                    "failed" ? (
                    <span className="text-rose-700">
                      Metadata fetch failed
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {link.status ===
                      "pending"
                        ? "Queued for processing"
                        : link.status ===
                            "fetching"
                          ? "Fetching metadata"
                          : "-"}
                    </span>
                  )}
                </td>

                <td className="max-w-md px-5 py-4 align-top text-sm leading-6 text-slate-600 sm:px-6">
                  <p className="truncate">
                    {link.description ||
                      link.error ||
                      "-"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-500 sm:px-6">
                  {new Date(
                    link.createdAt
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
