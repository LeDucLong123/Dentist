"use client";

import { useState } from "react";

export default function Home() {
  const [submit, setSubmit] = useState<boolean>(false);

  return (
    <main className=" w-screen h-screen flex justify-center items-center">
      <div className="">
        <input className="border rounded-2xl" type="text" name="" id="" />
        <div className="h-2" />
        <div
          className="h-[40] w-full bg-purple-500 rounded-2xl flex justify-center items-center text-white"
          onClick={() => {
            setSubmit(!submit);
          }}
        >
          Submit
        </div>
        {submit && <div>Success !!!</div>}
      </div>
    </main>
  );
}
