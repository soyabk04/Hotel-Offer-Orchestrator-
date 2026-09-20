import type { SupplierName } from "./supplier.types.js";

export interface HotelOffer {
  name: string;
  price: number;
  supplier: SupplierName;
  commissionPct: number;
}