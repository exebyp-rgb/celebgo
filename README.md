# 🎭 CELEBGO - Celebrity Events Map

Find concerts, shows, and celebrity events near you on an interactive map.

![CELEBGO](https://img.shields.io/badge/Built%20with-Astro-FF5D01?style=flat&logo=astro)
![MapTiler](https://img.shields.io/badge/Maps-MapTiler-4285F4?style=flat)
![Ticketmaster](https://img.shields.io/badge/Events-Ticketmaster-026CDF?style=flat)

## 🌟 Features

- 🗺️ **Interactive Map** - Explore celebrity events on a beautiful map interface
- 🎤 **Celebrity Events** - Concerts, shows, and performances from top artists
- 📍 **Location-Based** - Find events happening near you
- 🔍 **Smart Filters** - Filter by "Tonight", "This Week", or browse all events
- 🏙️ **City Pages** - Dedicated pages for major cities
- 👤 **Artist Pages** - Browse events by your favorite artists
- 📱 **Responsive Design** - Works perfectly on mobile and desktop

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build) - Fast, modern static site generator
- **Maps:** [MapTiler](https://www.maptiler.com/) - Beautiful, customizable maps
- **Events API:** [Ticketmaster Discovery API](https://developer.ticketmaster.com/)
- **Styling:** Vanilla CSS with modern design
- **Deployment:** Cloudflare Pages with automatic GitHub integration

## 📦 Project Structure

```
celebgo/
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript types
├── scripts/            # Build and data scripts
├── data/               # Event and artist data
├── public/             # Static assets
└── dist/               # Build output (generated)
```

## 🛠️ Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npm run fetch` | Fetch latest events from Ticketmaster |

## 🌍 Environment Variables

Required for production:

```env
PUBLIC_MAPTILER_KEY=your_maptiler_api_key
PUBLIC_TICKETMASTER_KEY=your_ticketmaster_api_key
TICKETMASTER_SECRET=your_ticketmaster_secret
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using Astro and modern web technologies.
