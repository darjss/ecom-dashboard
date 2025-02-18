"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TestErrorPage() {


  return (
    <div className="">
      <Link href="/orders/add">
      <Button>Add Order</Button>
      </Link>
    </div>
  );
}
