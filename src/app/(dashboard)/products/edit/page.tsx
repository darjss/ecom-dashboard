"use client";
import { getProductById } from "@/server/queries";
import { parseAsInteger, useQueryState } from "nuqs";


const Page = () => {
  const [id, setId]= useQueryState("id", parseAsInteger.withDefault(0));
  const product = getProductById(id);
  console.log(product);
  return <div>id: {id}</div>;
};

export default Page;

