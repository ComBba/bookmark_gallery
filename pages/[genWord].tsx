// located at /pages/[...genWord].tsx

import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

type LinkData = {
    original_url: string;
    website_title: string;
    website_locale: string;
    website_image: string;
    website_description: string;
    site_name: string;
};

export default function Redirect({ linkData }: { linkData: LinkData }) {
    const router = useRouter();

    if (linkData.original_url) {
        router.push(linkData.original_url);
    }

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

export async function getServerSideProps(context: any) {
    const { genWord } = context.params;
    const { data, error } = await supabase
        .from('shortened_links')
        .select('*')
        .eq('genword', genWord)
        .single();

    if (error) {
        console.error('Error fetching original URL:', error);
        return { notFound: true };
    }

    const linkData = data || {
        original_url: '',
        website_title: '',
        website_locale: '',
        website_image: '',
        website_description: '',
        site_name: ''
    };

    return {
        props: { linkData },
    };
}
