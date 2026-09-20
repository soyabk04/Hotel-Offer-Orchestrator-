import {supplierAHotels} from '../suppliers/supplierA.js'
import {supplierBHotels} from '../suppliers/supplierB.js'
import type { SupplierName } from '../types/supplier.types.js';

const suppliers = {
  supplierA: supplierAHotels,
  supplierB: supplierBHotels,
};

export const getHotelsOfSupplier = (supplier:SupplierName) => {
  const data= suppliers[supplier];
  console.log(data)
  if (!data){
    null
  }
  return data
};