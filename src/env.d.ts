/// \u003creference types="astro/client" />

interface ImportMetaEnv {
    readonly TICKETMASTER_API_KEY: string;
    readonly MAPTILER_KEY: string;
    readonly SITE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
