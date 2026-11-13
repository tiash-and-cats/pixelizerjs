import { parse } from 'marked';
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pixelizerjs/',
  build: {
    rolldownOptions: {
      external: [/^@babylonjs\//]
    }
  },
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [
    {
      name: 'markdown-html',
      async transform(code, id) {
        if (/\.md$/.test(id)) {
          const html = await parse(code);
          return {
            code: `
              const html = ${JSON.stringify(html)};

              export default html;
              export { html };

              export const md = ${JSON.stringify(code)};
              
              // Check if HMR is enabled and accept updates to this module
              if (import.meta.hot) {
                import.meta.hot.accept((newModule) => {
                  if (newModule) {
                    // The module updated successfully! 
                    // If you are using a framework or store, you can trigger re-renders here:
                    console.log('Markdown updated dynamically:', newModule.default);
                  }
                });
              }
            `,
            map: null,
          };
        }
      },
    },
  ]
})