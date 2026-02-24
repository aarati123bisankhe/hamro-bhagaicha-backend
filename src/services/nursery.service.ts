import {
  NurseryListItem,
  NurseryRepository,
  NurseriesListResponse,
} from "../repositories/nursery.repository";
import { NurseriesQueryDto } from "../dtos/nursery.dto";

const fallbackNurseries: NurseryListItem[] = [
  {
    _id: "fallback-1",
    name: "Green Valley Nursery",
    address: "Budhanilkantha Road",
    city: "Kathmandu",
    description: "Seasonal plants, seeds, and garden supplies.",
    phoneNumber: "+9779800000001",
    imageUrl: "",
    rating: 4.5,
    tags: ["ornamental", "indoor", "outdoor"],
    location: { lat: 27.7718, lng: 85.3625 },
    distanceKm: null,
  },
  {
    _id: "fallback-2",
    name: "Lalitpur Plant Hub",
    address: "Jawalakhel",
    city: "Lalitpur",
    description: "Urban gardening, pots, and compost.",
    phoneNumber: "+9779800000002",
    imageUrl: "",
    rating: 4.2,
    tags: ["pots", "compost", "garden-tools"],
    location: { lat: 27.6727, lng: 85.3188 },
    distanceKm: null,
  },
];

export interface NurseriesApiResponse extends NurseriesListResponse {
  fallback: {
    used: boolean;
    reason?: string;
  };
}

const haversineKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) *
      Math.cos(toRad(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export class NurseryService {
  private nurseryRepository = new NurseryRepository();

  async getNurseries(query: NurseriesQueryDto): Promise<NurseriesApiResponse> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;

    try {
      const response = await this.nurseryRepository.getNurseries({
        lat: query.lat,
        lng: query.lng,
        radiusKm: query.radiusKm,
        page,
        size,
        search: query.search,
      });

      if (response.nurseries.length > 0 || query.search) {
        return {
          ...response,
          fallback: { used: false },
        };
      }

      return this.buildFallbackResponse(query, page, size, "No nurseries in database yet");
    } catch (error) {
      return this.buildFallbackResponse(
        query,
        page,
        size,
        "Nursery endpoint fallback used because DB query failed"
      );
    }
  }

  private buildFallbackResponse(
    query: NurseriesQueryDto,
    page: number,
    size: number,
    reason: string
  ): NurseriesApiResponse {
    let data = fallbackNurseries;

    if (query.search) {
      const keyword = query.search.toLowerCase();
      data = data.filter(
        (nursery) =>
          nursery.name.toLowerCase().includes(keyword) ||
          nursery.address.toLowerCase().includes(keyword) ||
          (nursery.city ?? "").toLowerCase().includes(keyword) ||
          nursery.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    if (query.lat !== undefined && query.lng !== undefined) {
      const radiusKm = query.radiusKm ?? 20;
      data = data
        .map((nursery) => {
          const distanceKm = haversineKm(
            query.lat as number,
            query.lng as number,
            nursery.location.lat,
            nursery.location.lng
          );
          return {
            ...nursery,
            distanceKm: Number(distanceKm.toFixed(2)),
          };
        })
        .filter((nursery) => (nursery.distanceKm ?? 0) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    const total = data.length;
    const totalPages = Math.ceil(total / size) || 1;
    const start = (page - 1) * size;
    const paged = data.slice(start, start + size);

    return {
      nurseries: paged,
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      fallback: {
        used: true,
        reason,
      },
    };
  }
}
