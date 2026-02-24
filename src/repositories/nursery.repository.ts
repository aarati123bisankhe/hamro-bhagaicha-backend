import { PipelineStage } from "mongoose";
import { INursery, NurseryModel } from "../models/nursery.model";

export interface NurseriesPaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NurseryListItem {
  _id: string;
  name: string;
  address: string;
  city?: string;
  description?: string;
  phoneNumber?: string;
  imageUrl?: string;
  rating?: number;
  tags: string[];
  location: {
    lat: number;
    lng: number;
  };
  distanceKm: number | null;
}

export interface NurseriesListResponse {
  nurseries: NurseryListItem[];
  pagination: NurseriesPaginationMeta;
}

export interface FindNurseriesParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page: number;
  size: number;
  search?: string;
}

const toNurseryListItem = (doc: any): NurseryListItem => ({
  _id: String(doc._id),
  name: doc.name,
  address: doc.address,
  city: doc.city,
  description: doc.description,
  phoneNumber: doc.phoneNumber,
  imageUrl: doc.imageUrl,
  rating: doc.rating,
  tags: Array.isArray(doc.tags) ? doc.tags : [],
  location: {
    lng: doc.location?.coordinates?.[0],
    lat: doc.location?.coordinates?.[1],
  },
  distanceKm:
    typeof doc.distanceInMeters === "number"
      ? Number((doc.distanceInMeters / 1000).toFixed(2))
      : null,
});

export class NurseryRepository {
  async createNursery(nurseryData: Partial<INursery>): Promise<INursery> {
    const nursery = new NurseryModel(nurseryData);
    await nursery.save();
    return nursery;
  }

  async getNurseries(params: FindNurseriesParams): Promise<NurseriesListResponse> {
    const { lat, lng, radiusKm = 20, page, size, search } = params;
    const skip = (page - 1) * size;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
          ],
        }
      : {};

    if (lat !== undefined && lng !== undefined) {
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceInMeters",
            spherical: true,
            maxDistance: radiusKm * 1000,
            query: searchQuery,
          },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: size }],
            meta: [{ $count: "total" }],
          },
        },
      ];

      const [result] = await NurseryModel.aggregate(pipeline);
      const docs = result?.data ?? [];
      const total = result?.meta?.[0]?.total ?? 0;
      const totalPages = Math.ceil(total / size) || 1;

      return {
        nurseries: docs.map(toNurseryListItem),
        pagination: {
          page,
          size,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    const [nurseries, total] = await Promise.all([
      NurseryModel.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(size),
      NurseryModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / size) || 1;
    return {
      nurseries: nurseries.map((nursery) => toNurseryListItem(nursery.toObject())),
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
