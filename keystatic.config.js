import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'netsorna-admin/netsorna-wb', // Matches your Keystatic Cloud project key
  },
  collections: {
    // B.2, B.3 Product Catalogue
    products: collection({
      label: 'Products',
      slugField: 'title',
      path: 'content/products/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Product Name' } }),
        sku: fields.text({ label: 'SKU' }),
        price: fields.number({ label: 'Price' }),
        image: fields.image({
          label: 'Product Image',
          directory: 'public/images/products',
          publicPath: '/images/products/',
        }),
        description: fields.markdoc({ label: 'Description' }),
        in_stock: fields.checkbox({ label: 'In Stock', defaultValue: true }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Apparel', value: 'apparel' },
            { label: 'Accessories', value: 'accessories' },
            { label: 'Digital', value: 'digital' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'apparel',
        }),
      },
    }),

    // B.5 Blog Posts
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'content/blog/*',
      format: { data: 'md' },
      schema: {
        title: fields.slug({ name: { label: 'Post Title' } }),
        date: fields.date({ label: 'Publish Date' }),
        author: fields.text({ label: 'Author', defaultValue: 'Store Admin' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        body: fields.markdoc({ label: 'Body Content' }),
      },
    }),

    // B.6 FAQs
    faqs: collection({
      label: 'FAQs',
      slugField: 'title',
      path: 'content/faqs/*',
      format: { data: 'md' },
      schema: {
        title: fields.slug({ name: { label: 'Question' } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'General', value: 'general' },
            { label: 'Shipping', value: 'shipping' },
            { label: 'Returns', value: 'returns' },
            { label: 'Orders', value: 'orders' },
          ],
          defaultValue: 'general',
        }),
        body: fields.markdoc({ label: 'Answer' }),
      },
    }),
  },

  // Single Page Contents (content/pages/)
  singletons: {
    home: singleton({
      label: 'Home Page',
      path: 'content/pages/home',
      format: { data: 'md' },
      schema: {
        hero_title: fields.text({ label: 'Hero Title' }),
        hero_subtitle: fields.text({ label: 'Hero Subtitle' }),
        body: fields.markdoc({ label: 'Main Content' }),
      },
    }),
  },
});
