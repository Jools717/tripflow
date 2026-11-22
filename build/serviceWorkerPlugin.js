// Plugin de Vite que genera dist/sw.js con la lista de archivos del build (precache) y una versión única.
// Sin dependencias externas: la plantilla está en build/sw-template.js.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PRECACHE_EXT = /\.(js|css|html|svg|png|webp|ico|json|woff2?)$/;

export function tripflowServiceWorker() {
  let publicDir = '';
  return {
    name: 'tripflow-service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      publicDir = config.publicDir;
    },
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle).filter((f) => PRECACHE_EXT.test(f) && !f.endsWith('.map') && f !== 'index.html');
      const fromPublic = fs.existsSync(publicDir)
        ? fs.readdirSync(publicDir).filter((f) => PRECACHE_EXT.test(f))
        : [];
      const urls = ['/', ...built.map((f) => `/${f}`), ...fromPublic.map((f) => `/${f}`)];
      const version = crypto.createHash('sha256').update(urls.join('|')).digest('hex').slice(0, 12);
      const template = fs.readFileSync(path.resolve(process.cwd(), 'build/sw-template.js'), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template
          .replace("'__VERSION__'", JSON.stringify(version))
          .replace('__PRECACHE_URLS__', JSON.stringify(urls, null, 2))
      });
    }
  };
}
