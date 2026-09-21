'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/logout';
import styles from './Navbar.module.css';
import { getCards, getUsers } from '../api/endpoints';

type User = {
  username: string;
  password: string;
  pictureUrl: string;
};

type Card = {
  _id?: string;
  rating: number;
  comment: string;
  productId: string;
  username: string;
  submittedAt: string;
};

const Navbar = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {

    const fetchCards = async () => {
      try {
        const response = await getCards();
        setCards(response.data);
      } catch (err: any) {
        console.error('Error fetching cards:', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } catch (err: any) {
        console.error('Error fetching users:', err);
      }
    };

    const token = localStorage.getItem('token');
    const nameFromStorage = localStorage.getItem('username');

    setIsLoggedIn(true);
    setUserName(nameFromStorage || '');
    fetchCards();
  }, []);

  useEffect(() => {
    if (userName && users.length > 0) {
      console.log('PictureLink', users.find(u => u.username === userName)?.pictureUrl);
      console.log('User', users.find(u => u.username === userName)?.username);
    }
  }, [users, userName]);

  return (
    <>
      <nav className={styles.nav}>
      <button className={styles.menuToggle}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : styles.closed}`}>
        <li onClick={() => setMenuOpen(false)}>
          <Link href="/card">Create Card</Link>
        </li>
        <li onClick={() => setMenuOpen(false)}>
          <Link href="/cards">List of Cards</Link>
        </li>
        <li onClick={() => setMenuOpen(false)}>
          <Link href="/register">Register User</Link>
        </li>

          {isLoggedIn ? (
            <>
              <li key="logout">
                <button onClick={handleLogout}>Logout</button>
              </li>
              <li className="profile-link" key="profile">
                <Link href="/profile">
                  <div className="profile-container">
                    {userName && (
                      <span className="profile-name">{userName}</span>
                    )}
                  </div>
                </Link>
              </li>
            </>
          ) : (
            <li key="login">
              <Link href="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;