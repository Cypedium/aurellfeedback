'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Card.module.css';
import { submitCard, updateCard, type Card as CardData } from '..//../api/endpoints';
import DatePicker, { registerLocale } from 'react-datepicker';
import { sv } from 'date-fns/locale/sv';
import leoProfanity from "leo-profanity";
import { isAxiosError } from 'axios';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


registerLocale('sv', sv);
leoProfanity.loadDictionary();
leoProfanity.loadDictionary('sv');

const PRIORITIES = [1, 2, 3, 4, 5];

type CardProps = {
  // Set when editing an existing card; omitted on the create page
  card?: CardData;
  onSaved?: (card: CardData) => void;
  onCancel?: () => void;
};

export default function Card({ card, onSaved, onCancel }: CardProps = {}) {
  const isEdit = Boolean(card?._id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    card ? new Date(card.submittedAt) : null
  );
  const [rating, setRating] = useState<number>(card?.rating ?? 0);
  const [comment, setComment] = useState<string>(card?.comment ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>(card?.productId ?? '');
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

    const fields = {
      rating,
      comment,
      productId,
      submittedAt: selectedDate?.toISOString() || new Date().toISOString()
    };

    if (isEdit && card?._id) {
      try {
        const res = await updateCard(card._id, fields);
        onSaved?.(res.data);
      } catch (error) {
        console.error('Update error:', error);
        const serverMessage = isAxiosError(error) ? error.response?.data?.message : null;
        setMessage(serverMessage || 'Failed to save card.');
      }
      return;
    }

    try {
      // Author is taken from the access token by the backend
      const res = await submitCard(fields);

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

  return (
    <form className={styles.formCreate} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <h2 className={styles.title} id="card-form-title">
          {isEdit ? 'Edit card' : 'Create card'}
        </h2>
        <p className={styles.hint}>
          Required fields are marked with an asterisk <span className={styles.required}>*</span>
        </p>
      </header>

      <div className={styles.body}>
        <span className={styles.issueTypeRow}>
          <span className={styles.issueType} aria-hidden>
            <svg viewBox="0 0 16 16" width="10" height="10">
              <path
                d="M3 8.5l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Task
        </span>

        <label className={styles.labelCreate} htmlFor="summary">
          Summary <span className={styles.required}>*</span>
        </label>
        <textarea
          id="summary"
          className={styles.textareaCreate}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What needs to be done?"
          required
        />

        <label className={styles.labelCreate} htmlFor="issueKey">
          Issue key <span className={styles.required}>*</span>
        </label>
        <input
          id="issueKey"
          className={styles.inputCreate}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="e.g. AGB-12"
          required
        />

        <span className={styles.labelCreate} id="priority-label">
          Priority <span className={styles.required}>*</span>
        </span>
        <div className={styles.priority} role="group" aria-labelledby="priority-label">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.priorityOption} ${p === rating ? styles.selected : ''}`}
              aria-pressed={p === rating}
              onClick={() => setRating(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <label className={styles.labelCreate} htmlFor="date">
          Date <span className={styles.required}>*</span>
        </label>
        <div className={styles.dateBox}>
          <DatePicker
            ref={datePickerRef}
            id="date"
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            required
            locale="sv"
            className={styles.dateInput}
            wrapperClassName={styles.dateWrapper}
            maxDate={new Date()}
          />
          <button
            type="button"
            className={styles.dateIcon}
            aria-label="Open calendar"
            onClick={() => datePickerRef.current?.setOpen(true)}
          >
            <FontAwesomeIcon icon={faCalendar} />
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.buttonCancel} onClick={() => (onCancel ? onCancel() : router.back())}>
          Cancel
        </button>
        <button className={styles.buttonCreate} type="submit">
          {isEdit ? 'Save' : 'Create'}
        </button>
      </footer>
    </form>
  );
}
