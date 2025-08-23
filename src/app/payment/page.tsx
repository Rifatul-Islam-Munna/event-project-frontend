import React, { Suspense } from "react";
import BillingPage from "./Payment";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {" "}
      <BillingPage />{" "}
    </Suspense>
  );
};

export default page;
