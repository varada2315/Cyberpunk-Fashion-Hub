import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

// Brand-centric blog data derived from Home page themes
const mockBlogPosts = [
  {
    id: 1,
    title: "NevrFade vs NeverFade: Why the Name Matters",
    excerpt: "You might have searched for 'NeverFade', but you found NevrFade. Here's why our name is as unique as our mission.",
    content: `Many people ask us, "Why NevrFade? Isn't it spelled NeverFade?"

The short answer: because we don't follow the crowd. 

When we started this journey, we wanted a name that reflected our identity — clean, bold, and distinct. While 'NeverFade' is a common search term, NevrFade is the original entity. We dropped the 'e' to represent our focus on what's essential. Just like our designs, we've stripped away the noise to focus on the core: premium quality, timeless style, and a mindset that survives the test of time.

In a world full of 'NeverFade' clones, we chose NevrFade to stand for the individuals who don't need to shout to be heard. It's about being original in a copy-paste world. So whether you found us by accident or by intention, you're exactly where you need to be. Welcome to the hub of premium streetwear that truly never fades.`,
    date: "2026-04-18",
    author: "NevrFade Team",
    image: "/1776701193808.png",
    category: "Identity"
  },
  {
    id: 2,
    title: "The Mindset: Built for the Ones Who Rise",
    excerpt: "Discipline over excuses. Growth over comfort. Authenticity over crowd-following. This is the NevrFade way.",
    content: `At NevrFade, we often say: "Some people don't fade. They rise." But what does that actually mean?

It means choosing the hard path when the easy one is right there. It means keeping your head down and working while others are talking. It's the silent strength of the individual who knows their worth doesn't depend on external validation.

NevrFade was born for the hustlers. The ones who are in the gym at 5 AM. The ones who are burning the midnight oil on their passion projects. The ones who understand that consistency is the only magic pill that exists.

Our clothing isn't just fabric; it's a uniform for your ambition. When you wear a NevrFade piece, it's a reminder to yourself and the world that you are built different. You are committed to growth, discipline, and remaining authentic to who you truly are. You don't blend in because you weren't meant to. You rise.`,
    date: "2026-04-15",
    author: "Founders Circle",
    image: "/1776701071862.png",
    category: "Mindset"
  },
  {
    id: 3,
    title: "The Craft: Why Our Fabric Never Fades",
    excerpt: "Take a deep dive into our manufacturing process and why we obsess over every stitch and thread.",
    content: `When we say "NevrFade," we aren't just talking about your mindset. We're talking about your clothes.

We've all been there — you buy a shirt you love, and after three washes, it looks like a rag. The color is gone, the shape is warped, and the stitching is coming apart. At NevrFade, we decided that wasn't good enough.

As a premium clothing brand based in India, we obsess over three things: Detail, Durability, and Consistency.

1. **Strong & Breathable Fabrics**: We source only the highest grade cotton and performance blends. Our T-shirts and Gym Sandos are designed to handle high-intensity training and the rigors of daily life without losing their integrity.
2. **Flawless Smooth Stitching**: Every seam is a commitment to quality. Our finishing is what sets us apart from the mass-produced fast fashion that dominates the market.
3. **Conscious Form**: All our products are 100% cruelty-free. We believe that fashion should feel good to wear and right to stand behind.

Made in India with a global mindset, NevrFade is built to last — in style, quality, and identity.`,
    date: "2026-04-12",
    author: "Design Lead",
    image: "/1776696793600 (1).png",
    category: "Quality"
  },
  {
    id: 4,
    title: "Modern Streetwear: Trendy Yet Timeless",
    excerpt: "How to balance the latest trends with a minimal aesthetic that stays relevant for years.",
    content: `The problem with trends is that they fade. Fast.

What's "in" today is "out" tomorrow. This cycle leads to cluttered closets and a lack of personal style. At NevrFade, our design philosophy is different: Trendy yet Timeless.

We take the energy of modern streetwear — the bold silhouettes, the minimal branding, the clean lines — and we anchor it in timeless aesthetics. This means a NevrFade piece you buy today will still look relevant three years from now.

Our latest drops focus on:
- **Clean Palettes**: Using colors that are easy to style and never go out of fashion.
- **Minimalist Detail**: Subtle logos and purposeful designs that speak volumes without shouting.
- **Versatility**: Pieces that transition seamlessly from a gym session to a casual night out.

Stop chasing the next big thing and start building a wardrobe that reflects your consistency. Choose the pieces that never fade.`,
    date: "2026-04-09",
    author: "Style Editor",
    image: "/1776701193808.png",
    category: "Style"
  }
];

export default function Blog() {
  const [posts] = useState(mockBlogPosts);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mb-4 font-black uppercase tracking-tighter">The NevrFade Journal</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-sans text-lg">
            Inside looks at our mindset, our craft, and the stories of those who refuse to fade.
          </p>
        </div>

        {selectedPost ? (
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setSelectedPost(null)}
              className="mb-6 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="15" y1="18" x2="9" y2="12"></line>
                <line x1="9" y1="6" x2="15" y2="12"></line>
              </svg>
              Back to Blog
            </button>
            
            <article className="bg-card border border-border rounded-xl overflow-hidden">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {selectedPost.category}
                  </span>
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                    {formatDate(selectedPost.date)}
                  </span>
                </div>
                <h2 className="text-3xl font-heading text-foreground mb-4">{selectedPost.title}</h2>
                <p className="text-muted-foreground mb-6">By {selectedPost.author}</p>
                <div className="prose prose-lg max-w-none">
                  {selectedPost.content.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPost(post)}
              >
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {post.category}
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Read more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Brand Manifesto Section - Added Text-based content from Home */}
        <div className="mt-24 pt-16 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tighter text-foreground mb-6">
                Built for the ones <br/>
                <span className="text-muted-foreground">who never fade.</span>
              </h2>
              <p className="font-sans text-foreground/80 text-lg leading-relaxed mb-8">
                NevrFade stands for consistency, self-belief and silent strength. Created for those who keep moving even when life gets loud, our clothing is a reflection of the attitude of those who refuse to blend in.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Premium Quality T-shirts",
                  "Essential Gym Sandos",
                  "Limited Drops",
                  "100% Cruelty Free"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-sans text-sm font-bold uppercase tracking-wider">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border p-8 md:p-12 rounded-3xl">
              <h3 className="font-heading text-2xl text-foreground mb-4 uppercase">Our Commitment</h3>
              <p className="font-sans text-muted-foreground text-base leading-[1.8] mb-6">
                As a premium clothing brand in India, we obsess over clean design, high-quality fabric, and extreme longevity. We believe in authenticity over crowd-following and discipline over excuses.
              </p>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="font-sans text-xs uppercase tracking-widest text-primary font-bold">
                  Searching for NeverFade? You’ve found NevrFade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}