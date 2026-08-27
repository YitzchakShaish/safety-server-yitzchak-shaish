import { Request, Response } from "express";
import { searchAddress, reverseGeocode } from "../services/geo.service";

export const searchAddressController = async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    res.status(200).json({ success: true, status: 200, data: [] });
    return;
  }

  try {
    const results = await searchAddress(q);
    res.status(200).json({ success: true, status: 200, data: results });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "שגיאה בחיפוש כתובת",
      data: null
    });
  }
};

export const reverseGeocodeController = async (req: Request, res: Response) => {
  const latitude = parseFloat(String(req.query.lat));
  const longitude = parseFloat(String(req.query.lon));

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "יש לספק lat ו-lon תקינים",
      data: null
    });
    return;
  }

  try {
    const result = await reverseGeocode(latitude, longitude);
    res.status(200).json({ success: true, status: 200, data: result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "שגיאה באיתור כתובת לפי מיקום",
      data: null
    });
  }
};
