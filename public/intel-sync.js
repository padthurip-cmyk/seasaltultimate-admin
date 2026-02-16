// netlify/functions/intel-sync.js
// Fetches live competitor data from Google Places API and stores in Supabase
// Endpoint: /.netlify/functions/intel-sync

const GOOGLE_PLACES_KEY = 'AIzaSyA33gWiI28GPZw2v-sOYYcyEyMTz9Lm5s8';
const SUPABASE_URL = 'https://yosjbsncvghpscsrvxds.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2pic25jdmdocHNjc3J2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzI4MTMsImV4cCI6MjA1MzkwODgxM30.yGMPq3C_Zbs1S_GBJCsjH67W4TYj7QHZE_9EhfjhsXA';

// Top 10 Telangana pickle competitors - Google Place IDs
// These need to be looked up once via Google Places Text Search
const COMPETITORS = [
  { name: "Vellanki Foods", search: "Vellanki Foods pickles Hyderabad", url: "vellankifoods.com", code: "VF", color: "#C2410C" },
  { name: "Tulasi Pickles", search: "Tulasi Pickles Hyderabad", url: "tulasipickles.com", code: "TP", color: "#16A34A" },
  { name: "Aavarampoo Pickles", search: "Aavarampoo Pickles", url: "aavarampoo.com", code: "AP", color: "#7C3AED" },
  { name: "Nirupama Pickles", search: "Nirupama Pickles Hyderabad", url: "nirupamapickles.in", code: "NP", color: "#DC2626" },
  { name: "Priya Pickles", search: "Priya Pickles Hyderabad", url: "priyapickles.com", code: "PP", color: "#0891B2" },
  { name: "Amma's Homemade Pickles", search: "Ammas Homemade Pickles Hyderabad", url: "ammashomemade.in", code: "AH", color: "#EA580C" },
  { name: "Sitara Pickles", search: "Sitara Pickles Hyderabad", url: "sitarapickles.com", code: "SP", color: "#65A30D" },
  { name: "Ruchulu Pickles", search: "Ruchulu Pickles Hyderabad", url: "ruchulupickles.com", code: "RP", color: "#9333EA" },
  { name: "Andhra Pickles", search: "Andhra Pickles online Hyderabad", url: "andhrapickles.co", code: "AC", color: "#0369A1" },
  { name: "Hyderabad Pickles", search: "Hyderabad Pickles online", url: "hyderabadpickles.in", code: "HP", color: "#B91C1C" }
];

// Helper: Fetch from Google Places API (New)
async function searchPlace(query) {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.currentOpeningHours,places.reviews,places.googleMapsUri,places.businessStatus'
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: 17.385, longitude: 78.4867 }, // Hyderabad
            radius: 50000 // 50km
          }
        },
        maxResultCount: 1
      })
    });
    const data = await res.json();
    return data.places && data.places[0] ? data.places[0] : null;
  } catch (e) {
    console.error('Google Places error:', e);
    return null;
  }
}

// Helper: Upsert into Supabase
async function supabaseUpsert(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error('Supabase error:', e);
    return false;
  }
}

// Helper: Fetch Meta Ad Library
async function fetchMetaAds(brandName) {
  try {
    // Meta Ad Library public search — no API key needed for basic access
    const res = await fetch(`https://www.facebook.com/ads/library/async/search_ads/?q=${encodeURIComponent(brandName + ' pickle')}&country=IN&active_status=active&ad_type=all&media_type=all`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const text = await res.text();
      // Count active ads from response
      const adCount = (text.match(/"adArchiveID"/g) || []).length;
      return { activeAds: adCount, raw: text.substring(0, 500) };
    }
    return { activeAds: 0, raw: '' };
  } catch (e) {
    return { activeAds: 0, raw: '' };
  }
}

// Main handler
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const action = event.queryStringParameters?.action || 'sync';

  // ACTION: Full sync — fetch all competitor data
  if (action === 'sync') {
    const results = [];

    for (const comp of COMPETITORS) {
      // 1. Google Places data
      const place = await searchPlace(comp.search);
      
      // 2. Meta Ad Library
      const ads = await fetchMetaAds(comp.name);

      const record = {
        name: comp.name,
        code: comp.code,
        color: comp.color,
        url: comp.url,
        google_place_id: place?.id || null,
        google_rating: place?.rating || 0,
        google_reviews_count: place?.userRatingCount || 0,
        google_address: place?.formattedAddress || '',
        google_maps_url: place?.googleMapsUri || '',
        website_url: place?.websiteUri || comp.url,
        business_status: place?.businessStatus || 'UNKNOWN',
        active_ads_count: ads.activeAds,
        last_synced: new Date().toISOString(),
        status: place?.businessStatus === 'OPERATIONAL' ? 'active' : (place?.businessStatus === 'CLOSED_TEMPORARILY' ? 'inactive' : 'active')
      };

      // Store reviews separately
      if (place?.reviews) {
        for (const rev of place.reviews.slice(0, 5)) {
          await supabaseUpsert('competitor_reviews', {
            competitor_name: comp.name,
            author_name: rev.authorAttribution?.displayName || 'Anonymous',
            rating: rev.rating || 0,
            text: rev.text?.text || '',
            publish_time: rev.publishTime || new Date().toISOString(),
            relative_time: rev.relativePublishTimeDescription || '',
            google_review_id: rev.name || `${comp.name}-${Date.now()}`
          });
        }
      }

      // Upsert competitor record
      await supabaseUpsert('competitors', record);
      results.push(record);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, count: results.length, data: results, synced_at: new Date().toISOString() })
    };
  }

  // ACTION: Get stored data from Supabase
  if (action === 'get') {
    try {
      const [compRes, revRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/competitors?select=*&order=google_reviews_count.desc`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/competitor_reviews?select=*&order=publish_time.desc&limit=50`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        })
      ]);

      const competitors = await compRes.json();
      const reviews = await revRes.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ competitors, reviews, fetched_at: new Date().toISOString() })
      };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action. Use ?action=sync or ?action=get' }) };
};
