// ═══════════════════════════════════════════════════════════════
// IMAGE-UPLOAD.MJS — Upload product images to Supabase Storage
// Accepts: POST { filename, base64, contentType, productId }
// Returns: { success, url } — public URL for the uploaded image
// ═══════════════════════════════════════════════════════════════

var SU = process.env.SUPABASE_URL || '';
var SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
var BUCKET = 'product-images';

export async function handler(event) {
  var H = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: H, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: H, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    var body = JSON.parse(event.body);
    var { base64, filename, contentType, productId } = body;

    if (!base64 || !filename) {
      return { statusCode: 400, headers: H, body: JSON.stringify({ error: 'base64 and filename required' }) };
    }

    if (!SU || !SK) {
      return { statusCode: 500, headers: H, body: JSON.stringify({ error: 'Supabase not configured' }) };
    }

    // Clean filename: timestamp + sanitized name
    var ts = Date.now();
    var clean = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    var storagePath = (productId ? productId + '/' : '') + ts + '_' + clean;

    // Decode base64 to binary
    var binaryStr = atob(base64);
    var bytes = new Uint8Array(binaryStr.length);
    for (var i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Ensure bucket exists (create if needed — will 409 if already exists, that's fine)
    try {
      await fetch(SU + '/storage/v1/bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SK,
          'apikey': SK
        },
        body: JSON.stringify({
          id: BUCKET,
          name: BUCKET,
          public: true,
          file_size_limit: 10485760 // 10MB
        })
      });
    } catch (e) { /* bucket may already exist */ }

    // Upload file to Supabase Storage
    var uploadRes = await fetch(SU + '/storage/v1/object/' + BUCKET + '/' + storagePath, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SK,
        'apikey': SK,
        'Content-Type': contentType || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: bytes
    });

    if (!uploadRes.ok) {
      var errText = await uploadRes.text();
      console.error('[Image Upload] Storage error:', uploadRes.status, errText);
      return {
        statusCode: uploadRes.status,
        headers: H,
        body: JSON.stringify({ error: 'Upload failed: ' + errText })
      };
    }

    // Construct public URL
    var publicUrl = SU + '/storage/v1/object/public/' + BUCKET + '/' + storagePath;

    console.log('[Image Upload] Success:', publicUrl);
    return {
      statusCode: 200,
      headers: H,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        path: storagePath,
        filename: clean
      })
    };

  } catch (e) {
    console.error('[Image Upload] Error:', e.message);
    return {
      statusCode: 500,
      headers: H,
      body: JSON.stringify({ error: e.message })
    };
  }
}
