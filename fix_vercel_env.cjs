const { execSync } = require('child_process');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8').split('\n');
let url = '', key = '', pk = '';

for (const line of env) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
  if (line.startsWith('VITE_PAYSTACK_PUBLIC_KEY=')) pk = line.split('=')[1].trim();
}

console.log('Removing old env vars...');
try { execSync('vercel env rm VITE_SUPABASE_URL production -y'); } catch(e){}
try { execSync('vercel env rm VITE_SUPABASE_ANON_KEY production -y'); } catch(e){}
try { execSync('vercel env rm VITE_PAYSTACK_PUBLIC_KEY production -y'); } catch(e){}

console.log('Adding fresh ASCII env vars...');
execSync('vercel env add VITE_SUPABASE_URL production', { input: Buffer.from(url, 'ascii') });
execSync('vercel env add VITE_SUPABASE_ANON_KEY production', { input: Buffer.from(key, 'ascii') });
execSync('vercel env add VITE_PAYSTACK_PUBLIC_KEY production', { input: Buffer.from(pk, 'ascii') });

console.log('Deploying...');
execSync('vercel --prod --force', { stdio: 'inherit' });
