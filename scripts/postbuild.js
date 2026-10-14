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
  const rootAssetsDir = path.resolve('assets');
  const distAssetsDir = path.join(distDir, 'assets');

  // Ensure root .nojekyll exists
  fs.writeFileSync(rootNoJekyll, '', 'utf8');

  if (fs.existsSync(distIndex)) {
    // 1. Sanitize dist/index.html to remove repository root redirector and setup guide modal
    let htmlContent = fs.readFileSync(distIndex, 'utf8');
    
    // Remove the detector script from production bundles
    htmlContent = htmlContent.replace(/<script id="studyhub-gh-pages-detector">[\s\S]*?<\/script>/gi, '');
    
    // Remove the uncompiled help message box
    htmlContent = htmlContent.replace(/<div id="github-pages-help"[\s\S]*?<\/div>\s*<\/div>/gi, '</div>');
    
    fs.writeFileSync(distIndex, htmlContent, 'utf8');
    console.log('✅ Sanitized dist/index.html for production hosting.');

    // 2. Create dist/404.html for SPA routing fallback on GitHub Pages
    fs.copyFileSync(distIndex, dist404);
    console.log('✅ Created dist/404.html for GitHub Pages single-page routing support.');

    // 3. Create dist/.nojekyll so GitHub Pages does not run Jekyll and ignore Vite assets
    fs.writeFileSync(distNoJekyll, '', 'utf8');
    console.log('✅ Created dist/.nojekyll to disable Jekyll asset filtering on GitHub Pages.');

    // 4. Mirror everything to docs/ directory for users using "Deploy from a branch > /docs"
    if (fs.existsSync(docsDir)) {
      fs.rmSync(docsDir, { recursive: true, force: true });
    }
    copyDirRecursive(distDir, docsDir);
    console.log('✅ Mirrored build to docs/ folder (with .nojekyll & 404.html) for GitHub Pages "/docs" branch deployment.');

    // 5. Mirror dist/assets to root assets/ so even root branch deployments find assets
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
