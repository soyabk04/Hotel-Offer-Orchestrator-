export interface SupplierHotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  supplier?:string;
  commissionPct: number;
}

export type SupplierName = "supplierA" | "supplierB";