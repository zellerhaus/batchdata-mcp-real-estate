import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Environment variable for API key
const BATCHDATA_API_KEY = process.env.BATCHDATA_API_KEY;
const BATCHDATA_BASE_URL = "https://api.batchdata.com/api/v1";

if (!BATCHDATA_API_KEY) {
  console.error("BATCHDATA_API_KEY environment variable is required");
  process.exit(1);
}

// Create MCP server
const server = new McpServer({
  name: "BatchData Property Server",
  version: "1.0.0"
});

// Common headers for API requests
const getHeaders = () => ({
  "Authorization": `Bearer ${BATCHDATA_API_KEY}`,
  "Content-Type": "application/json"
});

// Helper function to make API requests
async function makeApiRequest(endpoint: string, data: any) {
  const response = await fetch(`${BATCHDATA_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Address Verification Tool
server.tool(
  "verify-address",
  {
    street: z.string().describe("Street address"),
    city: z.string().describe("City name"),
    state: z.string().describe("State name or abbreviation"),
    zip: z.string().describe("ZIP code"),
    requestId: z.string().optional().describe("Optional request ID for tracking")
  },
  async ({ street, city, state, zip, requestId }) => {
    try {
      const result = await makeApiRequest("/address/verify", {
        requests: [{
          street,
          city,
          state,
          zip,
          requestId: requestId || ""
        }]
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error verifying address: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Address Autocomplete Tool
server.tool(
  "autocomplete-address",
  {
    query: z.string().describe("Partial or full address to search"),
    uspsVerified: z.boolean().optional().default(true).describe("Only return USPS verified addresses"),
    skip: z.number().optional().default(0).describe("Number of results to skip"),
    take: z.number().optional().default(4).describe("Number of results to return")
  },
  async ({ query, uspsVerified, skip, take }) => {
    try {
      const result = await makeApiRequest("/address/autocomplete", {
        searchCriteria: { query },
        options: {
          uspsVerifiedAddresses: uspsVerified,
          skip,
          take
        }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error autocompleting address: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Address Geocoding Tool
server.tool(
  "geocode-address",
  {
    address: z.string().describe("Full address to geocode")
  },
  async ({ address }) => {
    try {
      const result = await makeApiRequest("/address/geocode", {
        requests: [{ address }]
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error geocoding address: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Reverse Geocoding Tool
server.tool(
  "reverse-geocode",
  {
    latitude: z.number().describe("Latitude coordinate"),
    longitude: z.number().describe("Longitude coordinate")
  },
  async ({ latitude, longitude }) => {
    try {
      const result = await makeApiRequest("/address/reverse-geocode", {
        request: { latitude, longitude }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error reverse geocoding: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Property Lookup Tool
server.tool(
  "lookup-property",
  {
    street: z.string().optional().describe("Street address"),
    city: z.string().optional().describe("City name"),
    state: z.string().describe("State name or abbreviation"),
    zip: z.string().optional().describe("ZIP code"),
    county: z.string().optional().describe("County name (for APN lookup)"),
    apn: z.string().optional().describe("Assessor Parcel Number"),
    skipTrace: z.boolean().optional().default(false).describe("Include skip trace data")
  },
  async ({ street, city, state, zip, county, apn, skipTrace }) => {
    try {
      let requestData: any = {
        requests: []
      };

      if (apn && county) {
        // APN lookup
        requestData.requests.push({
          address: { county, state },
          apn
        });
      } else if (street) {
        // Street address lookup
        requestData.requests.push({
          address: { street, city, state, zip }
        });
      } else {
        throw new Error("Either provide street address details or APN with county");
      }

      if (skipTrace) {
        requestData.options = { skipTrace: true };
      }

      const result = await makeApiRequest("/property/lookup/sync", requestData);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error looking up property: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Property Search Tool
server.tool(
  "search-properties",
  {
    query: z.string().optional().describe("Location query (city, state, etc.)"),
    compStreet: z.string().optional().describe("Comparison property street address"),
    compCity: z.string().optional().describe("Comparison property city"),
    compState: z.string().optional().describe("Comparison property state"),
    compZip: z.string().optional().describe("Comparison property ZIP"),
    minEstimatedValue: z.number().optional().describe("Minimum estimated property value"),
    maxEstimatedValue: z.number().optional().describe("Maximum estimated property value"),
    minEquityPercent: z.number().optional().describe("Minimum equity percentage"),
    propertyType: z.string().optional().describe("Property type (e.g., 'Single Family')"),
    useDistance: z.boolean().optional().default(false).describe("Use distance-based comparison"),
    distanceMiles: z.number().optional().describe("Distance in miles for comparison"),
    useBedrooms: z.boolean().optional().default(false).describe("Use bedroom count in comparison"),
    minBedrooms: z.number().optional().describe("Minimum bedrooms (relative to comp property)"),
    maxBedrooms: z.number().optional().describe("Maximum bedrooms (relative to comp property)"),
    useBathrooms: z.boolean().optional().default(false).describe("Use bathroom count in comparison"),
    minBathrooms: z.number().optional().describe("Minimum bathrooms (relative to comp property)"),
    maxBathrooms: z.number().optional().describe("Maximum bathrooms (relative to comp property)"),
    useYearBuilt: z.boolean().optional().default(false).describe("Use year built in comparison"),
    minYearBuilt: z.number().optional().describe("Minimum year built (relative to comp property)"),
    maxYearBuilt: z.number().optional().describe("Maximum year built (relative to comp property)"),
    skip: z.number().optional().default(0).describe("Number of results to skip"),
    take: z.number().optional().default(10).describe("Number of results to return"),
    skipTrace: z.boolean().optional().default(false).describe("Include skip trace data")
  },
  async (params) => {
    try {
      let searchCriteria: any = {};
      let options: any = {
        skip: params.skip,
        take: params.take
      };

      // Basic location query
      if (params.query) {
        searchCriteria.query = params.query;
      }

      // Comparison property setup
      if (params.compStreet) {
        searchCriteria.compAddress = {
          street: params.compStreet,
          city: params.compCity,
          state: params.compState,
          zip: params.compZip
        };
      }

      // Valuation filters
      if (params.minEstimatedValue || params.maxEstimatedValue) {
        searchCriteria.valuation = {
          estimatedValue: {}
        };
        if (params.minEstimatedValue) searchCriteria.valuation.estimatedValue.min = params.minEstimatedValue;
        if (params.maxEstimatedValue) searchCriteria.valuation.estimatedValue.max = params.maxEstimatedValue;
      }

      if (params.minEquityPercent) {
        if (!searchCriteria.valuation) searchCriteria.valuation = {};
        searchCriteria.valuation.equityPercent = { min: params.minEquityPercent };
      }

      // Property type filter
      if (params.propertyType) {
        searchCriteria.general = {
          propertyTypeDetail: { equals: params.propertyType }
        };
      }

      // Comparison options
      if (params.useDistance) {
        options.useDistance = true;
        if (params.distanceMiles) options.distanceMiles = params.distanceMiles;
      }

      if (params.useBedrooms) {
        options.useBedrooms = true;
        if (params.minBedrooms !== undefined) options.minBedrooms = params.minBedrooms;
        if (params.maxBedrooms !== undefined) options.maxBedrooms = params.maxBedrooms;
      }

      if (params.useBathrooms) {
        options.useBathrooms = true;
        if (params.minBathrooms !== undefined) options.minBathrooms = params.minBathrooms;
        if (params.maxBathrooms !== undefined) options.maxBathrooms = params.maxBathrooms;
      }

      if (params.useYearBuilt) {
        options.useYearBuilt = true;
        if (params.minYearBuilt !== undefined) options.minYearBuilt = params.minYearBuilt;
        if (params.maxYearBuilt !== undefined) options.maxYearBuilt = params.maxYearBuilt;
      }

      if (params.skipTrace) {
        options.skipTrace = true;
      }

      const requestData = {
        searchCriteria,
        options
      };

      const result = await makeApiRequest("/property/search/sync", requestData);

      // Extract count information if available
      const resultText = JSON.stringify(result, null, 2);
      const totalCount = result.totalCount || result.total || (result.properties ? result.properties.length : 0);
      
      return {
        content: [{
          type: "text",
          text: `Found ${totalCount} properties matching criteria:\n\n${resultText}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error searching properties: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Property Search by Boundaries Tool
server.tool(
  "search-properties-by-boundary",
  {
    nwLatitude: z.number().optional().describe("Northwest bounding box latitude"),
    nwLongitude: z.number().optional().describe("Northwest bounding box longitude"),
    seLatitude: z.number().optional().describe("Southeast bounding box latitude"),
    seLongitude: z.number().optional().describe("Southeast bounding box longitude"),
    centerLatitude: z.number().optional().describe("Center point latitude for radius search"),
    centerLongitude: z.number().optional().describe("Center point longitude for radius search"),
    radiusKilometers: z.number().optional().describe("Search radius in kilometers"),
    minSoldDate: z.string().optional().describe("Minimum last sold date (YYYY-MM-DD)"),
    skip: z.number().optional().default(0).describe("Number of results to skip"),
    take: z.number().optional().default(10).describe("Number of results to return")
  },
  async ({ nwLatitude, nwLongitude, seLatitude, seLongitude, centerLatitude, centerLongitude, radiusKilometers, minSoldDate, skip, take }) => {
    try {
      let searchCriteria: any = {
        address: {}
      };

      // Bounding box search
      if (nwLatitude && nwLongitude && seLatitude && seLongitude) {
        searchCriteria.address.geoLocationBoundingBox = {
          nwGeoPoint: {
            latitude: nwLatitude.toString(),
            longitude: nwLongitude.toString()
          },
          seGeoPoint: {
            latitude: seLatitude.toString(),
            longitude: seLongitude.toString()
          }
        };
      }

      // Radius search
      if (centerLatitude && centerLongitude && radiusKilometers) {
        searchCriteria.address.geoLocationDistance = {
          geoPoint: {
            latitude: centerLatitude,
            longitude: centerLongitude
          },
          distanceKilometers: radiusKilometers
        };
      }

      // Date filter
      if (minSoldDate) {
        searchCriteria.intel = {
          lastSoldDate: {
            minDate: minSoldDate
          }
        };
      }

      const requestData = {
        searchCriteria,
        options: { skip, take }
      };

      const result = await makeApiRequest("/property/search/sync", requestData);

      const totalCount = result.totalCount || result.total || (result.properties ? result.properties.length : 0);
      
      return {
        content: [{
          type: "text",
          text: `Found ${totalCount} properties in specified boundary:\n\n${JSON.stringify(result, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error searching properties by boundary: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Property Count Tool (lightweight search for counts only)
server.tool(
  "count-properties",
  {
    query: z.string().optional().describe("Location query (city, state, etc.)"),
    minEstimatedValue: z.number().optional().describe("Minimum estimated property value"),
    maxEstimatedValue: z.number().optional().describe("Maximum estimated property value"),
    minEquityPercent: z.number().optional().describe("Minimum equity percentage"),
    propertyType: z.string().optional().describe("Property type (e.g., 'Single Family')")
  },
  async ({ query, minEstimatedValue, maxEstimatedValue, minEquityPercent, propertyType }) => {
    try {
      let searchCriteria: any = {};

      if (query) {
        searchCriteria.query = query;
      }

      // Valuation filters
      if (minEstimatedValue || maxEstimatedValue) {
        searchCriteria.valuation = {
          estimatedValue: {}
        };
        if (minEstimatedValue) searchCriteria.valuation.estimatedValue.min = minEstimatedValue;
        if (maxEstimatedValue) searchCriteria.valuation.estimatedValue.max = maxEstimatedValue;
      }

      if (minEquityPercent) {
        if (!searchCriteria.valuation) searchCriteria.valuation = {};
        searchCriteria.valuation.equityPercent = { min: minEquityPercent };
      }

      // Property type filter
      if (propertyType) {
        searchCriteria.general = {
          propertyTypeDetail: { equals: propertyType }
        };
      }

      const requestData = {
        searchCriteria,
        options: {
          skip: 0,
          take: 0  // Only get count, no actual properties
        }
      };

      const result = await makeApiRequest("/property/search/sync", requestData);
      const totalCount = result.totalCount || result.total || 0;

      return {
        content: [{
          type: "text",
          text: `Total properties matching criteria: ${totalCount}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error counting properties: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BatchData MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});