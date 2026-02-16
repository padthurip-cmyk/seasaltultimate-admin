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
    if (data.error) {
      console.error('Google API error for ' + query + ':', JSON.stringify(data.error));
      return null;
    }
    return data.places && data.places[0] ? data.places[0] : null;
  } catch (e) {
    console.error('Google fetch error:', e.message);
    return null;
  }
}

async function sbUpsertCompetitor(data) {
  try {
    const res = await fetch(SB_URL + '/rest/v1/competitors?on_conflict=name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('Supabase competitor upsert failed:', res.status, text);
    }
    return res.ok;
  } catch (e) {
    console.error('Supabase competitor error:', e.message);
    return false;
  }
}

async function sbUpsertReview(data) {
  try {
    const res = await fetch(SB_URL + '/rest/v1/competitor_reviews?on_conflict=google_review_id', {
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

  if (!GOOGLE_KEY || !SB_URL || !SB_KEY) {
    return {
      statusCode: 500,
      headers: hdrs,
      body: JSON.stringify({ error: 'Missing env vars. Add GOOGLE_PLACES_KEY, SUPABASE_URL, SUPABASE_ANON_KEY in Netlify.' })
    };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || 'sync';

  if (action === 'sync') {
    const results = [];
    let revCount = 0;
    const errors = [];

    for (const comp of COMPETITORS) {
      const place = await searchPlace(comp.search);

      const rating = place && place.rating ? place.rating : 0;
      const reviewCount = place && place.userRatingCount ? place.userRatingCount : 0;

      const rec = {
        name: comp.name,
        code: comp.code,
        color: comp.color,
        url: comp.url,
        google_place_id: place ? (place.id || null) : null,
        google_rating: rating,
        google_reviews_count: reviewCount,
        google_address: place ? (place.formattedAddress || '') : '',
        google_maps_url: place ? (place.googleMapsUri || '') : '',
        website_url: place ? (place.websiteUri || comp.url) : comp.url,
        business_status: place ? (place.businessStatus || 'UNKNOWN') : 'UNKNOWN',
        active_ads_count: 0,
        last_synced: new Date().toISOString(),
        status: 'active'
      };

      const ok = await sbUpsertCompetitor(rec);
      if (!ok) errors.push('Failed to upsert: ' + comp.name);

      if (place && place.reviews) {
        for (const rev of place.reviews.slice(0, 5)) {
          const reviewId = rev.name || (comp.name.replace(/\s/g, '-') + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000));
          await sbUpsertReview({
            competitor_name: comp.name,
            author_name: rev.authorAttribution ? rev.authorAttribution.displayName : 'Anonymous',
            rating: rev.rating || 0,
            text: rev.text ? rev.text.text : '',
            publish_time: rev.publishTime || new Date().toISOString(),
            relative_time: rev.relativePublishTimeDescription || '',
            google_review_id: reviewId
          });
          revCount++;
        }
      }

      results.push({ name: comp.name, rating: rating, reviews: reviewCount, place_found: !!place });
    }

    return {
      statusCode: 200,
      headers: hdrs,
      body: JSON.stringify({
        success: true,
        count: results.length,
        review_count: revCount,
        errors: errors,
        details: results,
        synced_at: new Date().toISOString()
      })
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

  if (action === 'debug') {
    const place = await searchPlace('Vellanki Foods pickles Hyderabad');
    return {
      statusCode: 200,
      headers: hdrs,
      body: JSON.stringify({ place: place, hasRating: !!(place && place.rating), env: { hasGoogleKey: !!GOOGLE_KEY, hasSbUrl: !!SB_URL, hasSbKey: !!SB_KEY } })
    };
  }

  return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Use ?action=sync or ?action=get or ?action=debug' }) };
}
