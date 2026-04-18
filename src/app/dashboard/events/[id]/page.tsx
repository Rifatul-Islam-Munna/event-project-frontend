import { redirect } from "next/navigation";

type EventIndexPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const buildQueryString = (
  searchParams: Awaited<EventIndexPageProps["searchParams"]>,
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export default async function EventIndexPage({
  params,
  searchParams,
}: EventIndexPageProps) {
  const { id } = await params;
  const queryString = buildQueryString(await searchParams);

  redirect(`/dashboard/events/${id}/guests${queryString}`);
}
