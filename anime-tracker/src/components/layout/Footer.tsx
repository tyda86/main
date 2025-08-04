import Link from 'next/link';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Anime',
      links: [
        { href: '/trending', label: 'Trending' },
        { href: '/season', label: 'This Season' },
        { href: '/upcoming', label: 'Upcoming' },
        { href: '/top-rated', label: 'Top Rated' },
      ],
    },
    {
      title: 'Community',
      links: [
        { href: '/news', label: 'News' },
        { href: '/reviews', label: 'Reviews' },
        { href: '/discussions', label: 'Discussions' },
        { href: '/recommendations', label: 'Recommendations' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/watchlist', label: 'My Watchlist' },
        { href: '/profile', label: 'Profile' },
        { href: '/settings', label: 'Settings' },
        { href: '/notifications', label: 'Notifications' },
      ],
    },
    {
      title: 'Support',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/contact', label: 'Contact Us' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
      ],
    },
  ];

  const socialLinks = [
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'mailto:contact@animetracker.com', icon: Mail, label: 'Email' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest anime news and episode alerts delivered to your inbox.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
              <form className="flex max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-r-lg transition-colors duration-200 font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <span className="text-xl font-bold">AnimeTracker</span>
          </div>

          <div className="flex items-center space-x-6 mb-4 sm:mb-0">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <div className="flex items-center text-gray-300 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>for anime fans</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
            © {currentYear} AnimeTracker. All rights reserved. |{' '}
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </p>
          <p className="mt-2">
            Data provided by{' '}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              AniList
            </a>
            . Not affiliated with any anime streaming services.
          </p>
        </div>
      </div>
    </footer>
  );
}