import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const IMPORT_ROOT = process.argv[2];
if (!IMPORT_ROOT) {
  console.error("Usage: npx tsx scripts/import-works.ts <PATH_TO_HDD_FOLDER>");
  process.exit(1);
}

async function getOrCreateCompany(name: string, parentId: string | null = null) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // Check if exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new
  const { data: created, error } = await supabase
    .from('companies')
    .insert([{
      name,
      slug,
      parent_id: parentId,
      is_freelance: false
    }])
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating company ${name}:`, error.message);
    return null;
  }
  return created.id;
}

async function uploadMedia(filePath: string, companySlug: string, projectSlug: string) {
  const fileExt = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  const targetPath = `content/${companySlug}/${projectSlug}/${fileName}`;
  
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from('portfolio-media')
    .upload(targetPath, fileBuffer, {
      upsert: true,
      contentType: getContentType(fileExt)
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-media')
    .getPublicUrl(targetPath);
    
  return publicUrl;
}

function getContentType(ext: string) {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4'
  };
  return map[ext] || 'application/octet-stream';
}

async function processDirectory(dir: string, depth: number = 0, context: { companyId: string | null, companySlug: string } = { companyId: null, companySlug: '' }) {
  const items = fs.readdirSync(dir);
  const files = items.filter(i => fs.statSync(path.join(dir, i)).isFile());
  const folders = items.filter(i => fs.statSync(path.join(dir, i)).isDirectory());

  const mediaFiles = files.filter(f => ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.mp4'].includes(path.extname(f).toLowerCase()));

  // 1. If this folder has media files, it's a PROJECT
  if (mediaFiles.length > 0 && context.companyId) {
    const projectName = path.basename(dir);
    const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    console.log(`[PROJECT] Importing ${projectName}...`);
    
    // Upload media and build content
    const uploadedUrls: string[] = [];
    for (const file of mediaFiles) {
      const url = await uploadMedia(path.join(dir, file), context.companySlug, projectSlug);
      if (url) uploadedUrls.push(url);
    }

    const tipTapContent = {
      type: 'doc',
      content: uploadedUrls.map(url => ({
        type: 'image',
        attrs: { src: url, alt: projectName }
      }))
    };

    const { error: workError } = await supabase.from('works').insert([{
      company_id: context.companyId,
      title: projectName,
      slug: `${context.companySlug}-${projectSlug}`,
      content: tipTapContent,
      cover_url: uploadedUrls[0] || null,
      status: 'published',
      featured: false,
      protected: false
    }]);

    if (workError) console.error(`Error creating work ${projectName}:`, workError.message);
    else console.log(`✓ Project ${projectName} imported.`);
    
    // Don't recurse into project subfolders if they are just media assets (unless you want to)
    // return; 
  }

  // 2. Otherwise, folders here are Companies or Subcompanies
  for (const folder of folders) {
    if (folder.startsWith('.') || folder === 'node_modules') continue;

    const folderPath = path.join(dir, folder);
    
    // Level 0 is always Company
    if (depth === 0) {
      const companyId = await getOrCreateCompany(folder);
      if (companyId) {
        const slug = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        await processDirectory(folderPath, depth + 1, { companyId, companySlug: slug });
      }
    } 
    // Level 1 could be Sub-company or Year/Month folder
    else {
      // If it looks like a year (4 digits), we skip making it a "Company" record, 
      // just pass through the current company context
      if (/^\d{4}$/.test(folder) || ['gener', 'febrer', 'marc', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'].includes(folder.toLowerCase())) {
         await processDirectory(folderPath, depth + 1, context);
      } else {
        // Treat as Sub-company
        const subId = await getOrCreateCompany(folder, context.companyId);
        if (subId) {
           await processDirectory(folderPath, depth + 1, { companyId: subId, companySlug: context.companySlug });
        }
      }
    }
  }
}

console.log(`Starting bulk import from: ${IMPORT_ROOT}...`);
processDirectory(IMPORT_ROOT).then(() => {
  console.log("Bulk import finished.");
}).catch(err => {
  console.error("Import failed:", err);
});
