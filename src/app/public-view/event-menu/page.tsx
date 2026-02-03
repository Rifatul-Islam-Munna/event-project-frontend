import { getOneEvent } from "@/actions/fetch-action";
import React from "react";
import { PdfShow } from "./PdfShow";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const filters = (await searchParams).id as string;

  const { data, error } = await getOneEvent(filters);
  console.log("data-of-pdf->", data);
  return <PdfShow link={data?.pdf ?? ""} />;
};

export default page;
