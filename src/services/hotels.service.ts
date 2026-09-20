import { run } from "../temporal/client.js";
import { getHotelsByPrice } from "../redis/hotels.redis.js";

export const dedupedHotelOffers = async (
  city: string,
  minPrice?: number,
  maxPrice?: number
) => {
  await run(city);

  return await getHotelsByPrice(
    city,
    minPrice,
    maxPrice
  );
};