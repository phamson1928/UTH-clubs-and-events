/**
 * Script migrate ảnh từ thư mục uploads/images lên Supabase Storage.
 * Chạy 1 lần duy nhất: npx ts-node scripts/migrate-images.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import * as mime from 'mime-types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const IMAGES_DIR = join(__dirname, '..', 'uploads', 'images');
const BUCKET = 'images';

async function migrate() {
  const files = readdirSync(IMAGES_DIR).filter((f) => f !== '.gitkeep');

  console.log(`Found ${files.length} files to upload...\n`);

  for (const filename of files) {
    const filePath = join(IMAGES_DIR, filename);
    const buffer = readFileSync(filePath);
    const contentType =
      (mime.lookup(extname(filename)) as string) || 'application/octet-stream';

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`❌ FAILED: ${filename} — ${error.message}`);
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      console.log(`✅ ${filename}`);
      console.log(`   → ${data.publicUrl}\n`);
    }
  }

  console.log('Migration done!');
}

migrate().catch(console.error);
