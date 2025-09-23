import { HTTP_STATUS, WEATHER_CONSTANTS } from "@/config/constants";

// ISO date format length for extracting hour portion (YYYY-MM-DDTHH)
const ISO_HOUR_LENGTH = 13;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const unit = searchParams.get("unit");

    // 1. Get coordinates for the city
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      return new Response(JSON.stringify({ error: "Invalid location" }), {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const { lat, lon } = geoData[0];

    // 2. Fetch weather data from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&temperature_unit=${
        unit ?? "celsius"
      }`
    );

    if (!weatherRes.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weather = await weatherRes.json();

    // 3. Get current UTC time in ISO format
    const now = new Date();
    const currentHourIso = `${now.toISOString().slice(0, ISO_HOUR_LENGTH)}:00`;

    // 4. Get current temperature
    const index = weather.hourly.time.indexOf(currentHourIso);
    const currentTemperature =
      index !== -1 ? weather.hourly.temperature_2m[index] : null;

    if (currentTemperature === null) {
      return new Response(
        JSON.stringify({ error: "Temperature data unavailable" }),
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return new Response(JSON.stringify({ temperature: currentTemperature }), {
      status: HTTP_STATUS.OK,
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Error getting weather" }), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}

// Mock weather function for testing and demo purposes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location } = body;

    if (!location || typeof location !== "string" || location.trim() === "") {
      return Response.json(
        {
          error:
            "Location parameter is required and must be a non-empty string",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate mock weather data for testing
    const mockWeatherConditions = [
      "sunny",
      "cloudy",
      "partly cloudy",
      "rainy",
      "snowy",
      "windy",
      "foggy",
    ];
    const randomCondition =
      mockWeatherConditions[
        Math.floor(Math.random() * mockWeatherConditions.length)
      ];

    const mockData = {
      location: location.trim(),
      temperature:
        Math.floor(Math.random() * WEATHER_CONSTANTS.TEMPERATURE_RANGE) +
        WEATHER_CONSTANTS.TEMPERATURE_OFFSET, // Random temp between -10 and 50
      condition: randomCondition,
      humidity: Math.floor(Math.random() * WEATHER_CONSTANTS.MAX_HUMIDITY), // 0-100%
      windSpeed: Math.floor(Math.random() * WEATHER_CONSTANTS.MAX_WIND_SPEED), // 0-30 mph
      timestamp: new Date().toISOString(),
    };

    return Response.json(mockData, {
      status: HTTP_STATUS.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (_error) {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
