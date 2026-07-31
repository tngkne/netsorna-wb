import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'netsorna-admin/netsorna-wb',
  },

  // REPEATABLE CONTENT (content/products, blog, faqs, featured)
  collections: {
    // 1. Products (content/products/*.json)
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

    // 2. Blog Posts (content/blog/*.md)
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'content/blog/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Post Title' } }),
        date: fields.date({ label: 'Publish Date' }),
        author: fields.text({ label: 'Author', defaultValue: 'Store Admin' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        body: fields.markdoc({ label: 'Body Content' }),
      },
    }),

    // 3. FAQs (content/faqs/*.md)
    faqs: collection({
      label: 'FAQs',
      slugField: 'title',
      path: 'content/faqs/*',
      format: { contentField: 'body' },
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

    // 4. Featured Profiles (content/featured/*.json)
    featured: collection({
      label: 'Featured Profiles',
      slugField: 'title',
      path: 'content/featured/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Profile / Program Name' } }),
        tagline: fields.text({ label: 'Tagline' }),
        image: fields.image({
          label: 'Featured Image',
          directory: 'public/images/banners',
          publicPath: '/images/banners/',
        }),
        active: fields.checkbox({ label: 'Active', defaultValue: true }),
        description: fields.markdoc({ label: 'Description' }),
      },
    }),
  },

  // SINGLE-ENTRY PAGES & SETTINGS (content/pages & content/settings)
  singletons: {
    // 1. Home Page (content/pages/home.md)
    homePage: singleton({
      label: 'Home Page',
      path: 'content/pages/home',
      format: { contentField: 'body' },
      schema: {
        hero_title: fields.text({ label: 'Hero Title' }),
        hero_subtitle: fields.text({ label: 'Hero Subtitle' }),
        body: fields.markdoc({ label: 'Page Content' }),
      },
    }),

    // 2. About Page (content/pages/about.md)
    aboutPage: singleton({
      label: 'About Page',
      path: 'content/pages/about',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: 'About Us' }),
        body: fields.markdoc({ label: 'Page Content' }),
      },
    }),

    // 3. Contact Page (content/pages/contact.md)
    contactPage: singleton({
      label: 'Contact Page',
      path: 'content/pages/contact',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: 'Contact Us' }),
        email: fields.text({ label: 'Contact Email' }),
        whatsapp: fields.text({ label: 'WhatsApp Number' }),
        body: fields.markdoc({ label: 'Page Content' }),
      },
    }),

    // 4. Site Config (content/settings/site.json)
    siteSettings: singleton({
      label: 'Site Settings',
      path: 'content/settings/site',
      format: { data: 'json' },
      schema: {
        site_name: fields.text({ label: 'Site Name', defaultValue: 'Netsorna Store' }),
        currency: fields.text({ label: 'Currency Symbol', defaultValue: 'R' }),
        support_email: fields.text({ label: 'Support Email' }),
      },
    }),

    // 5. Navigation Links (content/settings/navigation.json)
    navigationSettings: singleton({
      label: 'Header Navigation',
      path: 'content/settings/navigation',
      format: { data: 'json' },
      schema: {
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Link Text' }),
            url: fields.text({ label: 'URL Path (e.g. /shop.html)' }),
          }),
          {
            label: 'Navigation Links',
            itemLabel: (props) => props.fields.label.value || 'Link',
          }
        ),
      },
    }),

    // 6. Footer Content (content/settings/footer.json)
    footerSettings: singleton({
      label: 'Footer Settings',
      path: 'content/settings/footer',
      format: { data: 'json' },
      schema: {
        copyright_text: fields.text({ label: 'Copyright Notice' }),
        social_facebook: fields.text({ label: 'Facebook URL' }),
        social_instagram: fields.text({ label: 'Instagram URL' }),
      },
    }),
  },
});
