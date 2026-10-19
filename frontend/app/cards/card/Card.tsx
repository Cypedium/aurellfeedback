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

// Gemensam stil för fälten
const FIELD_CLASS =
  'w-full rounded-[3px] border border-jira-border bg-white text-jira-text transition-[border-color,box-shadow] duration-150 hover:bg-jira-hover';
const FIELD_FOCUS_CLASS =
  'focus:border-jira-focus focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-jira-focus)] focus:outline-none';
const LABEL_CLASS = 'mt-4 mb-1 block text-xs font-semibold text-jira-secondary';
const SECTION_PADDING = 'px-6 max-[480px]:px-4';

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
    <form
      className="mx-auto my-6 w-full max-w-[640px] rounded-lg bg-white font-jira text-sm text-jira-text shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)] max-[480px]:my-3"
      onSubmit={handleSubmit}
    >
      <header className={`${SECTION_PADDING} pt-6 pb-2`}>
        <h2 className="mb-2 text-xl font-semibold" id="card-form-title">
          {isEdit ? 'Edit card' : 'Create card'}
        </h2>
        <p className="text-xs text-jira-secondary">
          Required fields are marked with an asterisk <span className="text-jira-danger">*</span>
        </p>
      </header>

      <div className={`${SECTION_PADDING} flex flex-col pt-2 pb-4`}>
        <span className="inline-flex items-center gap-2 self-start rounded-[3px] bg-jira-lane px-2 py-1 font-medium">
          <span
            className="inline-flex size-4 items-center justify-center rounded-[3px] bg-jira-task text-white"
            aria-hidden
          >
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

        <label className={LABEL_CLASS} htmlFor="summary">
          Summary <span className="text-jira-danger">*</span>
        </label>
        <textarea
          id="summary"
          className={`${FIELD_CLASS} ${FIELD_FOCUS_CLASS} min-h-[88px] resize-y p-2`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What needs to be done?"
          required
        />

        <label className={LABEL_CLASS} htmlFor="issueKey">
          Issue key <span className="text-jira-danger">*</span>
        </label>
        <input
          id="issueKey"
          className={`${FIELD_CLASS} ${FIELD_FOCUS_CLASS} p-2`}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="e.g. AGB-12"
          required
        />

        <span className={LABEL_CLASS} id="priority-label">
          Priority <span className="text-jira-danger">*</span>
        </span>
        <div className="flex gap-2" role="group" aria-labelledby="priority-label">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`h-8 min-w-9 rounded-full font-semibold ${
                p === rating
                  ? 'bg-jira-primary text-white'
                  : 'bg-jira-neutral text-jira-text hover:bg-jira-neutral-hover'
              }`}
              aria-pressed={p === rating}
              onClick={() => setRating(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <label className={LABEL_CLASS} htmlFor="date">
          Date <span className="text-jira-danger">*</span>
        </label>
        <div
          className={`${FIELD_CLASS} flex items-center pr-1 pl-2 focus-within:border-jira-focus focus-within:bg-white focus-within:shadow-[inset_0_0_0_1px_var(--color-jira-focus)]`}
        >
          <DatePicker
            ref={datePickerRef}
            id="date"
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            required
            locale="sv"
            className="w-full cursor-pointer bg-transparent py-2 outline-none"
            wrapperClassName="flex-1"
            maxDate={new Date()}
          />
          <button
            type="button"
            className="rounded-[3px] px-2 py-1.5 text-jira-secondary hover:bg-jira-neutral"
            aria-label="Open calendar"
            onClick={() => datePickerRef.current?.setOpen(true)}
          >
            <FontAwesomeIcon icon={faCalendar} />
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-[3px] bg-jira-info px-3 py-2 text-jira-text">{message}</p>
        )}
      </div>

      <footer className={`${SECTION_PADDING} flex justify-end gap-2 pt-4 pb-6`}>
        <button
          type="button"
          className="h-8 rounded-[3px] px-3 font-medium text-jira-secondary hover:bg-jira-lane"
          onClick={() => (onCancel ? onCancel() : router.back())}
        >
          Cancel
        </button>
        <button
          className="h-8 rounded-[3px] bg-jira-primary px-3 font-medium text-white hover:bg-jira-primary-hover"
          type="submit"
        >
          {isEdit ? 'Save' : 'Create'}
        </button>
      </footer>
    </form>
  );
}
