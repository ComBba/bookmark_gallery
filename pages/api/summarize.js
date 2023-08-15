//located at /pages/api/summarize.js

import { getWebsiteContent, createUrlToSummarizeCompletion } from '../../lib/urlToSummarizeWithOpenAI';

export default async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const websiteContent = await getWebsiteContent(url);
        if (!websiteContent || !websiteContent.contents) {
            return res.status(500).json({ error: 'Error fetching website content' });
        }

        const { website_title, website_locale, website_image, website_description, site_name, } = await createUrlToSummarizeCompletion(websiteContent.contents);

        return res.status(200).json({ website_title, website_locale, website_image, website_description, site_name, });
    } catch (error) {
        console.error('Error summarizing URL:', error);
        return res.status(500).json({ error: 'Error summarizing URL' });
    }
};
