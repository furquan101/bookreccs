/**
 * Category-based book recommendations
 * Structured data for curated book lists by category
 */

export const categoryBooks = {
  beginners: {
    title: "Best Books for Beginners",
    description: "Perfect starting points for new readers. These books are engaging, accessible, and will help you fall in love with reading.",
    books: [
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        reason: "A simple yet profound story that's perfect for new readers"
      },
      {
        title: "The Giver",
        author: "Lois Lowry",
        reason: "Short, thought-provoking, and easy to follow"
      },
      {
        title: "The Curious Incident of the Dog in the Night-Time",
        author: "Mark Haddon",
        reason: "Unique perspective and engaging narrative"
      },
      {
        title: "The Little Prince",
        author: "Antoine de Saint-Exupéry",
        reason: "A timeless classic that's both simple and deep"
      },
      {
        title: "The Book Thief",
        author: "Markus Zusak",
        reason: "Beautifully written and emotionally engaging"
      }
    ]
  },
  men: {
    title: "Best Books for Men",
    description: "Curated recommendations that explore themes of masculinity, adventure, growth, and compelling narratives.",
    books: [
      {
        title: "The Old Man and the Sea",
        author: "Ernest Hemingway",
        reason: "A timeless tale of perseverance and dignity"
      },
      {
        title: "Into the Wild",
        author: "Jon Krakauer",
        reason: "A powerful story of adventure and self-discovery"
      },
      {
        title: "The Road",
        author: "Cormac McCarthy",
        reason: "A profound exploration of fatherhood and survival"
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        reason: "Fascinating exploration of human history"
      },
      {
        title: "Meditations",
        author: "Marcus Aurelius",
        reason: "Timeless wisdom on life and leadership"
      }
    ]
  },
  "muslim-readers": {
    title: "Best Books for Muslim Readers",
    description: "Thoughtful recommendations featuring Muslim authors, Islamic themes, and stories that resonate with Muslim experiences.",
    books: [
      {
        title: "The Forty Rules of Love",
        author: "Elif Shafak",
        reason: "A beautiful story connecting Rumi's wisdom with modern life"
      },
      {
        title: "The Kite Runner",
        author: "Khaled Hosseini",
        reason: "Powerful storytelling about friendship and redemption"
      },
      {
        title: "The Muslim 100",
        author: "Muhammad Mojlum Khan",
        reason: "Inspiring profiles of influential Muslims throughout history"
      },
      {
        title: "In the Footsteps of the Prophet",
        author: "Tariq Ramadan",
        reason: "A thoughtful biography of Prophet Muhammad (PBUH)"
      },
      {
        title: "The Reluctant Fundamentalist",
        author: "Mohsin Hamid",
        reason: "A compelling narrative exploring identity and belonging"
      }
    ]
  },
  "self-improvement": {
    title: "Best Books for Self-Improvement",
    description: "Transformative reads that will help you grow, develop new skills, and become the best version of yourself.",
    books: [
      {
        title: "Atomic Habits",
        author: "James Clear",
        reason: "Practical guide to building good habits and breaking bad ones"
      },
      {
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen R. Covey",
        reason: "Timeless principles for personal and professional success"
      },
      {
        title: "Mindset",
        author: "Carol S. Dweck",
        reason: "Transform your thinking with the growth mindset"
      },
      {
        title: "The Power of Now",
        author: "Eckhart Tolle",
        reason: "A guide to spiritual enlightenment and living in the present"
      },
      {
        title: "Deep Work",
        author: "Cal Newport",
        reason: "Master the art of focused work in a distracted world"
      }
    ]
  }
};

/**
 * Get category data by slug
 */
export function getCategoryBySlug(slug) {
  return categoryBooks[slug] || null;
}

/**
 * Get all available category slugs
 */
export function getAllCategorySlugs() {
  return Object.keys(categoryBooks);
}
