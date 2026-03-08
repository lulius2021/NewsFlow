/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // German News Sources
      { protocol: 'https', hostname: 'www.tagesschau.de' },
      { protocol: 'https', hostname: 'cdn.tagesschau.de' },
      { protocol: 'https', hostname: 'www.spiegel.de' },
      { protocol: 'https', hostname: 'cdn.prod.www.spiegel.de' },
      { protocol: 'https', hostname: 'www.faz.net' },
      { protocol: 'https', hostname: 'media1.faz.net' },
      { protocol: 'https', hostname: 'www.handelsblatt.com' },
      { protocol: 'https', hostname: 'www.sportschau.de' },
      { protocol: 'https', hostname: 'www.kicker.de' },
      { protocol: 'https', hostname: 'derivates.kicker.de' },
      { protocol: 'https', hostname: 'www.heise.de' },
      { protocol: 'https', hostname: 'heise.cloudimg.io' },
      { protocol: 'https', hostname: 'www.n-tv.de' },
      { protocol: 'https', hostname: 'bilder.n-tv.de' },
      { protocol: 'https', hostname: 'www.welt.de' },
      { protocol: 'https', hostname: 'img.welt.de' },

      // International News
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: 'static01.nyt.com' },
      { protocol: 'https', hostname: 'cloudfront-us-east-1.images.arcpublishing.com' },
      { protocol: 'https', hostname: 'www.aljazeera.com' },
      { protocol: 'https', hostname: 'a57.foxnews.com' },

      // Finance
      { protocol: 'https', hostname: 's.yimg.com' },
      { protocol: 'https', hostname: 'image.cnbcfm.com' },
      { protocol: 'https', hostname: 'assets.bwbx.io' },

      // Tech
      { protocol: 'https', hostname: 'techcrunch.com' },
      { protocol: 'https', hostname: 'cdn.vox-cdn.com' },
      { protocol: 'https', hostname: 'cdn.arstechnica.net' },

      // Crypto
      { protocol: 'https', hostname: 'images.cointelegraph.com' },
      { protocol: 'https', hostname: 'www.coindesk.com' },
      { protocol: 'https', hostname: 'cloudfront-us-east-1.images.arcpublishing.com' },

      // Sports
      { protocol: 'https', hostname: 'a.espncdn.com' },

      // Science
      { protocol: 'https', hostname: 'www.sciencedaily.com' },

      // Geopolitics
      { protocol: 'https', hostname: 'static.timesofisrael.com' },
      { protocol: 'https', hostname: 'english.alarabiya.net' },
    ],
  },
};
module.exports = nextConfig;
