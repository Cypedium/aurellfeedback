'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/logout';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Navbar.module.css';

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
    <nav className={styles.nav}>
      <button
        className={styles.menuToggle}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <XMarkIcon className="size-8" aria-hidden /> : <Bars3Icon className="size-8" aria-hidden />}
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : styles.closed}`}>
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
              <li className="profile-link" key="profile">
                <div className="profile-container">
                  <span className="profile-name">{userName}</span>
                </div>
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
