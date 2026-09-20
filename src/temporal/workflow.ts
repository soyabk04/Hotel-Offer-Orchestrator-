import { proxyActivities } from "@temporalio/workflow";
import type { HotelOffer } from "../types/hotels.types.js";

type HotelActivities = {
  getSupplierAHotels(city: string): Promise<HotelOffer[]>;
  getSupplierBHotels(city: string): Promise<HotelOffer[]>;
  getDedupedHotelOffer(
    offers: HotelOffer[]
  ): Promise<HotelOffer[]>;
  saveHotelOffers(
    city: string,
    offers: HotelOffer[]
  ): Promise<void>;
};

const {
  getSupplierAHotels,
  getSupplierBHotels,
  getDedupedHotelOffer,
  saveHotelOffers,
} = proxyActivities<HotelActivities>({
  startToCloseTimeout: "1 minute",
});

export async function hotelOfferOrchestrationWorkflow(city: string) {

  const [supplierAOffers, supplierBOffers] = await Promise.all([
    getSupplierAHotels(city),
    getSupplierBHotels(city),
  ]);

  const allOffers: HotelOffer[] = [
    ...supplierAOffers,
    ...supplierBOffers,
  ];

  
  const dedupedOffers =
    await getDedupedHotelOffer(allOffers);

  
  await saveHotelOffers(city, dedupedOffers);

  return dedupedOffers;
}