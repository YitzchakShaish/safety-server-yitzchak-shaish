import { Request, Response } from "express";
import { getWeatherForLocationAndDateTime } from "../services/weather.service";

export const getWeatherController = async (req: Request, res: Response) => {
  const latitude = parseFloat(String(req.query.lat));
  const longitude = parseFloat(String(req.query.lon));
  const date = String(req.query.date || "");
  const time = String(req.query.time || "12:00");

  if (isNaN(latitude) || isNaN(longitude) || !date) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "יש לספק lat, lon ו-date תקינים",
      data: null
    });
    return;
  }

  try {
    const weather = await getWeatherForLocationAndDateTime(latitude, longitude, date, time);
    res.status(200).json({ success: true, status: 200, data: weather });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "שגיאה בשליפת נתוני מזג אוויר",
      data: null
    });
  }
};
