import React, { Suspense } from "react";
import PaymentPage from "./PaymentPage";

const page = () => {
  return (
    <Suspense>
      <PaymentPage />
    </Suspense>
  );
};

export default page;
