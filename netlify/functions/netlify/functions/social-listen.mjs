const YT_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_PLACES_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_ANON_KEY;

const COMPETITORS = [
  { name: "Vellanki Foods", yt: "Vellanki Foods pickles review" },
  { name: "Tulasi Pickles", yt: "Tulasi Pickles Hyderabad review" },
  { name: "Aavarampoo Pickles", yt: "Aavarampoo Pickles review" },
  { name: "Nirupama Pickles", yt: "Nirupama Pickles Hyderabad" },
  { name: "Priya Pickles", yt: "Priya Foods pickles review Hyderabad" },
  { name: "Ammas Homemade Pickles", yt: "Ammas Homemade Pickles Hyderabad" },
  { name: "Sitara Pickles", yt: "Sitara Foods Pickles Hyderabad" },
  { name: "Ruchulu Pickles", yt: "Ruchulu Pickles Hyderabad" },
  { name: "Andhra Pickles", yt: "Andhra Pickles online review" },
  { name: "Hyderabad Pickles", yt: "Hyderabad Pickles review" },
  // General pickle / food enthusiast searches — find food lovers
  { name: "_FoodLovers", yt: "best pickles Hyderabad 2025 review" },
  { name: "_FoodLovers", yt: "homemade andhra pickles taste test" },
  { name: "_FoodLovers", yt: "telugu food vlog pickles" }
];

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };

// ═══════════════════════════════════
// YOUTUBE API LAYER
// ═══════════════════════════════════

async function ytFetch(endpoint) {
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}&key=${YT_KEY}`);
    const d = await r.json();
    if (d.error) { console.error('YT err:', d.error.message); return null; }
    return d;
  } catch (e) { console.error('YT fetch err:', e.message); return null; }
}

async function ytSearch(query, max = 5) {
  const d = await ytFetch(`search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${max}&order=date&regionCode=IN`);
  if (!d) return [];
  return (d.items || []).map(i => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channel: i.snippet.channelTitle,
    channelId: i.snippet.channelId,
    published: i.snippet.publishedAt,
    url: 'https://www.youtube.com/watch?v=' + i.id.videoId
  }));
}

async function ytVideoStats(ids) {
  if (!ids.length) return {};
  const d = await ytFetch(`videos?part=statistics&id=${ids.join(',')}`);
  if (!d) return {};
  const m = {}; (d.items || []).forEach(i => { m[i.id] = i.statistics; }); return m;
}

async function ytComments(videoId, max = 30) {
  const d = await ytFetch(`commentThreads?part=snippet&videoId=${videoId}&maxResults=${max}&order=relevance`);
  if (!d) return [];
  return (d.items || []).map(i => {
    const c = i.snippet.topLevelComment.snippet;
    return {
      username: c.authorDisplayName || '',
      channelUrl: c.authorChannelUrl || '',
      channelId: c.authorChannelId?.value || '',
      text: c.textDisplay || '',
      likes: c.likeCount || 0,
      published: c.publishedAt || '',
      profileImg: c.authorProfileImageUrl || ''
    };
  });
}

// ═══════════════════════════════════
// DEEP CHANNEL PROFILER — THE SPY ENGINE
// Batch-fetches channel details for up to 50 users at once
// Extracts: subs, country, description, AND all social links
// ═══════════════════════════════════

async function ytChannelProfiles(channelIds) {
  if (!channelIds.length) return {};
  const batch = channelIds.slice(0, 50).join(',');
  const d = await ytFetch(`channels?part=snippet,statistics,brandingSettings&id=${batch}`);
  if (!d) return {};

  const profiles = {};
  (d.items || []).forEach(ch => {
    const desc = (ch.snippet.description || '') + ' ' + (ch.brandingSettings?.channel?.description || '');
    const links = extractAllLinks(desc);
    const subs = parseInt(ch.statistics?.subscriberCount || '0');
    const views = parseInt(ch.statistics?.viewCount || '0');

    // Influence score: subscribers weight + total views weight
    let score = 0;
    if (subs > 1000000) score = 100;
    else if (subs > 100000) score = 80;
    else if (subs > 10000) score = 60;
    else if (subs > 1000) score = 40;
    else if (subs > 100) score = 20;
    else score = 5;
    if (views > 1000000) score += 20;
    if (links.instagram) score += 10;
    if (links.email) score += 15;

    profiles[ch.id] = {
      username: ch.snippet.title || '',
      channelUrl: 'https://www.youtube.com/channel/' + ch.id,
      thumbnail: ch.snippet.thumbnails?.medium?.url || '',
      subscribers: String(subs),
      totalViews: String(views),
      totalVideos: ch.statistics?.videoCount || '0',
      country: ch.snippet.country || '',
      description: desc.substring(0, 500),
      influenceScore: score,
      ...links
    };
  });
  return profiles;
}

// ═══════════════════════════════════
// LINK EXTRACTOR — Parses YouTube channel description
// Finds: Instagram, Facebook, Twitter/X, LinkedIn, TikTok,
//        Telegram, Website, Email, WhatsApp
// ═══════════════════════════════════

function extractAllLinks(text) {
  const r = { instagram: null, facebook: null, twitter: null, linkedin: null, website: null, email: null, whatsapp: null, tiktok: null, telegram: null };
  if (!text) return r;

  // Instagram — handle or URL
  const ig = text.match(/(?:instagram\.com\/|insta(?:gram)?[\s:@]+)([\w.]{2,30})/i);
  if (ig) r.instagram = 'https://instagram.com/' + ig[1].replace(/[^a-zA-Z0-9_.]/g, '');

  // Facebook — page or profile URL
  const fb = text.match(/facebook\.com\/([\w.]+)/i);
  if (fb) r.facebook = 'https://facebook.com/' + fb[1];

  // Twitter / X
  const tw = text.match(/(?:twitter\.com\/|x\.com\/)([\w]{1,25})/i);
  if (tw) r.twitter = 'https://x.com/' + tw[1];

  // LinkedIn
  const li = text.match(/linkedin\.com\/(?:in|company)\/([\w-]+)/i);
  if (li) r.linkedin = 'https://linkedin.com/in/' + li[1];

  // TikTok
  const tk = text.match(/tiktok\.com\/@?([\w.]+)/i);
  if (tk) r.tiktok = 'https://tiktok.com/@' + tk[1];

  // Telegram
  const tg = text.match(/(?:t\.me\/|telegram[\s:@]+)([\w]+)/i);
  if (tg) r.telegram = 'https://t.me/' + tg[1];

  // Email
  const em = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (em) r.email = em[0];

  // WhatsApp
  const wa = text.match(/(?:whatsapp|wa\.me|wa\s*:?\s*|call[\s:]*|contact[\s:]*)(\+?\d[\d\s()-]{7,})/i);
  if (wa) r.whatsapp = wa[1].replace(/[\s()-]/g, '');

  // Website — any URL not matching known socials
  const urls = text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-z]{2,}[^\s)"]*/gi) || [];
  for (const u of urls) {
    const lower = u.toLowerCase();
    if (!lower.includes('instagram') && !lower.includes('facebook') && !lower.includes('twitter') &&
        !lower.includes('youtube') && !lower.includes('x.com') && !lower.includes('linkedin') &&
        !lower.includes('tiktok') && !lower.includes('t.me') && !lower.includes('bit.ly') &&
        !lower.includes('wa.me') && !lower.includes('google')) {
      r.website = u;
      break;
    }
  }

  return r;
}

// ═══════════════════════════════════
// SUPABASE
// ═══════════════════════════════════

async function sb(method, table, data, query) {
  try {
    const url = SB_URL + '/rest/v1/' + table + (query || '');
    const opts = { method, headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } };
    if (method === 'POST') { opts.headers['Prefer'] = 'resolution=merge-duplicates'; opts.body = JSON.stringify(data); }
    const r = await fetch(url, opts);
    if (method === 'GET') return r.ok ? await r.json() : [];
    return r.ok;
  } catch (e) { return method === 'GET' ? [] : false; }
}

// ═══════════════════════════════════
// HANDLER
// ═══════════════════════════════════

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: hdrs, body: '' };
  if (!YT_KEY || !SB_URL || !SB_KEY) return { statusCode: 500, headers: hdrs, body: JSON.stringify({ error: 'Missing env vars' }) };

  const action = (event.queryStringParameters || {}).action || 'scan';

  // ═══ FULL DEEP SCAN ═══
  if (action === 'scan') {
    let tVids = 0, tUsers = 0, tProfiled = 0;
    const res = [];

    for (const comp of COMPETITORS) {
      const cr = { name: comp.name, videos: 0, users: 0, profiled: 0, withSocials: 0 };
      const videos = await ytSearch(comp.yt, 5);
      if (!videos.length) { res.push(cr); continue; }

      // Video stats
      const stats = await ytVideoStats(videos.map(v => v.id));

      // Collect all commenters across all videos for this competitor
      const allCommenters = [];

      for (const v of videos) {
        const vs = stats[v.id] || {};
        await sb('POST', 'competitor_content', {
          competitor_name: comp.name, platform: 'YouTube', content_type: 'video',
          content_id: v.id, title: v.title, url: v.url,
          views: vs.viewCount || '0', likes: vs.likeCount || '0',
          comments_count: vs.commentCount || '0', published_at: v.published,
          detected_at: new Date().toISOString()
        }, '?on_conflict=content_id,platform');
        tVids++; cr.videos++;

        const comments = await ytComments(v.id, 30);
        for (const c of comments) {
          if (c.channelId) allCommenters.push({ ...c, videoUrl: v.url, videoTitle: v.title });
        }
      }

      // BATCH deep-profile all unique commenters (1 API call per 50 users!)
      const uniqueIds = [...new Set(allCommenters.map(c => c.channelId))];
      const profiles = await ytChannelProfiles(uniqueIds);

      // Save each commenter + their deep profile
      for (const c of allCommenters) {
        // Save engagement record
        await sb('POST', 'engaged_users', {
          username: c.username, display_name: c.username,
          profile_url: c.channelUrl, platform: 'YouTube',
          competitor_name: comp.name, engagement_type: 'comment',
          content_text: c.text.substring(0, 500),
          content_url: c.videoUrl, video_title: c.videoTitle,
          detected_at: c.published || new Date().toISOString()
        }, '?on_conflict=username,platform,content_url');
        tUsers++; cr.users++;

        // Save deep profile
        const p = profiles[c.channelId];
        if (p) {
          await sb('POST', 'user_profiles', {
            channel_id: c.channelId,
            username: p.username || c.username,
            channel_url: p.channelUrl,
            thumbnail: p.thumbnail,
            subscribers: p.subscribers,
            total_views: p.totalViews,
            total_videos: p.totalVideos,
            country: p.country,
            description: p.description,
            instagram_url: p.instagram,
            facebook_url: p.facebook,
            twitter_url: p.twitter,
            linkedin_url: p.linkedin,
            website_url: p.website,
            email: p.email,
            whatsapp: p.whatsapp,
            tiktok_url: p.tiktok,
            telegram_url: p.telegram,
            influence_score: p.influenceScore,
            last_scanned: new Date().toISOString()
          }, '?on_conflict=channel_id');
          tProfiled++; cr.profiled++;

          if (p.instagram || p.facebook || p.twitter || p.email || p.website || p.whatsapp) cr.withSocials++;
        }
      }

      // Save YouTube as competitor social
      if (videos.length) {
        await sb('POST', 'competitor_socials', {
          competitor_name: comp.name, platform: 'youtube',
          account_name: videos[0].channel, account_url: 'https://youtube.com/results?search_query=' + encodeURIComponent(comp.name),
          posts_count: String(videos.length), last_checked: new Date().toISOString()
        }, '?on_conflict=competitor_name,platform');
      }

      res.push(cr);
    }

    return { statusCode: 200, headers: hdrs, body: JSON.stringify({
      success: true, total_videos: tVids, total_users: tUsers, total_profiled: tProfiled,
      details: res, scanned_at: new Date().toISOString()
    })};
  }

  // ═══ GET ALL DATA ═══
  if (action === 'get-users') {
    const comp = (event.queryStringParameters || {}).competitor || '';
    const f = comp ? '&competitor_name=eq.' + encodeURIComponent(comp) : '';
    const [users, profiles, content, socials] = await Promise.all([
      sb('GET', 'engaged_users', null, '?select=*&order=detected_at.desc&limit=200' + f),
      sb('GET', 'user_profiles', null, '?select=*&order=influence_score.desc&limit=200'),
      sb('GET', 'competitor_content', null, '?select=*&order=detected_at.desc&limit=50'),
      sb('GET', 'competitor_socials', null, '?select=*')
    ]);
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({ users, profiles, content, socials }) };
  }

  // ═══ PROFILE STATS ═══
  if (action === 'stats') {
    const [withIg, withEmail, withFb, withWeb, total] = await Promise.all([
      sb('GET', 'user_profiles', null, '?select=id&instagram_url=not.is.null'),
      sb('GET', 'user_profiles', null, '?select=id&email=not.is.null'),
      sb('GET', 'user_profiles', null, '?select=id&facebook_url=not.is.null'),
      sb('GET', 'user_profiles', null, '?select=id&website_url=not.is.null'),
      sb('GET', 'user_profiles', null, '?select=id')
    ]);
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({
      total_profiles: total.length,
      with_instagram: withIg.length,
      with_email: withEmail.length,
      with_facebook: withFb.length,
      with_website: withWeb.length
    })};
  }

  // ═══ DEBUG — Test one competitor ═══
  if (action === 'debug') {
    const videos = await ytSearch('Vellanki Foods pickles review', 2);
    let commenters = [], profiles = {};
    if (videos.length > 0) {
      commenters = await ytComments(videos[0].id, 5);
      const ids = commenters.filter(c => c.channelId).map(c => c.channelId);
      if (ids.length) profiles = await ytChannelProfiles(ids);
    }
    return { statusCode: 200, headers: hdrs, body: JSON.stringify({
      videos_found: videos.length,
      first_video: videos[0] || null,
      commenters: commenters.map(c => {
        const p = profiles[c.channelId] || {};
        return {
          name: c.username,
          youtube_channel: c.channelUrl,
          comment: c.text.substring(0, 100),
          subscribers: p.subscribers || '?',
          country: p.country || '?',
          instagram: p.instagram || null,
          facebook: p.facebook || null,
          twitter: p.twitter || null,
          email: p.email || null,
          website: p.website || null,
          whatsapp: p.whatsapp || null,
          tiktok: p.tiktok || null,
          influence_score: p.influenceScore || 0,
          desc_preview: (p.description || '').substring(0, 150)
        };
      }),
      env: { hasYtKey: !!YT_KEY }
    })};
  }

  return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Use ?action=scan|get-users|stats|debug' }) };
}
