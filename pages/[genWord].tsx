// located at /pages/[...genWord].tsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Redirect() {
    const router = useRouter();
    const { genWord } = router.query;
    const [linkData, setLinkData] = useState({
        original_url: '',
        website_title: '',
        website_locale: '',
        website_image: '',
        website_description: '',
        site_name: ''
    });

    useEffect(() => {
        async function redirect() {
            if (typeof genWord === 'string') {
                const { data, error } = await supabase
                    .from('shortened_links')
                    .select('*')
                    .eq('genword', genWord)
                    .limit(1);

                if (error) {
                    console.error('Error fetching original URL:', error);
                } else if (data && data.length > 0) {
                    const link = data[0];
                    setLinkData({
                        original_url: link.original_url,
                        website_title: link.website_title,
                        website_locale: link.website_locale,
                        website_image: link.website_image,
                        website_description: link.website_description,
                        site_name: link.site_name
                    });
                    window.location.href = link.original_url;
                }
            }
        }

        redirect();
    }, [genWord]);

    return (
        <div>
            <Head>
                <meta property="og:url" content={linkData.original_url} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={linkData.website_title} />
                <meta property="og:locale" content={linkData.website_locale} />
                <meta property="og:image" content={linkData.website_image} />
                <meta property="og:description" content={linkData.website_description} />
                <meta property="og:site_name" content={linkData.site_name} />
            </Head>
            Redirecting...
        </div>
    );
}
