"use client";
import { useState } from "react";
// Configure PDF.js worker

export const PdfShow = ({ link }: { link: string }) => {
  return (
    <>
      <embed
        src={link}
        type="application/pdf"
        width="100%"
        height={"800px"}
        className=" min-h-dvh"
      />
    </>
  );
};
