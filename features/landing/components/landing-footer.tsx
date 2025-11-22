'use client';

import Link from 'next/link';
import { LogoMark } from '@/features/landing/components/landing-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function LandingFooter() {
  const links = [
    { name: 'About', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ];

  return (
    <footer className="border-t ">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-8 md:order-2 items-center">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <ThemeSwitcher />
        </div>

        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <LogoMark className="h-12 w-12 rounded-xl relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                ClearSprint
              </span>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
