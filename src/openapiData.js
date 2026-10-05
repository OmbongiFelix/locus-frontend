import spec from '../openapi.json';

export const openapiSpec = spec;

/**
 * Resolves a $ref pointer like "#/components/schemas/GeocodeResponse"
 */
export function resolveRef(ref, root = openapiSpec) {
  if (!ref || !ref.startsWith('#/')) return null;
  const parts = ref.replace('#/', '').split('/');
  let current = root;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    current = current[part];
  }
  return current;
}

/**
 * Generates sample mock JSON object from schema
 */
export function generateSampleFromSchema(schema, depth = 0) {
  if (!schema || depth > 5) return null;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref);
    return generateSampleFromSchema(resolved, depth + 1);
  }

  if (schema.anyOf) {
    const nonNull = schema.anyOf.find(s => s.type !== 'null') || schema.anyOf[0];
    return generateSampleFromSchema(nonNull, depth);
  }

  if (schema.type === 'object' || schema.properties) {
    const obj = {};
    const props = schema.properties || {};
    for (const [key, propSchema] of Object.entries(props)) {
      obj[key] = generateSampleFromSchema(propSchema, depth + 1);
    }
    return obj;
  }

  if (schema.type === 'array') {
    const itemSample = generateSampleFromSchema(schema.items, depth + 1);
    return [itemSample];
  }

  if (schema.type === 'number') {
    if (schema.title === 'Lat') return -1.286389;
    if (schema.title === 'Lon') return 36.817223;
    if (schema.title === 'Distance M') return 0.0;
    return 0.0;
  }

  if (schema.type === 'integer') return 1;
  if (schema.type === 'boolean') return true;

  if (schema.type === 'string') {
    if (schema.enum) return schema.enum[0];
    if (schema.format === 'date') return '2022-01-01';
    if (schema.title === 'County Name') return 'Nairobi';
    if (schema.title === 'Constituency') return 'Westlands';
    if (schema.title === 'Ward Name') return 'Kilimani';
    if (schema.title === 'Boundary Version') return 'gadm41-ken-2022';
    return 'string';
  }

  return null;
}

/**
 * Normalizes all endpoints from the OpenAPI paths object
 */
export function getEndpoints() {
  const endpoints = [];
  const paths = openapiSpec.paths || {};

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        let category = 'General';
        if (path.includes('/geocode')) category = 'Reverse Geocoding';
        else if (path.includes('/boundaries')) category = 'Boundaries';
        else if (path.includes('/health')) category = 'System & Health';

        endpoints.push({
          id: `${method.toUpperCase()}:${path}`,
          path,
          method: method.toUpperCase(),
          summary: op.summary || path,
          description: op.description || '',
          operationId: op.operationId || '',
          parameters: op.parameters || [],
          requestBody: op.requestBody || null,
          responses: op.responses || {},
          category,
          tags: op.tags || [category]
        });
      }
    }
  }

  return endpoints;
}

/**
 * Extracts all schema components for the Schemas reference section
 */
export function getSchemas() {
  return openapiSpec.components?.schemas || {};
}

/**
 * Kenyan preset locations for testing
 */
export const KENYA_PRESETS = [
  {
    name: 'Nairobi — Kilimani',
    lat: -1.286389,
    lon: 36.817223,
    desc: 'High-density urban residential & commercial hub'
  },
  {
    name: 'Nairobi — CBD (Kenyatta Ave)',
    lat: -1.28333,
    lon: 36.82194,
    desc: 'Central Business District, Starehe Constituency'
  },
  {
    name: 'Mombasa — Old Town / Island',
    lat: -4.043477,
    lon: 39.668206,
    desc: 'Coastal county, Tononoka Ward'
  },
  {
    name: 'Kisumu — Lake Basin Central',
    lat: -0.091702,
    lon: 34.767956,
    desc: 'Western hub on Lake Victoria'
  },
  {
    name: 'Nakuru — Rift Valley',
    lat: -0.303099,
    lon: 36.080026,
    desc: 'Great Rift Valley urban center'
  },
  {
    name: 'Eldoret — Uasin Gishu',
    lat: 0.514277,
    lon: 35.269779,
    desc: 'North Rift commercial capital'
  }
];
