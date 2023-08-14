// located at /pages/[...genWord].tsx

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Redirect() {
    const router = useRouter();
    const { genWord } = router.query;

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
                    window.location.href = data.original_url;
                }
            }
        }

        redirect();
    }, [genWord]);

    return <div>Redirecting...</div>;
}
