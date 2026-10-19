'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/logout';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Re-check on every navigation so login/logout is reflected immediately
  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken')));
    setUserName(localStorage.getItem('username') || '');
  }, [pathname]);

  return (
    <nav className="fixed z-[1000] flex w-full items-center justify-between border border-brand-border bg-brand py-[0.5%] pr-[2%] pl-[3%] font-brand">
      <button
        className="block text-white md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <XMarkIcon className="size-8" aria-hidden /> : <Bars3Icon className="size-8" aria-hidden />}
      </button>

      {/* Mobil: dold tills menyn öppnas. Desktop: alltid synlig på en rad */}
      <ul
        className={`${menuOpen ? 'flex' : 'hidden'} absolute top-[50px] w-full flex-col gap-4 rounded-lg bg-brand p-8 text-2xl text-white md:static md:flex md:flex-row md:gap-10 md:bg-transparent md:p-0`}
      >
        {isLoggedIn && (
          <>
            <li onClick={() => setMenuOpen(false)}>
              <Link href="/cards/card">Create Card</Link>
            </li>
            <li onClick={() => setMenuOpen(false)}>
              <Link href="/cards">Jira Board</Link>
            </li>
          </>
        )}

        {isLoggedIn ? (
          <>
            <li key="logout">
              <button onClick={handleLogout}>Logout</button>
            </li>
            {userName && (
              <li key="profile">
                <span>{userName}</span>
              </li>
            )}
          </>
        ) : (
          <>
            <li key="register" onClick={() => setMenuOpen(false)}>
              <Link href="/register">Register User</Link>
            </li>
            <li key="login" onClick={() => setMenuOpen(false)}>
              <Link href="/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
