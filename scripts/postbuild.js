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
  const rootDir = path.resolve('.');
  const distDir = path.resolve('dist');
  const docsDir = path.resolve('docs');
  const rootIndex = path.join(rootDir, 'index.html');
  const root404 = path.join(rootDir, '404.html');
  const rootNoJekyll = path.join(rootDir, '.nojekyll');
  const rootAssetsDir = path.resolve('assets');

  const distIndex = path.join(distDir, 'index.html');
  const dist404 = path.join(distDir, '404.html');
  const distNoJekyll = path.join(distDir, '.nojekyll');
  const distAssetsDir = path.join(distDir, 'assets');

  // 1. Ensure root .nojekyll exists
  fs.writeFileSync(rootNoJekyll, '', 'utf8');

  if (fs.existsSync(distIndex)) {
    // 2. Find production bundle filenames
    let jsBundle = '';
    let cssBundle = '';
    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir);
      jsBundle = files.find((f) => f.startsWith('index-') && f.endsWith('.js')) || '';
      cssBundle = files.find((f) => f.startsWith('index-') && f.endsWith('.css')) || '';
    }

    // 3. Sanitize dist/index.html to remove development/static fallback scripts
    let distHtml = fs.readFileSync(distIndex, 'utf8');
    distHtml = distHtml.replace(/<script id="studyhub-prod-loader">[\s\S]*?<\/script>/gi, '');
    distHtml = distHtml.replace(/<script id="studyhub-gh-pages-detector">[\s\S]*?<\/script>/gi, '');
    fs.writeFileSync(distIndex, distHtml, 'utf8');
    console.log('✅ Sanitized dist/index.html for direct production hosting.');

    // 4. Create dist/404.html for SPA routing fallback on GitHub Pages
    fs.copyFileSync(distIndex, dist404);
    console.log('✅ Created dist/404.html for GitHub Pages single-page routing support.');

    // 5. Create dist/.nojekyll to disable Jekyll asset filtering
    fs.writeFileSync(distNoJekyll, '', 'utf8');
    console.log('✅ Created dist/.nojekyll to disable Jekyll asset filtering.');

    // 6. Create root 404.html (exact copy of production app)
    fs.copyFileSync(distIndex, root404);
    console.log('✅ Created root 404.html for direct root deployments.');

    // 7. Update root index.html with actual bundle names for static root hosting
    if (jsBundle && cssBundle && fs.existsSync(rootIndex)) {
      let rootHtml = fs.readFileSync(rootIndex, 'utf8');
      rootHtml = rootHtml.replace(/var jsFile = '[^']*';/, `var jsFile = '${jsBundle}';`);
      rootHtml = rootHtml.replace(/var cssFile = '[^']*';/, `var cssFile = '${cssBundle}';`);
      fs.writeFileSync(rootIndex, rootHtml, 'utf8');
      console.log(`✅ Synced root index.html fallback with ${jsBundle} and ${cssBundle}`);
    }

    // 8. Mirror everything to docs/ directory for users using "Deploy from a branch > /docs"
    if (fs.existsSync(docsDir)) {
      fs.rmSync(docsDir, { recursive: true, force: true });
    }
    copyDirRecursive(distDir, docsDir);
    console.log('✅ Mirrored build to docs/ folder (with .nojekyll & 404.html) for GitHub Pages "/docs" branch deployment.');

    // 9. Mirror dist/assets to root assets/ so even root branch deployments find assets
    if (fs.existsSync(distAssetsDir)) {
      if (fs.existsSync(rootAssetsDir)) {
        fs.rmSync(rootAssetsDir, { recursive: true, force: true });
      }
      copyDirRecursive(distAssetsDir, rootAssetsDir);
      console.log('✅ Mirrored dist/assets to root assets/ for multi-configuration compatibility.');
    }
  }
} catch (err) {
  console.warn('Postbuild step notice:', err);
}
