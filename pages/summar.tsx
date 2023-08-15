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
        const genWord = Math.random().toString(36).substr(2, 6);
        if (shortenedLinks.some(link => link.genword === genWord)) {
            generateShortLink(); // If genWord is duplicated, regenerate
            return;
        }

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
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
                >
                    Generate Short Link
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
                            <div className="mt-2">
                                <img src={link.website_image} alt={link.website_title} className="w-full h-40 object-cover rounded" />
                            </div>
                            <p className="mt-2 text-gray-700">{link.website_description}</p>
                            <p className="text-sm text-gray-600">{link.site_name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
