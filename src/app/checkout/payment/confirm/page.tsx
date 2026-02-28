import React, { Suspense } from "react";
import ConfirmPage from "./ConfirmPage";

const page = () => {
  return (
    <Suspense>
      <ConfirmPage />
    </Suspense>
  );
};

export default page;
