/**
 * Comprehensive list of popular books recommended on the website
 * Used to pre-generate SEO pages like "Books Like X"
 * 
 * Strategy: Focus on books that AI commonly recommends
 * When users read Book Y, AI recommends Book X → Book X gets "Books Like X" page
 * 
 * Sources:
 * - Category books (beginners, men, muslim-readers, self-improvement)
 * - Popular books from BookInput
 * - AI-recommended books (books commonly recommended by our AI)
 * - High-intent SEO targets
 */

export const popularBooks = [
  // Self-Improvement (High SEO value)
  { title: "Atomic Habits", author: "James Clear", category: "self-improvement", seoPriority: "high" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "self-improvement", seoPriority: "high" },
  { title: "Mindset", author: "Carol S. Dweck", category: "self-improvement", seoPriority: "high" },
  { title: "The Power of Now", author: "Eckhart Tolle", category: "self-improvement", seoPriority: "high" },
  { title: "Deep Work", author: "Cal Newport", category: "self-improvement", seoPriority: "high" },
  
  // Popular Fiction (High search volume) - AI Commonly Recommends These
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", category: "fiction", seoPriority: "high" },
  { title: "Daisy Jones & The Six", author: "Taylor Jenkins Reid", category: "fiction", seoPriority: "high" },
  { title: "Malibu Rising", author: "Taylor Jenkins Reid", category: "fiction", seoPriority: "high" },
  { title: "It Ends with Us", author: "Colleen Hoover", category: "fiction", seoPriority: "high" },
  { title: "Verity", author: "Colleen Hoover", category: "thriller", seoPriority: "high" },
  { title: "Ugly Love", author: "Colleen Hoover", category: "romance", seoPriority: "high" },
  { title: "November 9", author: "Colleen Hoover", category: "romance", seoPriority: "high" },
  { title: "The Midnight Library", author: "Matt Haig", category: "fiction", seoPriority: "high" },
  { title: "The Humans", author: "Matt Haig", category: "fiction", seoPriority: "medium" },
  { title: "How to Stop Time", author: "Matt Haig", category: "fiction", seoPriority: "medium" },
  { title: "Project Hail Mary", author: "Andy Weir", category: "sci-fi", seoPriority: "high" },
  { title: "The Martian", author: "Andy Weir", category: "sci-fi", seoPriority: "high" },
  { title: "The Silent Patient", author: "Alex Michaelides", category: "thriller", seoPriority: "high" },
  { title: "Where the Crawdads Sing", author: "Delia Owens", category: "fiction", seoPriority: "high" },
  { title: "The Girl on the Train", author: "Paula Hawkins", category: "thriller", seoPriority: "high" },
  
  // Thrillers - AI Frequently Recommends These
  { title: "The Housemaid", author: "Freida McFadden", category: "thriller", seoPriority: "high" },
  { title: "The Housemaid's Secret", author: "Freida McFadden", category: "thriller", seoPriority: "high" },
  { title: "The Inmate", author: "Freida McFadden", category: "thriller", seoPriority: "medium" },
  { title: "The Perfect Marriage", author: "Jeneva Rose", category: "thriller", seoPriority: "high" },
  { title: "The Wife Between Us", author: "Greer Hendricks", category: "thriller", seoPriority: "high" },
  { title: "The Last Thing He Told Me", author: "Laura Dave", category: "thriller", seoPriority: "high" },
  { title: "The Guest List", author: "Lucy Foley", category: "thriller", seoPriority: "high" },
  { title: "The Paris Apartment", author: "Lucy Foley", category: "thriller", seoPriority: "high" },
  { title: "The Hunting Party", author: "Lucy Foley", category: "thriller", seoPriority: "medium" },
  { title: "The Push", author: "Ashley Audrain", category: "thriller", seoPriority: "high" },
  { title: "The Chain", author: "Adrian McKinty", category: "thriller", seoPriority: "high" },
  { title: "The Family Upstairs", author: "Lisa Jewell", category: "thriller", seoPriority: "high" },
  { title: "Then She Was Gone", author: "Lisa Jewell", category: "thriller", seoPriority: "high" },
  { title: "None of This Is True", author: "Lisa Jewell", category: "thriller", seoPriority: "high" },
  { title: "The Plot", author: "Jean Hanff Korelitz", category: "thriller", seoPriority: "high" },
  
  // Mystery - AI Recommendations
  { title: "The Thursday Murder Club", author: "Richard Osman", category: "mystery", seoPriority: "high" },
  { title: "The Man Who Died Twice", author: "Richard Osman", category: "mystery", seoPriority: "high" },
  { title: "The Bullet That Missed", author: "Richard Osman", category: "mystery", seoPriority: "medium" },
  { title: "The Last Devil to Die", author: "Richard Osman", category: "mystery", seoPriority: "medium" },
  { title: "The Maid", author: "Nita Prose", category: "mystery", seoPriority: "high" },
  { title: "The Seven Deaths of Evelyn Hardcastle", author: "Stuart Turton", category: "mystery", seoPriority: "high" },
  { title: "The Devil and the Dark Water", author: "Stuart Turton", category: "mystery", seoPriority: "medium" },
  
  // Liane Moriarty - AI Frequently Recommends
  { title: "Big Little Lies", author: "Liane Moriarty", category: "thriller", seoPriority: "high" },
  { title: "The Husband's Secret", author: "Liane Moriarty", category: "thriller", seoPriority: "high" },
  { title: "Nine Perfect Strangers", author: "Liane Moriarty", category: "thriller", seoPriority: "high" },
  { title: "Truly Madly Guilty", author: "Liane Moriarty", category: "thriller", seoPriority: "medium" },
  { title: "Apples Never Fall", author: "Liane Moriarty", category: "thriller", seoPriority: "high" },
  
  // Classics & Literary Fiction
  { title: "The Alchemist", author: "Paulo Coelho", category: "literary", seoPriority: "high" },
  { title: "The Book Thief", author: "Markus Zusak", category: "literary", seoPriority: "high" },
  { title: "The Kite Runner", author: "Khaled Hosseini", category: "literary", seoPriority: "high" },
  { title: "A Thousand Splendid Suns", author: "Khaled Hosseini", category: "literary", seoPriority: "high" },
  { title: "The Handmaid's Tale", author: "Margaret Atwood", category: "dystopian", seoPriority: "high" },
  { title: "1984", author: "George Orwell", category: "dystopian", seoPriority: "high" },
  { title: "The Giver", author: "Lois Lowry", category: "dystopian", seoPriority: "medium" },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", category: "classic", seoPriority: "high" },
  
  // Memoirs & Non-Fiction
  { title: "Educated", author: "Tara Westover", category: "memoir", seoPriority: "high" },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "non-fiction", seoPriority: "high" },
  { title: "Into the Wild", author: "Jon Krakauer", category: "non-fiction", seoPriority: "medium" },
  { title: "Meditations", author: "Marcus Aurelius", category: "philosophy", seoPriority: "high" },
  
  // Literary Classics
  { title: "The Old Man and the Sea", author: "Ernest Hemingway", category: "classic", seoPriority: "high" },
  { title: "The Road", author: "Cormac McCarthy", category: "literary", seoPriority: "medium" },
  { title: "The Curious Incident of the Dog in the Night-Time", author: "Mark Haddon", category: "literary", seoPriority: "medium" },
  
  // Muslim Authors & Diverse Voices
  { title: "The Forty Rules of Love", author: "Elif Shafak", category: "literary", seoPriority: "high" },
  { title: "The Reluctant Fundamentalist", author: "Mohsin Hamid", category: "literary", seoPriority: "medium" },
  { title: "Home Fire", author: "Kamila Shamsie", category: "literary", seoPriority: "medium" },
  
  // Asian Literature
  { title: "Pachinko", author: "Min Jin Lee", category: "literary", seoPriority: "high" },
  { title: "The Vegetarian", author: "Han Kang", category: "literary", seoPriority: "medium" },
  { title: "Convenience Store Woman", author: "Sayaka Murata", category: "literary", seoPriority: "medium" },
  { title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", category: "literary", seoPriority: "medium" },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", category: "literary", seoPriority: "high" },
  { title: "Crying in H Mart", author: "Michelle Zauner", category: "memoir", seoPriority: "medium" },
  
  // Fredrik Backman - AI Frequently Recommends
  { title: "Anxious People", author: "Fredrik Backman", category: "fiction", seoPriority: "high" },
  { title: "A Man Called Ove", author: "Fredrik Backman", category: "fiction", seoPriority: "high" },
  { title: "Beartown", author: "Fredrik Backman", category: "fiction", seoPriority: "high" },
  { title: "My Grandmother Asked Me to Tell You She's Sorry", author: "Fredrik Backman", category: "fiction", seoPriority: "medium" },
  
  // Contemporary Literary - AI Recommendations
  { title: "Eleanor Oliphant Is Completely Fine", author: "Gail Honeyman", category: "fiction", seoPriority: "high" },
  { title: "Normal People", author: "Sally Rooney", category: "literary", seoPriority: "high" },
  { title: "Conversations with Friends", author: "Sally Rooney", category: "literary", seoPriority: "high" },
  { title: "Beautiful World, Where Are You", author: "Sally Rooney", category: "literary", seoPriority: "high" },
  { title: "My Dark Vanessa", author: "Kate Elizabeth Russell", category: "literary", seoPriority: "high" },
  { title: "The Goldfinch", author: "Donna Tartt", category: "literary", seoPriority: "high" },
  { title: "The Secret History", author: "Donna Tartt", category: "literary", seoPriority: "high" },
  { title: "The Vanishing Half", author: "Brit Bennett", category: "literary", seoPriority: "high" },
  { title: "Such a Fun Age", author: "Kiley Reid", category: "fiction", seoPriority: "high" },
  { title: "The Paper Palace", author: "Miranda Cowley Heller", category: "fiction", seoPriority: "high" },
  { title: "The Dutch House", author: "Ann Patchett", category: "literary", seoPriority: "high" },
  { title: "The Overstory", author: "Richard Powers", category: "literary", seoPriority: "high" },
  
  // Historical Fiction - AI Recommendations
  { title: "The Nightingale", author: "Kristin Hannah", category: "historical-fiction", seoPriority: "high" },
  { title: "The Four Winds", author: "Kristin Hannah", category: "historical-fiction", seoPriority: "high" },
  { title: "Firefly Lane", author: "Kristin Hannah", category: "fiction", seoPriority: "high" },
  { title: "The Great Alone", author: "Kristin Hannah", category: "fiction", seoPriority: "high" },
  { title: "The Giver of Stars", author: "Jojo Moyes", category: "historical-fiction", seoPriority: "high" },
  { title: "Me Before You", author: "Jojo Moyes", category: "romance", seoPriority: "high" },
  { title: "The Help", author: "Kathryn Stockett", category: "historical-fiction", seoPriority: "high" },
  
  // Fantasy - AI Frequently Recommends
  { title: "The Song of Achilles", author: "Madeline Miller", category: "literary", seoPriority: "high" },
  { title: "Circe", author: "Madeline Miller", category: "literary", seoPriority: "high" },
  { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", category: "fantasy", seoPriority: "high" },
  { title: "A Darker Shade of Magic", author: "V.E. Schwab", category: "fantasy", seoPriority: "medium" },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", category: "fantasy", seoPriority: "high" },
  { title: "The Wise Man's Fear", author: "Patrick Rothfuss", category: "fantasy", seoPriority: "high" },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", category: "fantasy", seoPriority: "high" },
  { title: "The Way of Kings", author: "Brandon Sanderson", category: "fantasy", seoPriority: "high" },
  { title: "Words of Radiance", author: "Brandon Sanderson", category: "fantasy", seoPriority: "high" },
  { title: "A Game of Thrones", author: "George R.R. Martin", category: "fantasy", seoPriority: "high" },
  { title: "A Clash of Kings", author: "George R.R. Martin", category: "fantasy", seoPriority: "high" },
  { title: "A Storm of Swords", author: "George R.R. Martin", category: "fantasy", seoPriority: "high" },
  { title: "The Priory of the Orange Tree", author: "Samantha Shannon", category: "fantasy", seoPriority: "high" },
  { title: "Six of Crows", author: "Leigh Bardugo", category: "fantasy", seoPriority: "high" },
  { title: "Crooked Kingdom", author: "Leigh Bardugo", category: "fantasy", seoPriority: "high" },
  { title: "Shadow and Bone", author: "Leigh Bardugo", category: "fantasy", seoPriority: "high" },
  { title: "Ninth House", author: "Leigh Bardugo", category: "fantasy", seoPriority: "high" },
  { title: "The Poppy War", author: "R.F. Kuang", category: "fantasy", seoPriority: "high" },
  { title: "Babel", author: "R.F. Kuang", category: "fantasy", seoPriority: "high" },
  { title: "Yellowface", author: "R.F. Kuang", category: "literary", seoPriority: "high" },
  { title: "The Atlas Six", author: "Olivie Blake", category: "fantasy", seoPriority: "high" },
  
  // Sci-Fi - AI Recommendations
  { title: "Dune", author: "Frank Herbert", category: "sci-fi", seoPriority: "high" },
  { title: "The Three-Body Problem", author: "Liu Cixin", category: "sci-fi", seoPriority: "high" },
  { title: "Ready Player One", author: "Ernest Cline", category: "sci-fi", seoPriority: "high" },
  { title: "Red Rising", author: "Pierce Brown", category: "sci-fi", seoPriority: "high" },
  
  // Dystopian - AI Frequently Recommends
  { title: "The Hunger Games", author: "Suzanne Collins", category: "dystopian", seoPriority: "high" },
  { title: "Catching Fire", author: "Suzanne Collins", category: "dystopian", seoPriority: "high" },
  { title: "Mockingjay", author: "Suzanne Collins", category: "dystopian", seoPriority: "high" },
  { title: "The Ballad of Songbirds and Snakes", author: "Suzanne Collins", category: "dystopian", seoPriority: "high" },
  { title: "Divergent", author: "Veronica Roth", category: "dystopian", seoPriority: "high" },
  { title: "The Maze Runner", author: "James Dashner", category: "dystopian", seoPriority: "high" },
  
  // Horror - AI Recommendations
  { title: "The Shining", author: "Stephen King", category: "horror", seoPriority: "high" },
  { title: "It", author: "Stephen King", category: "horror", seoPriority: "high" },
  { title: "The Stand", author: "Stephen King", category: "horror", seoPriority: "high" },
  { title: "11/22/63", author: "Stephen King", category: "sci-fi", seoPriority: "high" },
  { title: "Fairy Tale", author: "Stephen King", category: "fantasy", seoPriority: "high" },
  { title: "Holly", author: "Stephen King", category: "horror", seoPriority: "high" },

  // Emily Henry - Massive romance/fiction author, all high search volume
  { title: "Beach Read", author: "Emily Henry", category: "romance", seoPriority: "high" },
  { title: "Book Lovers", author: "Emily Henry", category: "romance", seoPriority: "high" },
  { title: "People We Meet on Vacation", author: "Emily Henry", category: "romance", seoPriority: "high" },
  { title: "Happy Place", author: "Emily Henry", category: "romance", seoPriority: "high" },
  { title: "Funny Story", author: "Emily Henry", category: "romance", seoPriority: "high" },
  { title: "Great Expectations", author: "Emily Henry", category: "romance", seoPriority: "high" },

  // Rebecca Yarros - Biggest fantasy release in years
  { title: "Fourth Wing", author: "Rebecca Yarros", category: "fantasy", seoPriority: "high" },
  { title: "Iron Flame", author: "Rebecca Yarros", category: "fantasy", seoPriority: "high" },
  { title: "Onyx Storm", author: "Rebecca Yarros", category: "fantasy", seoPriority: "high" },

  // 2022-2025 Literary Bestsellers & Award Winners
  { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", category: "literary", seoPriority: "high" },
  { title: "The Women", author: "Kristin Hannah", category: "historical-fiction", seoPriority: "high" },
  { title: "Intermezzo", author: "Sally Rooney", category: "literary", seoPriority: "high" },
  { title: "Demon Copperhead", author: "Barbara Kingsolver", category: "literary", seoPriority: "high" },
  { title: "James", author: "Percival Everett", category: "literary", seoPriority: "high" },
  { title: "The God of the Woods", author: "Lauren Fox", category: "thriller", seoPriority: "high" },
  { title: "The Life Impossible", author: "Matt Haig", category: "fiction", seoPriority: "high" },
  { title: "All the Light We Cannot See", author: "Anthony Doerr", category: "historical-fiction", seoPriority: "high" },
  { title: "The Heaven and Earth Grocery Store", author: "James McBride", category: "literary", seoPriority: "high" },
  { title: "Lessons in Chemistry", author: "Bonnie Garmus", category: "fiction", seoPriority: "high" },
  { title: "The Covenant of Water", author: "Abraham Verghese", category: "literary", seoPriority: "high" },
  { title: "Hello Beautiful", author: "Ann Napolitano", category: "literary", seoPriority: "high" },
  { title: "In Memoriam", author: "Alice Winn", category: "historical-fiction", seoPriority: "high" },

  // 2024-2025 Thrillers & Mystery Hits
  { title: "The Women in the Walls", author: "Amy Gentry", category: "thriller", seoPriority: "medium" },
  { title: "The Maid and the Mansion", author: "Nita Prose", category: "mystery", seoPriority: "medium" },
  { title: "The Hotel Nantucket", author: "Elin Hilderbrand", category: "fiction", seoPriority: "high" },
  { title: "Swan Song", author: "Elin Hilderbrand", category: "fiction", seoPriority: "high" },
  { title: "The Lost Apothecary", author: "Sarah Penner", category: "historical-fiction", seoPriority: "high" },
  { title: "The Thursday Murder Club", author: "Richard Osman", category: "mystery", seoPriority: "high" },
  { title: "In a holidaze", author: "Christina Lauren", category: "romance", seoPriority: "medium" },

  // Christina Lauren - Popular romance duo
  { title: "The Unhoneymooners", author: "Christina Lauren", category: "romance", seoPriority: "high" },
  { title: "Twice in a Blue Moon", author: "Christina Lauren", category: "romance", seoPriority: "medium" },

  // Ali Hazelwood - Popular romance/STEM author
  { title: "The Love Hypothesis", author: "Ali Hazelwood", category: "romance", seoPriority: "high" },
  { title: "Love on the Brain", author: "Ali Hazelwood", category: "romance", seoPriority: "high" },
  { title: "Bride", author: "Ali Hazelwood", category: "romance", seoPriority: "high" },

  // Nonfiction 2023-2025
  { title: "Outlive", author: "Peter Attia", category: "non-fiction", seoPriority: "high" },
  { title: "The Wager", author: "David Grann", category: "non-fiction", seoPriority: "high" },
  { title: "Greenlights", author: "Matthew McConaughey", category: "memoir", seoPriority: "high" },
  { title: "I'm Glad My Mom Died", author: "Jennette McCurdy", category: "memoir", seoPriority: "high" },
  { title: "Spare", author: "Prince Harry", category: "memoir", seoPriority: "high" },
  { title: "Poverty, by America", author: "Matthew Desmond", category: "non-fiction", seoPriority: "high" },
  { title: "The Anxious Generation", author: "Jonathan Haidt", category: "non-fiction", seoPriority: "high" },
  { title: "Atlas of the Heart", author: "Brené Brown", category: "non-fiction", seoPriority: "high" },
  { title: "Four Thousand Weeks", author: "Oliver Burkeman", category: "self-improvement", seoPriority: "high" },
  { title: "Think Again", author: "Adam Grant", category: "self-improvement", seoPriority: "high" },
  { title: "Die with Zero", author: "Bill Perkins", category: "self-improvement", seoPriority: "high" },

  // Romance classics often recommended alongside modern romance
  { title: "The Hating Game", author: "Sally Thorne", category: "romance", seoPriority: "high" },
  { title: "Red, White and Royal Blue", author: "Casey McQuiston", category: "romance", seoPriority: "high" },
  { title: "One Last Stop", author: "Casey McQuiston", category: "romance", seoPriority: "high" },
  { title: "The Kiss Quotient", author: "Helen Hoang", category: "romance", seoPriority: "high" },
  { title: "The Bride Test", author: "Helen Hoang", category: "romance", seoPriority: "medium" },

  // More recent fantasy hits
  { title: "A Court of Thorns and Roses", author: "Sarah J. Maas", category: "fantasy", seoPriority: "high" },
  { title: "A Court of Mist and Fury", author: "Sarah J. Maas", category: "fantasy", seoPriority: "high" },
  { title: "A Court of Silver Flames", author: "Sarah J. Maas", category: "fantasy", seoPriority: "high" },
  { title: "Throne of Glass", author: "Sarah J. Maas", category: "fantasy", seoPriority: "high" },
  { title: "House of Earth and Blood", author: "Sarah J. Maas", category: "fantasy", seoPriority: "high" },
  { title: "The House in the Cerulean Sea", author: "TJ Klune", category: "fantasy", seoPriority: "high" },
  { title: "Under the Whispering Door", author: "TJ Klune", category: "fantasy", seoPriority: "high" },
  { title: "Piranesi", author: "Susanna Clarke", category: "fantasy", seoPriority: "high" },
  { title: "Jonathan Strange and Mr Norrell", author: "Susanna Clarke", category: "fantasy", seoPriority: "medium" },
  { title: "The Jasad Heir", author: "Sara Hashem", category: "fantasy", seoPriority: "high" },
  { title: "A Promise of Peridot", author: "Kate Golden", category: "fantasy", seoPriority: "medium" },
];

/**
 * Get all popular books (deduplicated)
 */
export function getAllPopularBooks() {
  // Remove duplicates based on title + author
  const seen = new Set();
  return popularBooks.filter(book => {
    const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Get books by category
 */
export function getBooksByCategory(category) {
  return getAllPopularBooks().filter(book => book.category === category);
}

/**
 * Get high-priority SEO books
 */
export function getHighPriorityBooks() {
  return getAllPopularBooks().filter(book => book.seoPriority === "high");
}

/**
 * Get book slugs for all popular books
 */
export function getAllBookSlugs() {
  return getAllPopularBooks().map(book => ({
    slug: book.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
    title: book.title,
    author: book.author,
    category: book.category,
    seoPriority: book.seoPriority,
  }));
}
