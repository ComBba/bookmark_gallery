// located at /pages/api/og.tsx
import { NextApiRequest, NextApiResponse } from 'next';
import { ImageResponse } from '@vercel/og';
import React from 'react';

const ogImage = async (req: NextApiRequest, res: NextApiResponse) => {
    const { title, description } = req.body;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    background: 'lavender',
                    padding: 20,
                }}
            >
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        )
    );
};

export default ogImage;
