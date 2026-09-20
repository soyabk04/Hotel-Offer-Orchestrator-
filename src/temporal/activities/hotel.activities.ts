import type { HotelOffer } from "../../types/hotels.types.js";

import { supplierAHotels } from "../../suppliers/supplierA.js";
import { supplierBHotels } from "../../suppliers/supplierB.js";

import {
  saveHotelOffers as saveHotelOffersRedis,
} from "../../redis/hotels.redis.js";

export const getSupplierAHotels = async (
  city: string
): Promise<HotelOffer[]> => {
  const normalizedCity = city.trim().toLowerCase();

  return supplierAHotels
    .filter((hotel) => hotel.city.toLowerCase() === normalizedCity)
    .map((hotel) => ({
      name: hotel.name,
      price: hotel.price,
      supplier: "Supplier A",
      commissionPct: hotel.commissionPct,
    }));
};

export const getSupplierBHotels = async (
  city: string
): Promise<HotelOffer[]> => {
  const normalizedCity = city.trim().toLowerCase();

  return supplierBHotels
    .filter((hotel) => hotel.city.toLowerCase() === normalizedCity)
    .map((hotel) => ({
      name: hotel.name,
      price: hotel.price,
      supplier: "Supplier B",
      commissionPct: hotel.commissionPct,
    }));
};

export const getDedupedHotelOffer = async (
  hotelOffers: HotelOffer[]
): Promise<HotelOffer[]> => {
  const hotelMap = new Map<string, HotelOffer>();

  for (const offer of hotelOffers) {
    const hotelName = offer.name.trim().toLowerCase();

    const existing = hotelMap.get(hotelName);

    if (!existing || offer.price < existing.price) {
      hotelMap.set(hotelName, offer);
    }
  }

  return Array.from(hotelMap.values());
};

export const saveHotelOffers = async (
  city: string,
  offers: HotelOffer[]
): Promise<void> => {
  await saveHotelOffersRedis(city, offers);
};