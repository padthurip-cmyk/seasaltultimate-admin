const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_ANON_KEY;
const YT_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_PLACES_KEY; // Can reuse same key if YouTube API enabled

const COMPETITORS = [
  { name: "Vellanki Foods", search: "Vellanki Foods pickles Hyderabad", url: "vellankifoods.com", code: "VF", color: "#C2410C", fbSearch: "Vellanki Foods", ytSearch: "Vellanki Foods pickles" },
  { name: "Tulasi Pickles", search: "Tulasi Pickles Hyderabad", url: "tulasipickles.com", code: "TP", color: "#16A34A", fbSearch: "Tulasi Pickles", ytSearch: "Tulasi Pickles Hyderabad" },
  { name: "Aavarampoo Pickles", search: "Aavarampoo Pickles Hyderabad", url: "aavarampoo.com", code: "AP", color: "#7C3AED", fbSearch: "Aavarampoo Pickles", ytSearch: "Aavarampoo Pickles review" },
  { name: "Nirupama Pickles", search: "Nirupama Pickles Hyderabad", url: "nirupamapickles.in", code: "NP", color: "#DC2626", fbSearch: "Nirupama Pickles", ytSearch: "Nirupama Pickles review" },
  { name: "Priya Pickles", search: "Priya Pickles Hyderabad", url: "priyapickles.com", code: "PP", color: "#0891B2", fbSearch: "Priya Pickles", ytSearch: "Priya Pickles review" },
  { name: "Ammas Homemade Pickles", search: "Ammas Homemade Pickles Hyderabad", url: "ammashomemade.in", code: "AH", color: "#EA580C", fbSearch: "Ammas Homemade Pickles", ytSearch: "Ammas Homemade Pickles" },
  { name: "Sitara Pickles", search: "Sitara Pickles Hyderabad", url: "sitarapickles.com", code: "SP", color: "#65A30D", fbSearch: "Sitara Foods Pickles", ytSearch: "Sitara Pickles Hyderabad" },
  { name: "Ruchulu Pickles", search: "Ruchulu Pickles Hyderabad", url: "ruchulupickles.com", code: "RP", color: "#9333EA", fbSearch: "Ruchulu Pickles", ytSearch: "Ruchulu Pickles" },
  { name: "Andhra Pickles", search: "Andhra Pickles online Hyderabad", url: "andhrapickles.co", code: "AC", color: "#0369A1", fbSearch: "Andhra Pickles", ytSearch: "Andhra Pickles online" },
  { name: "Hyderabad Pickles", search: "Hyderabad Pickles online", url: "hyderabadpickles.in", code: "HP", color: "#B91C1C", fbSearch: "Hyderabad Pickles", ytSearch: "Hyderabad Pickles review" }
];

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };

// ═══════════════════════════════════
// GOOGLE PLACES API
// ═══════════════════════════════════
async function searchPlace(query) {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.reviews,places.googleMapsUri,places.businessStatus' },
      body: JSON.stringify({ textQuery: query, locationBias: { circle: { center: { latitude: 17.385, longitude: 78.4867 }, radius: 50000 } }, maxResultCount: 1 })
    });
    const data = await res.json();
    if (data.error) { console.error('Google Places error:', JSON.stringify(data.error)); return null; }
    return data.places && data.places[0] ? data.places[0] : null;
  } catch (e) { console.error('Google Places fetch error:', e.message); return null; }
}

// ═══════════════════════════════════
// YOUTUBE DATA API v3 — Search for videos mentioning competitor
// ═══════════════════════════════════
async function searchYouTube(query, competitorName) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&order=date&regionCode=IN&relevanceLanguage=en&key=${YT_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('YouTube API error:', JSON.stringify(data.error));
      return { videos: [], count: 0, error: data.error.message };
    }

    const videos = (data.items || []).map(item => ({
      video_id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: (item.snippet.description || '').substring(0, 300),
      published_at: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '',
      url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
      competitor_name: competitorName,
      platform: 'YouTube'
    }));

    return { videos, count: data.pageInfo ? data.pageInfo.totalResults : videos.length };
  } catch (e) {
    console.error('YouTube fetch error:', e.message);
    return { videos: [], count: 0, error: e.message };
  }
}

// ═══════════════════════════════════
// META AD LIBRARY — Fetch public page
// ═══════════════════════════════════
async function fetchMetaAds(searchTerm) {
  try {
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=${encodeURIComponent(searchTerm)}&search_type=keyword_unordered`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*' }
    });
    if (!res.ok) return { count: 0, ads: [] };
    const html = await res.text();
    let count = 0;
    const ads = [];
    // Try multiple extraction methods
    const m1 = html.match(/adArchiveID/g); if (m1) count = m1.length;
    const m2 = html.match(/Started running on/g); if (m2 && m2.length > count) count = m2.length;
    const m3 = html.match(/"numResults":(\d+)/); if (m3 && parseInt(m3[1]) > count) count = parseInt(m3[1]);
    // Extract ad text
    const tp = /"ad_creative_bodies":\["([^"]+)"/g;
    let m; while ((m = tp.exec(html)) !== null) ads.push({ text: m[1].substring(0, 200), platform: 'FB + IG' });
    return { count, ads, htmlSize: html.length };
  } catch (e) { return { count: 0, ads: [], error: e.message }; }
}

// ═══════════════════════════════════
// GOOGLE ADS TRANSPARENCY CENTER — Fetch public page
// ═══════════════════════════════════
async function fetchGoogleAds(domain) {
  try {
    const url = `https://adstransparency.google.com/?region=anywhere&domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html,*/*' }
    });
    if (!res.ok) return { count: 0, found: false };
    const html = await res.text();
    // Try to extract ad count or advertiser info
    const countMatch = html.match(/"totalResults":(\d+)/);
    const count = countMatch ? parseInt(countMatch[1]) : 0;
    const hasAds = html.includes('ad-creative') || html.includes('advertiser') || html.length > 50000;
    return { count, found: hasAds, htmlSize: html.length };
  } catch (e) { return { count: 0, found: false, error: e.message }; }
}

// ═══════════════════════════════════
// SUPABASE HELPERS
// ═══════════════════════════════════
async function sbUpsert(table, data, conflict) {
  try {
    const res = await fetch(SB_URL + '/rest/v1/' + table + (conflict ? '?on_conflict=' + conflict : ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data)
    });
    if (!res.ok) console.error('Supabase upsert ' + table + ' failed:', res.status);
    return res.ok;
  } catch (e) { return false; }
}

async function sbInsertIfNew(table, data, checkField, checkValue) {
  try {
    const check = await fetch(SB_URL + '/rest/v1/' + table + '?' + checkField + '=eq.' + encodeURIComponent(checkValue) + '&limit=1', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    });
    const existing = await check.json();
    if (existing && existing.length > 0) return true;
    const res = await fetch(SB_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) { return false; }
}

// ═══════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: hdrs, body: '' };
  if (!GOOGLE_KEY || !SB_URL || !SB_KEY) return { statusCode: 500, headers: hdrs, body: JSON.stringify({ error: 'Missing env vars.' }) };

  const params = event.queryStringParameters || {};
  const action = params.action || 'sync';

  // ═══ FULL SYNC: Google Places + Meta Ads + YouTube + Google Ads ═══
  if (action === 'sync') {
    const results = [];
    let revCount = 0, adCount = 0, ytCount = 0;

    for (const comp of COMPETITORS) {
      // 1. Google Places
      const place = await searchPlace(comp.search);
      const rating = place ? (place.rating || 0) : 0;
      const reviewCount = place ? (place.userRatingCount || 0) : 0;

      // 2. Meta Ad Library
      const meta = await fetchMetaAds(comp.fbSearch);

      // 3. Google Ads Transparency
      const gads = await fetchGoogleAds(comp.url);

      // 4. YouTube mentions
      const yt = await searchYouTube(comp.ytSearch, comp.name);

      const totalAds = (meta.count || 0) + (gads.count || 0);

      // Save competitor
      await sbUpsert('competitors', {
        name: comp.name, code: comp.code, color: comp.color, url: comp.url,
        google_place_id: place ? (place.id || null) : null,
        google_rating: rating, google_reviews_count: reviewCount,
        google_address: place ? (place.formattedAddress || '') : '',
        google_maps_url: place ? (place.googleMapsUri || '') : '',
        website_url: place ? (place.websiteUri || comp.url) : comp.url,
        business_status: place ? (place.businessStatus || 'UNKNOWN') : 'UNKNOWN',
        active_ads_count: totalAds,
        last_synced: new Date().toISOString(), status: 'active'
      }, 'name');

      // Save reviews
      if (place && place.reviews) {
        for (const rev of place.reviews.slice(0, 5)) {
          await sbUpsert('competitor_reviews', {
            competitor_name: comp.name,
            author_name: rev.authorAttribution ? rev.authorAttribution.displayName : 'Anonymous',
            rating: rev.rating || 0,
            text: rev.text ? rev.text.text : '',
            publish_time: rev.publishTime || new Date().toISOString(),
            relative_time: rev.relativePublishTimeDescription || '',
            google_review_id: rev.name || (comp.name.replace(/\s/g, '-') + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000))
          }, 'google_review_id');
          revCount++;
        }
      }

      // Save Meta ads
      if (meta.ads) {
        for (const ad of meta.ads) {
          await sbInsertIfNew('competitor_ads', {
            competitor_name: comp.name, ad_text: ad.text, platform: 'Facebook/Instagram',
            region: 'India', ad_status: 'active', started_date: new Date().toISOString().slice(0, 10),
            detected_at: new Date().toISOString()
          }, 'ad_text', ad.text);
          adCount++;
        }
      }

      // Save YouTube mentions
      if (yt.videos) {
        for (const v of yt.videos) {
          await sbInsertIfNew('competitor_ads', {
            competitor_name: comp.name,
            ad_text: v.title + ' — ' + v.channel + ' (' + v.url + ')',
            platform: 'YouTube',
            region: 'India',
            ad_status: 'active',
            started_date: v.published_at ? v.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
            detected_at: new Date().toISOString()
          }, 'ad_text', v.title + ' — ' + v.channel + ' (' + v.url + ')');
          ytCount++;
        }
      }

      results.push({
        name: comp.name, rating, reviews: reviewCount,
        meta_ads: meta.count, google_ads: gads.count, youtube_videos: yt.count,
        place_found: !!place
      });
    }

    return { statusCode: 200, headers: hdrs, body: JSON.stringify({
      success: true, count: results.length, review_count: revCount,
      ad_count: adCount, youtube_count: ytCount, details: results,
      synced_at: new Date().toISOString()
    })};
  }

  // ═══ YOUTUBE ONLY SCAN ═══
  if (action === 'scan-youtube') {
    const results = [];
    for (const comp of COMPETITORS) {
      const yt = await searchYouTube(comp.ytSearch, comp.name);
      if (yt.videos) {
        for (const v of yt.videos) {
          await sbInsertIfNew('competitor_ads', {
            competitor_name: comp.name,
            ad_text: v.title + ' — ' + v.channel + ' (' + v.url + ')',
            platform: 'YouTube', region: 'India', ad_status: 'active',
            started_date: v.published_at ? v.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
            detected_at: new Date().toISOString()
          }, 'ad_text', v.title + ' — ' + v.channel + ' (' + v.url + ')');
        }
      }
      results.push({ name: comp.name, videos_found: yt.count, videos_saved: yt.videos.length });
    }
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({ success: true, details: results }) };
  }

  // ═══ AD SCAN (Meta + Google Ads) ═══
  if (action === 'scan-ads') {
    const results = [];
    for (const comp of COMPETITORS) {
      const meta = await fetchMetaAds(comp.fbSearch);
      const gads = await fetchGoogleAds(comp.url);
      const total = (meta.count || 0) + (gads.count || 0);
      await fetch(SB_URL + '/rest/v1/competitors?name=eq.' + encodeURIComponent(comp.name), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY },
        body: JSON.stringify({ active_ads_count: total, last_synced: new Date().toISOString() })
      });
      if (meta.ads) {
        for (const ad of meta.ads) {
          await sbInsertIfNew('competitor_ads', {
            competitor_name: comp.name, ad_text: ad.text, platform: 'Facebook/Instagram',
            region: 'India', ad_status: 'active', started_date: new Date().toISOString().slice(0, 10),
            detected_at: new Date().toISOString()
          }, 'ad_text', ad.text);
        }
      }
      results.push({ name: comp.name, meta_ads: meta.count, google_ads: gads.count, total });
    }
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({ success: true, details: results }) };
  }

  // ═══ GET: Read from Supabase ═══
  if (action === 'get') {
    try {
      const [cRes, rRes, aRes] = await Promise.all([
        fetch(SB_URL + '/rest/v1/competitors?select=*&order=google_reviews_count.desc', { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }),
        fetch(SB_URL + '/rest/v1/competitor_reviews?select=*&order=publish_time.desc&limit=50', { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }),
        fetch(SB_URL + '/rest/v1/competitor_ads?select=*&order=detected_at.desc&limit=50', { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } })
      ]);
      return { statusCode: 200, headers: hdrs, body: JSON.stringify({
        competitors: await cRes.json(), reviews: await rRes.json(), ads: await aRes.json()
      })};
    } catch (e) { return { statusCode: 500, headers: hdrs, body: JSON.stringify({ error: e.message }) }; }
  }

  // ═══ DEBUG ═══
  if (action === 'debug') {
    const place = await searchPlace('Vellanki Foods pickles Hyderabad');
    const meta = await fetchMetaAds('Vellanki Foods');
    const gads = await fetchGoogleAds('vellankifoods.com');
    const yt = await searchYouTube('Vellanki Foods pickles review', 'Vellanki Foods');
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({
      google: { rating: place?.rating, reviews: place?.userRatingCount, found: !!place },
      meta: { count: meta.count, ads: meta.ads?.length || 0, htmlSize: meta.htmlSize },
      google_ads: { count: gads.count, found: gads.found, htmlSize: gads.htmlSize },
      youtube: { total_results: yt.count, videos: yt.videos?.map(v => ({ title: v.title, channel: v.channel, url: v.url })) || [] },
      env: { hasGoogleKey: !!GOOGLE_KEY, hasSbUrl: !!SB_URL, hasSbKey: !!SB_KEY, hasYtKey: !!YT_KEY }
    })};
  }

  return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Use ?action=sync|scan-ads|scan-youtube|get|debug' }) };
}
