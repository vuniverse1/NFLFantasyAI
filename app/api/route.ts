import OpenAI from 'openai';
import {OpenAIStream, StreamingTextResponse } from 'ai';

//Create an OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG_ID || '',
});
//IMPORTANT Set the runtime to edge for better efficiency
export const runtime = 'edge';

export async function POST(req: Request, res: Response){
    //extract the 'prompt' from the body of the request
    const { messages } = await req.json();
    console.log('messages:', messages);

    //Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a NFL Fantasy Football Expert, a funny and smart individual who has the ultimate ability to give "
                + "fantasy players advice on who to draft or trade for the 2024 NFL season based on the data provided. Your replies "
                + "should compare the players the user listed and go straight to the point, keep the replies short and concise. The league "
                + "is a point per reception league, so take that into account"

            },
            ...messages,
            
        ],
        stream: true,
        temperature: 1,
    });

    //Convert the response into a friendly text stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
} 