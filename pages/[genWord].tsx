// located at /pages/[...genWord].tsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Redirect() {
    const router = useRouter();
    const { genWord } = router.query;
    const [originalUrl, setOriginalUrl] = useState('');

    useEffect(() => {
        async function redirect() {
            if (typeof genWord === 'string') {
                const { data, error } = await supabase
                    .from('shortened_links')
                    .select('original_url')
                    .eq('genword', genWord)
                    .single();

                if (error) {
                    console.error('Error fetching original URL:', error);
                } else if (data) {
                    setOriginalUrl(data.original_url); // original_url을 상태로 저장
                    window.location.href = data.original_url;
                }
            }
        }

        redirect();
    }, [genWord]);

    return (
        <div>
            <Head>
                <meta property="og:url" content={originalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Your Title Here" />
                <meta property="og:description" content="Your Description Here" />
                <meta property="og:image" content="https://olokeksbbvbugujymvaq.supabase.co/storage/v1/object/sign/avatars/4012c84b-865b-4b39-b9c4-4a9493453553-0.7932964515589191.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzLzQwMTJjODRiLTg2NWItNGIzOS1iOWM0LTRhOTQ5MzQ1MzU1My0wLjc5MzI5NjQ1MTU1ODkxOTEuanBlZyIsImlhdCI6MTY5MjA4Mzc3MCwiZXhwIjoxNjk0Njc1NzcwfQ.BBsAsKUlssD3P48p6NVLiwTzqDYBk5BGURizND0sS9I&t=2023-08-15T07%3A16%3A10.972Z" />
            </Head>
            Redirecting...
        </div>
    );
}
