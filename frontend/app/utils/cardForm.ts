import leoProfanity from "leo-profanity";

leoProfanity.loadDictionary();
leoProfanity.loadDictionary("sv");

export const PRIORITIES = [1, 2, 3, 4, 5];

export type CardFormFields = { comment: string; productId: string; rating: number };

// Returnerar ett felmeddelande, eller null om formuläret kan skickas
export const validateCardForm = ({ comment, productId, rating }: CardFormFields): string | null => {
  if (leoProfanity.check(comment) || leoProfanity.check(productId)) {
    return "Your text contains inappropriate language. Please remove it and try again.";
  }
  if (rating < 1) {
    return "Please select a priority.";
  }
  return null;
};
