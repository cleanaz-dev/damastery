export type Quote = {
  text: string;
  author: string;
  source?: string;
};

export const quotes: Quote[] = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    source: "The Story of Philosophy",
  },
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates",
    source: "Plato, Apology",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Stanford commencement address, 2005",
  },
  {
    text: "He who has a why to live for can bear almost any how.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols",
  },
  {
    text: "Life can only be understood backwards; but it must be lived forwards.",
    author: "Søren Kierkegaard",
    source: "Journals",
  },
  {
    text: "Everything can be taken from a man but one thing: the last of the human freedoms, to choose one's attitude in any given set of circumstances.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    source: "Letters to Lucilius",
  },
  {
    text: "I am not afraid of storms, for I am learning how to sail my ship.",
    author: "Louisa May Alcott",
    source: "Little Women",
  },
  {
    text: "Nothing will work unless you do.",
    author: "Maya Angelou",
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    source: "Tao Te Ching",
  },
];