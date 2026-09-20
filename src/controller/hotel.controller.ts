import type { Request, Response } from "express";
import { dedupedHotelOffers } from "../services/hotels.service.js";
import { AppError } from "../errors/AppError.js";

export const getHotelsController = async (
  req: Request,
  res: Response
) => {
  const { city, minPrice, maxPrice } = req.query;

  if (typeof city !== "string" || !city.trim()) {
    throw new AppError(
      "city is required",
      400,
      "CITY_REQUIRED"
    );
  }

  const min =
    minPrice !== undefined
      ? Number(minPrice)
      : undefined;

  const max =
    maxPrice !== undefined
      ? Number(maxPrice)
      : undefined;

  if (min !== undefined && Number.isNaN(min)) {
    throw new AppError(
      "minPrice must be a valid number",
      400,
      "INVALID_MIN_PRICE"
    );
  }

  if (max !== undefined && Number.isNaN(max)) {
    throw new AppError(
      "maxPrice must be a valid number",
      400,
      "INVALID_MAX_PRICE"
    );
  }

  if (
    min !== undefined &&
    max !== undefined &&
    min > max
  ) {
    throw new AppError(
      "minPrice cannot be greater than maxPrice",
      400,
      "INVALID_PRICE_RANGE"
    );
  }

  const data = await dedupedHotelOffers(
    city,
    min,
    max
  );

  res.json({
    success: true,
    data,
  });
};