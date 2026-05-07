import * as tus from 'tus-js-client';
import fs from 'node:fs';
const file = fs.readFileSync('public/downloads/signix-player-tv.apk');
const SUPABASE_URL='https://auhwylnhqmdgphsvjszr.supabase.co';
const TOKEN=process.env.SERVICE_ROLE_KEY;
await new Promise((resolve,reject)=>{
  const upload = new tus.Upload(file, {
    endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
    headers:{ authorization:`Bearer ${TOKEN}`, 'x-upsert':'true' },
    uploadDataDuringCreation:true,
    metadata:{ bucketName:'apk-downloads', objectName:'signix-player-tv.apk', contentType:'application/vnd.android.package-archive', cacheControl:'3600' },
    chunkSize: 6*1024*1024,
    onError:reject,
    onProgress:(s,t)=>process.stdout.write(`\r${((s/t)*100).toFixed(1)}%`),
    onSuccess:()=>{console.log('\nDONE');resolve();}
  });
  upload.start();
});
