export interface AddressSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

export const searchAddress = async (query: string): Promise<AddressSuggestion[]> => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("limit", "5");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "safety-server-yitzchak-shaish/1.0",
      "Accept-Language": "he"
    }
  });

  if (!res.ok) {
    throw new Error("שגיאה בחיפוש כתובת");
  }

  const data = await res.json() as any[];

  return data.map((item: any) => ({
    displayName: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon)
  }));
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<AddressSuggestion> => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "safety-server-yitzchak-shaish/1.0",
      "Accept-Language": "he"
    }
  });

  if (!res.ok) {
    throw new Error("שגיאה באיתור כתובת לפי מיקום");
  }

  const data = await res.json() as any;

  if (!data || data.error) {
    throw new Error("לא נמצאה כתובת עבור המיקום שנבחר");
  }

  return {
    displayName: data.display_name,
    latitude,
    longitude
  };
};
