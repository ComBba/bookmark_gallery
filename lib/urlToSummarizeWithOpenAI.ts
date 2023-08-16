// located at /lib/urlToSummarizeWithOpenAI.ts

import axios from 'axios';
import cheerio from 'cheerio';
import LanguageTags from 'language-tags';
import { Configuration, OpenAIApi } from 'openai';
import { sleep } from '../tools/utils';

// Set up OpenAI API configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI API instance
const openai = new OpenAIApi(configuration);

type CreateUrlToSummarizeCompletionResult = {
    website_title: string;
    website_locale: string;
    website_image: string;
    website_description: string;
    site_name: string;
};

async function fetchOpenGraphImage(title: string, description: string): Promise<string> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/og`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
    });
    return response.url; // 이미지 URL 반환
}


// Function to fetch website content
async function getWebsiteContent(url: string) {
    let response = null;

    try {
        response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        // Remove unnecessary elements from the HTML
        $('script, style, noscript, iframe, img, svg, video').remove();

        // Extract meta description and text from the HTML
        const titleText = $('head title')?.text() || '';
        const metaDescription = $('meta[name="description"]')?.attr('content') || '';
        const metaKeywords = $('meta[name="keywords"]')?.attr('content') || '';
        const ogTitle = $('meta[name="og:title"]')?.attr('content') || '';
        const ogDescription = $('meta[name="og:description"]')?.attr('content') || '';
        const twitterTitle = $('meta[name="twitter:title"]')?.attr('content') || '';
        const twitterDescription = $('meta[name="twitter:description"]')?.attr('content') || '';
        console.log('\nURL: ', url);
        console.log('title:', titleText);

        let contents;

        if (url.includes("apps.apple.com")) {
            const specificContents = $("body > div.ember-view > main > div.animation-wrapper.is-visible > section:nth-child(4) > div")?.text().replace(/\s\s+/g, ' ').trim();
            contents = "".concat(titleText, "/n", metaKeywords, "/n", metaDescription, "/n", ogTitle, "/n", ogDescription, "/n", twitterTitle, "/n", twitterDescription, "/n", specificContents);
        } else {
            contents = "".concat(titleText, "/n", metaDescription, "/n", $('body').text().replace(/\s\s+/g, ' ').trim());
        }

        //console.log('content:', contents);
        const imageData = "";
        return { contents, imageData };
    } catch (error: any) {
        response = error.response;
        console.error(`Error fetching content from ${url}:`, response);
    } finally {
        if (!response || response == undefined) {
            return { contents: "", imageData: "" };
        }
        switch (response.status) {
            case 400: // Bad Request
            case 403: // Forbidden
            case 404: // Not Found
            case 500: // Internal Server Error
            case 502: // Bad Gateway
            case 503: // Service Unavailable
            case 504: // Gateway Timeout
                return { contents: "", imageData: "" };
        }
    }
}

let cntRetry = 0;
// Function to create text completion using OpenAI API
async function createUrlToSummarizeCompletion(text: string, userLocale: string): Promise<CreateUrlToSummarizeCompletionResult> {
    try {
        let language = userLocale && userLocale != undefined && userLocale.length > 3 ? LanguageTags.language(userLocale.split('-')[0]) : null;
        let displayName = 'English'; // Default language name

        if (language && language.descriptions().length > 0) {
            displayName = language.descriptions()[0]; // "Korean" or other language name
        }
        console.log('[language]', language, '\t[displayName]', displayName);
        const maxLength = 1000;
        const shortenedText = text.slice(0, maxLength);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // 수정된 엔진 이름
            messages: [
                {
                    role: "system",
                    content: `You is a useful helper for summarizing website content in a given language [${displayName}] and organizing it with open graph tags.`,
                },
                {
                    role: "user",
                    content: `In the provided webpage, excluding copyright information, contact information, address, and links to external websites, a brief summary (no more than 100 characters) of the main purpose and features of the webpage content should be written in ${displayName} language using the Open Graph meta tags [title, original og:image, description, site_name]: ${shortenedText}`,
                },
            ],
            functions: [
                {
                    name: "create_open_graph_protocol",
                    description: "Create Open Graph META TAG",
                    parameters: {
                        type: "object",
                        properties: {
                            website_title: { type: "string" },
                            website_image: { type: "string" },
                            website_description: { type: "string" },
                            site_name: { type: "string" },
                        },
                    },
                },
            ],
            temperature: 1.2,
            max_tokens: 1200,
            top_p: 0.8,
            n: 1,
            stop: "None",
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
        });
        if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message && response.data.choices[0].message.function_call && response.data.choices[0].message.function_call.arguments) {
            //console.log("[arguments]", { userLocale }, '\n', response.data.choices[0].message.function_call.arguments);
            // Return summary and usage statistics
            const fcArguments = JSON.parse(response.data.choices[0].message.function_call.arguments.trim());
            console.log('\n[OpenAI API] Summarized content:');
            console.log("[arguments]", { userLocale }, '\n', fcArguments);
            console.log('[OpenAI API] Prompt tokens:', response.data.usage?.prompt_tokens);
            console.log('[OpenAI API] Completion tokens:', response.data.usage?.completion_tokens);
            let total_tokens = response.data.usage?.total_tokens || 0;
            console.log('[OpenAI API] Total tokens used:', total_tokens);
            console.log('[OpenAI API] Estimated cost:', ((total_tokens / 1000) * 0.002).toFixed(8), 'USD'); // 토큰당 비용인 $0.002를 사용하여 비용 추정
            const websiteTitle = fcArguments.website_title;
            const websiteDescription = fcArguments.website_description;
            const websiteImage = await fetchOpenGraphImage(websiteTitle, websiteDescription); // Open Graph 이미지 가져오기

            return {
                website_title: websiteTitle,
                website_locale: userLocale,
                website_image: websiteImage,
                website_description: websiteDescription,
                site_name: fcArguments.site_name,
            };
        } else {
            console.error('No choices returned by OpenAI API');
            return {
                website_title: '',
                website_locale: userLocale,
                website_image: '',
                website_description: '',
                site_name: '',
            };
        }
    } catch (error: any) {
        console.error('Error using OpenAI API:', error.response == undefined ? error : error.response);
        for (let cntTimeout = 15; cntTimeout > 0; cntTimeout--) {
            await sleep(1 * 1000); // 1초 대기
            console.log(cntTimeout, "초...");
        }
        if (cntRetry > 10) {
            cntRetry = 0;
            return {
                website_title: '',
                website_locale: userLocale,
                website_image: '',
                website_description: '',
                site_name: '',
            };
        }
        cntRetry += 1;
        return createUrlToSummarizeCompletion(text, userLocale);
    }
}

export {
    getWebsiteContent,
    createUrlToSummarizeCompletion
};