import { parse } from 'marked';
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pixelizerjs/',
  plugins: [
    {
      name: 'markdown-html',
      async transform(code, id) {
        if (/\.md$/.test(id)) {
          const html = await parse(code);
          return {
            code: `export const html = ${JSON.stringify(html)}; export const md = ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    },
  ],
})