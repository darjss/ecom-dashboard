"use server";
import "server-only";
import { db } from "../db";
import { SalesInsertType, SalesTable } from "../db/schema";

export const addSale = async (sale: SalesInsertType) => {
  try {
    const result = await db.insert(SalesTable).values(sale);
  } catch (e) {
    console.log(e);
  }
};
