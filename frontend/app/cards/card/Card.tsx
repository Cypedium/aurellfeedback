'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Card.module.css';
import { submitCard } from '..//../api/endpoints';
import DatePicker, { registerLocale } from 'react-datepicker';
import { sv } from 'date-fns/locale/sv';
import leoProfanity from "leo-profanity";
import { isAxiosError } from 'axios';


registerLocale('sv', sv);
leoProfanity.loadDictionary();
leoProfanity.loadDictionary('sv');

export default function Card() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>('');
  const router = useRouter();
  const datePickerRef = useRef<any>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (leoProfanity.check(comment) || leoProfanity.check(productId)) {
      setMessage("Your text contains inappropriate language. Please remove it and try again.");
      return;
    }

    if (rating < 1) {
      setMessage('Please select a priority.');
      return;
    }

    try {
      // Author is taken from the access token by the backend
      const res = await submitCard({
        rating,
        comment,
        productId,
        submittedAt: selectedDate?.toISOString() || new Date().toISOString()
      });

      setMessage(res.data.message || 'Card submitted!');
      setRating(0);
      setComment('');
      setProductId('');
      setSelectedDate(null);

      setTimeout(() => {
        router.push("/");
      }, 5000);

    } catch (error) {
      console.error('Submission error:', error);
      const serverMessage = isAxiosError(error) ? error.response?.data?.message : null;
      setMessage(serverMessage || 'Failed to submit card.');
    }
  };

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  return (
    <form className={styles.formCreate} onSubmit={handleSubmit}>
      <label className={styles.labelCreate}>Priority:</label>
      <div className={styles.starRating}>
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`${styles.star} ${index < rating ? styles.filled : ''}`}
            onClick={() => handleStarClick(index)}
          >
            ★
          </span>
        ))}
      </div>

      <label className={styles.labelCreate}>Issue Key:</label>
      <textarea
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Add your product here"
        required
        className={styles.textareaCreate}
      />

      <label className={styles.labelCreate}>Date:</label>
      <div className={styles.dateBox}>
        <DatePicker
          ref={datePickerRef}
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Pick a date"
          required
          locale="sv"
          className={styles.dateInput}
          maxDate={new Date()}
        />
        <span
          className={styles.dateIcon}
          onClick={() => datePickerRef.current?.setOpen(true)}
        >📅</span>
      </div>

      <label className={styles.labelCreate}>Summary:</label>
      <textarea
        className={styles.textareaCreate}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <button className={styles.buttonCreate} type="submit">
        Submit Card
      </button>

      {message && <p style={{ marginTop: '12px' }}>{message}</p>}
    </form>
  );
}