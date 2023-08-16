// located at /pages/index.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type ShortenedLink = {
    original_url: string;
    genword: string;
    website_title?: string;
    website_locale?: string;
    website_image?: string;
    website_description?: string;
    site_name?: string;
};

export default function Summar() {
    const [url, setUrl] = useState('');
    const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState(1);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            interval = setInterval(() => {
                setLoadingDots(prevDots => (prevDots % 5) + 1); // 1에서 5까지 순환
            }, 1000);
        } else {
            setLoadingDots(1); // 로딩이 끝나면 초기화
        }
        return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
    }, [loading]);

    useEffect(() => {
        async function fetchLinks() {
            const { data, error } = await supabase.from('shortened_links').select('*');
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setShortenedLinks(data as ShortenedLink[]);
            }
        }
        fetchLinks();
    }, []);

    const generateShortLink = async () => {
        setLoading(true);
        let genWord: string;
        do {
            genWord = Math.random().toString(36).substr(2, 6);
        } while (shortenedLinks.some(link => link.genword === genWord));
    
        // 사용자 브라우저의 로케일을 가져옵니다.
        const userLocale = navigator.language || 'en_US';

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, userLocale }),
            });

            const { website_title, website_locale, website_image, website_description, site_name, } = await response.json();
            console.log("[response.json()]", website_title, website_locale, website_image, website_description, site_name);
            const { error } = await supabase.from('shortened_links').insert([
                {
                    original_url: url,
                    genword: genWord,
                    website_title,
                    website_locale,
                    website_image,
                    website_description,
                    site_name,
                },
            ]);

            if (error) {
                console.error('Error inserting data:', error);
            } else {
                setShortenedLinks([...shortenedLinks, {
                    original_url: url,
                    genword: genWord,
                    website_title,
                    website_locale,
                    website_image,
                    website_description,
                    site_name,
                }]);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">URL Shortener</h1>
            <div className="flex flex-col space-y-4">
                <input
                    type="text"
                    placeholder="Enter URL"
                    className="p-2 border rounded"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                <button
                    className="p-2 bg-blue-500 text-white rounded"
                    onClick={generateShortLink}
                    disabled={loading}
                >
                    {loading ? `Generating${'.'.repeat(loadingDots)}` : 'Generate Short Link'}
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shortenedLinks.map(link => (
                        <div key={link.genword} className="p-4 bg-white rounded shadow-md">
                            <a href={`/${link.genword}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {`/${link.genword}`}
                            </a>
                            <p className="text-sm text-gray-600">{link.original_url}</p>
                            <h2 className="text-lg font-bold mt-2">{link.website_title}</h2>
                            <p className="text-sm text-gray-600">{link.website_locale}</p>
                            {link.website_image && (
                                <div className="mt-2">
                                    <img src={link.website_image} alt={link.website_title} className="w-full h-40 object-cover rounded" />
                                </div>
                            )}
                            <p className="mt-2 text-gray-700">{link.website_description}</p>
                            <p className="text-sm text-gray-600">{link.site_name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
