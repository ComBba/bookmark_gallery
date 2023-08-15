// located at /lib/urlToSummarizeWithOpenAI.js
const axios = require('axios');
const cheerio = require('cheerio');
const { Configuration, OpenAIApi } = require('openai');
const { sleep } = require('../tools/utils.js');

// Set up OpenAI API configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI API instance
const openai = new OpenAIApi(configuration);

// Function to fetch website content
async function getWebsiteContent(url) {
    let response = null

    try {
        response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        // Remove unnecessary elements from the HTML
        $('script, style, noscript, iframe, img, svg, video').remove();

        // Extract meta description and text from the HTML
        const titleText = $('head title')?.text();
        const metaDescription = $('meta[name="description"]')?.attr('content');
        const metaKeywords = $('meta[name="keywords"]')?.attr('content');
        const ogTitle = $('meta[name="og:title"]')?.attr('content');
        const ogDescription = $('meta[name="og:description"]')?.attr('content');
        const twitterTitle = $('meta[name="twitter:title"]')?.attr('content');
        const twitterDescription = $('meta[name="twitter:description"]')?.attr('content');
        console.log('\nURL: ', url);
        console.log('title:', titleText);

        let contents;

        if (url.includes("apps.apple.com")) {
            const specificContents = $("body > div.ember-view > main > div.animation-wrapper.is-visible > section:nth-child(4) > div")?.text().replace(/\s\s+/g, ' ').trim();
            contents = "".concat(titleText, "/n", metaKeywords, "/n", metaDescription, "/n", ogTitle, "/n", ogDescription, "/n", twitterTitle, "/n", twitterDescription, "/n", specificContents);
        } else {
            contents = "".concat(titleText, "/n", metaDescription, "/n", $('body').text().replace(/\s\s+/g, ' ').trim());
        }

        console.log('content:', contents);
        const imageData = "";
        return { contents, imageData };
    } catch (error) {
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
async function createUrlToSummarizeCompletion(text) {
    try {
        const maxLength = 1000;
        const shortenedText = text.slice(0, maxLength);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // 수정된 엔진 이름
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that summarizes and organizes website content.",
                },
                {
                    role: "user",
                    content: `Please provide a brief and concise summary (less than 500 characters) in English of the following website content, focusing on the main purpose and features of the site. Exclude any copyright information, contact details, and unrelated external website links: ${shortenedText}`,
                },
            ],
            temperature: 1.2,
            max_tokens: 2048,
            top_p: 0.8,
            n: 1,
            stop: "None",
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
        });
        if (response.data.choices && response.data.choices.length > 0) {
            // Return summary and usage statistics
            console.log('\n[OpenAI API] Summarized content:');
            console.log(response.data.choices[0].message.content.trim());
            console.log('[OpenAI API] Prompt tokens:', response.data.usage.prompt_tokens);
            console.log('[OpenAI API] Completion tokens:', response.data.usage.completion_tokens);
            console.log('[OpenAI API] Total tokens used:', response.data.usage.total_tokens);
            console.log('[OpenAI API] Estimated cost:', ((response.data.usage.total_tokens / 1000) * 0.002).toFixed(8), 'USD'); // 토큰당 비용인 $0.002를 사용하여 비용 추정
            return {
                summary: response.data.choices[0].message.content.trim(),
            };
        } else {
            console.error('No choices returned by OpenAI API');
            return {
                summary: '',
            };
        }
    } catch (error) {
        console.error('Error using OpenAI API:', error.response == undefined ? error : error.response);
        for (cntTimeout = 15; cntTimeout > 0; cntTimeout--) {
            await sleep(1 * 1000); // 1초 대기
            console.log(cntTimeout, "초...");
        }
        if (cntRetry > 10) {
            cntRetry = 0;
            return {
                summary: '',
            };
        }
        cntRetry += 1;
        return createUrlToSummarizeCompletion(text);
    }
}

module.exports = {
    getWebsiteContent,
    createUrlToSummarizeCompletion
};