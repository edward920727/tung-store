import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = '時尚女裝精品店 - 發現最新時尚潮流',
  description = '探索我們精心挑選的時尚女裝，展現獨特個人風格。優質面料，精緻工藝，讓您在任何場合都散發自信魅力。',
  keywords = '女裝,時尚,服裝,購物,精品店',
  image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  url = window.location.href,
  type = 'website',
}) => {
  useEffect(() => {
    // 更新 document title
    document.title = title;

    // 更新或創建 meta 標籤
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 基本 meta 標籤
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph 標籤
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');

    // Twitter Card 標籤
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
  }, [title, description, keywords, image, url, type]);

  return null;
};
