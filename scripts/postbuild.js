import fs from 'fs';
import path from 'path';

try {
  const distIndex = path.resolve('dist', 'index.html');
  const dist404 = path.resolve('dist', '404.html');

  if (fs.existsSync(distIndex)) {
    fs.copyFileSync(distIndex, dist404);
    console.log('✅ Created dist/404.html for GitHub Pages single-page routing support.');
  }
} catch (err) {
  console.warn('Postbuild step notice:', err);
}
