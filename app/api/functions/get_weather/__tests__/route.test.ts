import { NextRequest } from "next/server";
import { vi } from "vitest";
import { HTTP_STATUS, TEST_CONSTANTS } from "@/config/constants";
import { POST } from "../route";

describe("/api/functions/get_weather", () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  it("should return weather data for valid location", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: "New York",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.OK);
    const data = await response.json();

    expect(data).toHaveProperty("location", "New York");
    expect(data).toHaveProperty("temperature");
    expect(data).toHaveProperty("condition");
    expect(data).toHaveProperty("humidity");
    expect(data).toHaveProperty("windSpeed");
    expect(data).toHaveProperty("timestamp");

    // Verify data types
    expect(typeof data.temperature).toBe("number");
    expect(typeof data.condition).toBe("string");
    expect(typeof data.humidity).toBe("number");
    expect(typeof data.windSpeed).toBe("number");
    expect(typeof data.timestamp).toBe("string");
  });

  it("should handle different location formats", async () => {
    const locations = [
      "London",
      "Tokyo, Japan",
      "San Francisco, CA",
      "90210", // ZIP code
      "51.5074, -0.1278", // Coordinates
    ];

    for (const location of locations) {
      const request = new NextRequest(
        "http://localhost/api/functions/get_weather",
        {
          method: "POST",
          body: JSON.stringify({ location }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(HTTP_STATUS.OK);

      const data = await response.json();
      expect(data.location).toBe(location);
    }
  });

  it("should handle missing location parameter", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error.toLowerCase()).toContain("location");
  });

  it("should handle empty location parameter", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: "",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should handle invalid JSON body", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: "invalid json",
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should return realistic weather conditions", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: "Miami",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // Check that temperature is within realistic range
    expect(data.temperature).toBeGreaterThanOrEqual(
      TEST_CONSTANTS.MIN_TEMPERATURE_CELSIUS
    );
    expect(data.temperature).toBeLessThanOrEqual(
      TEST_CONSTANTS.MAX_TEMPERATURE_CELSIUS
    );

    // Check that humidity is within valid percentage range
    expect(data.humidity).toBeGreaterThanOrEqual(
      TEST_CONSTANTS.MIN_HUMIDITY_PERCENT
    );
    expect(data.humidity).toBeLessThanOrEqual(
      TEST_CONSTANTS.MAX_HUMIDITY_PERCENT
    );

    // Check that wind speed is non-negative
    expect(data.windSpeed).toBeGreaterThanOrEqual(0);

    // Check that condition is one of expected values
    const validConditions = [
      "sunny",
      "cloudy",
      "partly cloudy",
      "rainy",
      "snowy",
      "windy",
      "foggy",
    ];
    expect(validConditions).toContain(data.condition);
  });

  it("should return consistent data for same location", async () => {
    const location = "Paris";
    const requests = Array.from(
      { length: 3 },
      () =>
        new NextRequest("http://localhost/api/functions/get_weather", {
          method: "POST",
          body: JSON.stringify({ location }),
        })
    );

    const responses = await Promise.all(requests.map((req) => POST(req)));
    const dataArray = await Promise.all(responses.map((res) => res.json()));

    // All responses should have the same location
    for (const data of dataArray) {
      expect(data.location).toBe(location);
    }

    // Should have consistent data structure
    for (const data of dataArray) {
      expect(data).toHaveProperty("temperature");
      expect(data).toHaveProperty("condition");
      expect(data).toHaveProperty("humidity");
      expect(data).toHaveProperty("windSpeed");
      expect(data).toHaveProperty("timestamp");
    }
  });

  it("should handle special characters in location", async () => {
    const specialLocations = [
      "São Paulo",
      "北京", // Beijing in Chinese
      "Москва", // Moscow in Russian
      "القاهرة", // Cairo in Arabic
    ];

    for (const location of specialLocations) {
      const request = new NextRequest(
        "http://localhost/api/functions/get_weather",
        {
          method: "POST",
          body: JSON.stringify({ location }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(HTTP_STATUS.OK);

      const data = await response.json();
      expect(data.location).toBe(location);
    }
  });

  it("should handle very long location names", async () => {
    const longLocation = "A".repeat(TEST_CONSTANTS.LONG_LOCATION_LENGTH);

    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: longLocation,
        }),
      }
    );

    const response = await POST(request);

    // Should handle gracefully, either return data or appropriate error
    expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );
  });

  it("should include valid timestamp", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: "Seattle",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // Check that timestamp is a valid ISO string
    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();

    // Check that timestamp is recent (within last few seconds)
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - timestamp.getTime());
    expect(timeDiff).toBeLessThan(TEST_CONSTANTS.TIMESTAMP_TOLERANCE_MS); // Less than 5 seconds
  });

  it("should handle null location", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: null,
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should handle location as non-string", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: 12_345,
        }),
      }
    );

    const response = await POST(request);

    // Should either accept and convert to string or return error
    expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );
  });

  it("should return proper Content-Type header", async () => {
    const request = new NextRequest(
      "http://localhost/api/functions/get_weather",
      {
        method: "POST",
        body: JSON.stringify({
          location: "Boston",
        }),
      }
    );

    const response = await POST(request);

    expect(response.headers.get("Content-Type")).toContain("application/json");
  });
});
