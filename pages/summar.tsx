import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type ShortenedLink = {
    original_url: string;
    genword: string;
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
        const { error } = await supabase.from('shortened_links').insert([
            { original_url: url, genword: genWord }
        ]);
        if (error) {
            console.error('Error inserting data:', error);
        } else {
            setShortenedLinks([...shortenedLinks, { original_url: url, genword: genWord }]);
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
                <div>
                    {shortenedLinks.map(link => (
                        <div key={link.genword} className="mb-2">
                            <a href={`/${link.genword}`} target="_blank" rel="noopener noreferrer">
                                {`/${link.genword}`}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
