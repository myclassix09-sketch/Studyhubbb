import fs from 'fs';
import path from 'path';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const distDir = path.resolve('dist');
  const docsDir = path.resolve('docs');
  const rootNoJekyll = path.resolve('.nojekyll');
  const distIndex = path.join(distDir, 'index.html');
  const dist404 = path.join(distDir, '404.html');
  const distNoJekyll = path.join(distDir, '.nojekyll');

  // Ensure root .nojekyll exists
  fs.writeFileSync(rootNoJekyll, '', 'utf8');

  if (fs.existsSync(distIndex)) {
    // 1. Create dist/404.html for SPA routing fallback on GitHub Pages
    fs.copyFileSync(distIndex, dist404);
    console.log('✅ Created dist/404.html for GitHub Pages single-page routing support.');

    // 2. Create dist/.nojekyll so GitHub Pages does not run Jekyll and ignore Vite assets
    fs.writeFileSync(distNoJekyll, '', 'utf8');
    console.log('✅ Created dist/.nojekyll to disable Jekyll asset filtering on GitHub Pages.');

    // 3. Mirror everything to docs/ directory for users using "Deploy from a branch > /docs"
    if (fs.existsSync(docsDir)) {
      fs.rmSync(docsDir, { recursive: true, force: true });
    }
    copyDirRecursive(distDir, docsDir);
    console.log('✅ Mirrored build to docs/ folder (with .nojekyll & 404.html) for GitHub Pages "/docs" branch deployment.');
  }
} catch (err) {
  console.warn('Postbuild step notice:', err);
}
