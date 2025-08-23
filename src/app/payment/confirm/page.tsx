import React, { Suspense } from "react";
import ReturnPage from "./Confirm";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReturnPage />;
    </Suspense>
  );
};

export default page;
