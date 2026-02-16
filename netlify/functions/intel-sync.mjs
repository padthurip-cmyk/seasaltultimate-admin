const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_ANON_KEY;
const COMPETITORS = [
  { name: "Vellanki Foods", search: "Vellanki Foods pickles Hyderabad", url: "vellankifoods.com", code: "VF", color: "#C2410C" },
  { name: "Tulasi Pickles", search: "Tulasi Pickles Hyderabad", url: "tulasipickles.com", code: "TP", color: "#16A34A" },
  { name: "Aavarampoo Pickles", search: "Aavarampoo Pickles Hyderabad", url: "aavarampoo.com", code: "AP", color: "#7C3AED" },
  { name: "Nirupama Pickles", search: "Nirupama Pickles Hyderabad", url: "nirupamapickles.in", code: "NP", color: "#DC2626" },
  { name: "Priya Pickles", search: "Priya Pickles Hyderabad", url: "priyapickles.com", code: "PP", color: "#0891B2" },
  { name: "Ammas Homemade Pickles", search: "Ammas Homemade Pickles Hyderabad", url: "ammashomemade.in", code: "AH", color: "#EA580C" },
  { name: "Sitara Pickles", search: "Sitara Pickles Hyderabad", url: "sitarapickles.com", code: "SP", color: "#65A30D" },
  { name: "Ruchulu Pickles", search: "Ruchulu Pickles Hyderabad", url: "ruchulupickles.com", code: "RP", color: "#9333EA" },
  { name: "Andhra Pickles", search: "Andhra Pickles online Hyderabad", url: "andhrapickles.co", code: "AC", color: "#0369A1" },
  { name: "Hyderabad Pickles", search: "Hyderabad Pickles online", url: "hyderabadpickles.in", code: "HP", color: "#B91C1C" }
];

const hdrs = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function searchPlace(query) {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.reviews,places.googleMapsUri,places.businessStatus'
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: { circle: { center: { latitude: 17.385, longitude: 78.4867 }, radius: 50000 } },
        maxResultCount: 1
      })
    });
    const data = await res.json();
    return data.places && data.places[0] ? data.places[0] : null;
  } catch (e) {
    console.error('Google error:', e.message);
    return null;
  }
}

async function sbUpsert(table, data) {
  try {
    const res = await fetch(SB_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: hdrs, body: '' };

  const params = event.queryStringParameters || {};
  const action = params.action || 'sync';

  if (action === 'sync') {
    const results = [];
    let revCount = 0;

    for (const comp of COMPETITORS) {
      const place = await searchPlace(comp.search);

      const rec = {
        name: comp.name,
        code: comp.code,
        color: comp.color,
        url: comp.url,
        google_place_id: place ? place.id : null,
        google_rating: place ? (place.rating || 0) : 0,
        google_reviews_count: place ? (place.userRatingCount || 0) : 0,
        google_address: place ? (place.formattedAddress || '') : '',
        google_maps_url: place ? (place.googleMapsUri || '') : '',
        website_url: place ? (place.websiteUri || comp.url) : comp.url,
        business_status: place ? (place.businessStatus || 'UNKNOWN') : 'UNKNOWN',
        active_ads_count: 0,
        last_synced: new Date().toISOString(),
        status: 'active'
      };

      await sbUpsert('competitors', rec);

      if (place && place.reviews) {
        for (const rev of place.reviews.slice(0, 5)) {
          await sbUpsert('competitor_reviews', {
            competitor_name: comp.name,
            author_name: rev.authorAttribution ? rev.authorAttribution.displayName : 'Anonymous',
            rating: rev.rating || 0,
            text: rev.text ? rev.text.text : '',
            publish_time: rev.publishTime || new Date().toISOString(),
            relative_time: rev.relativePublishTimeDescription || '',
            google_review_id: rev.name || (comp.name + '-' + Date.now() + '-' + Math.random())
          });
          revCount++;
        }
      }

      results.push(rec);
    }

    return {
      statusCode: 200,
      headers: hdrs,
      body: JSON.stringify({ success: true, count: results.length, reviews: revCount, synced_at: new Date().toISOString() })
    };
  }

  if (action === 'get') {
    try {
      const [cRes, rRes] = await Promise.all([
        fetch(SB_URL + '/rest/v1/competitors?select=*&order=google_reviews_count.desc', { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }),
        fetch(SB_URL + '/rest/v1/competitor_reviews?select=*&order=publish_time.desc&limit=50', { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } })
      ]);
      const competitors = await cRes.json();
      const reviews = await rRes.json();
      return { statusCode: 200, headers: hdrs, body: JSON.stringify({ competitors, reviews }) };
    } catch (e) {
      return { statusCode: 500, headers: hdrs, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Use ?action=sync or ?action=get' }) };
}
