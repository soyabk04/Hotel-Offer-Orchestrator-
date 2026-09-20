import { redis } from "../config/redis.config.js";
import type { HotelOffer } from "../types/hotels.types.js";

const getHotelKey = (city: string) =>
  `hotels:${city.trim().toLowerCase()}`;

export const saveHotelOffers = async (
  city: string,
  offers: HotelOffer[]
): Promise<void> => {
  const key = getHotelKey(city);

  const pipeline = redis.pipeline();

  pipeline.del(key);

  for (const offer of offers) {
    pipeline.zadd(
      key,
      offer.price,
      JSON.stringify(offer)
    );
  }

  const result = await pipeline.exec();

  if (!result) {
    throw new Error("Failed to save hotel offers to Redis");
  }
};

export const getHotelsByPrice = async (
  city: string,
  minPrice?: number,
  maxPrice?: number
): Promise<HotelOffer[]> => {
  const key = getHotelKey(city);

  const min = minPrice === undefined ? "-inf" : String(minPrice);
  const max = maxPrice === undefined ? "+inf" : String(maxPrice);

  const results = await redis.zrange(
    key,
    min,
    max,
    "BYSCORE"
  );

  return results.map((item) => JSON.parse(item) as HotelOffer);
};