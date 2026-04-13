import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

// Mock blog data - in a real app this would come from an API or CMS
const mockBlogPosts = [
  {
    id: 1,
    title: "Welcome to Cyberpunk Fashion Hub",
    excerpt: "Discover the future of fashion with our cutting-edge cyberpunk collection that blends technology and style.",
    content: "Welcome to Cyberpunk Fashion Hub, where fashion meets the future! We're excited to bring you the latest in cyberpunk-inspired fashion that combines futuristic aesthetics with contemporary style. Our collection features innovative designs that push the boundaries of traditional fashion, incorporating elements like neon colors, geometric patterns, and high-tech materials. Whether you're a fan of the cyberpunk aesthetic or looking to make a bold fashion statement, our carefully curated collection has something for everyone. Each piece is designed to make you feel like you're stepping into a futuristic world while staying comfortable and stylish in your everyday life.",
    date: "2026-04-12",
    author: "Admin",
    image: "/hero-bg.png",
    category: "Welcome"
  },
  {
    id: 2,
    title: "The Evolution of Cyberpunk Fashion",
    excerpt: "Explore how cyberpunk fashion has transformed from underground movement to mainstream style.",
    content: "Cyberpunk fashion has undergone a remarkable evolution since its inception in the 1980s. Originally inspired by science fiction novels and films, cyberpunk fashion was characterized by dark colors, futuristic silhouettes, and a rebellious spirit. Today, it has evolved into a sophisticated aesthetic that influences mainstream fashion. Modern cyberpunk fashion incorporates advanced materials, LED elements, and sustainable practices while maintaining its signature edgy look. The movement has moved from underground clubs to high-end fashion runways, proving that the appeal of futuristic fashion is timeless. Our collection draws inspiration from this rich history while adding our own contemporary twist.",
    date: "2026-04-10",
    author: "Admin",
    image: "/product-1.png",
    category: "Fashion History"
  },
  {
    id: 3,
    title: "Sustainable Fashion in the Digital Age",
    excerpt: "How we're making fashion more eco-friendly without compromising on style.",
    content: "At Cyberpunk Fashion Hub, we believe that fashion should be both stylish and sustainable. Our commitment to environmental responsibility means we're constantly exploring new ways to create beautiful clothing while minimizing our ecological footprint. We use eco-friendly materials, implement ethical manufacturing processes, and focus on creating pieces that last longer. In the digital age, we're also leveraging technology to reduce waste through smart inventory management and on-demand production. Our goal is to prove that you don't have to sacrifice style for sustainability. Every piece in our collection is designed with both aesthetics and environmental consciousness in mind.",
    date: "2026-04-08",
    author: "Admin",
    image: "/product-2.png",
    category: "Sustainability"
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
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mb-4">Cyberpunk Fashion Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the latest trends, stories, and insights about cyberpunk fashion and our journey
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

      </div>
    </div>
  );
}