import OpenAI from 'openai';  // Import the OpenAI package to interact with the OpenAI API
import { OpenAIStream, StreamingTextResponse } from 'ai';  // Helpers for handling streaming responses
import { Client } from 'pg';  // Import PostgreSQL client to connect to your database
import dotenv from 'dotenv';  // Import dotenv to load environment variables

// Load environment variables from the .env file (such as database credentials)
dotenv.config();

// Create an OpenAI API client using the API key and organization ID from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',  // If the environment variable is missing, use an empty string
}
);

// Configure the PostgreSQL client with credentials from the .env file
const client = new Client({
    user: process.env.PGUSER,          // Database user (loaded from the environment)
    host: process.env.PGHOST,          // Database host (loaded from the environment)
    database: process.env.PGDATABASE,  // Database name (loaded from the environment)
    password: process.env.PGPASSWORD,  // Database password (loaded from the environment)
    port: Number(process.env.PGPORT) || 5432,  // Database port (default to 5432 if not provided)
});

// Connect to the PostgreSQL database using the above credentials
client.connect();

// Global variable to keep track of whether player names have been preloaded
let playersPreloaded = false;  // `false` initially because no players have been preloaded yet
let playerNames: string[] = [];  // Array to store all player names, initially empty

// Function to preload player names from the database
// It's marked as `async` because it performs an asynchronous operation (a database query)
async function preloadPlayerNames() {
    try {
        const query = 'SELECT player FROM football_stats';  // SQL query to fetch all player names
        const result = await client.query(query);  // Await the result of the query
        playerNames = result.rows.map(row => row.player.toLowerCase());  // Store player names in lowercase
        console.log('Preloaded player names:', playerNames);  // Log the preloaded player names for debugging
        playersPreloaded = true;  // Mark that players have been preloaded
    } catch (error) {
        console.error('Error preloading player names:', error);  // Log any errors that occur
    }
}

// Function to ensure that player names are preloaded before processing any requests
async function ensurePlayersPreloaded() {
    if (!playersPreloaded) {  // If players haven't been preloaded yet...
        await preloadPlayerNames();  // ...wait for the player names to be loaded
    }
}

// Function to extract a player name from the user's message
// It uses the preloaded player names for comparison
function extractPlayerName(userMessage: string): string | null {
    const lowerCaseMessage = userMessage.toLowerCase();  // Convert the message to lowercase for case-insensitive matching
    console.log('User message in lowercase:', lowerCaseMessage);  // Log the user's message for debugging

    // Loop through each player name and check if it's mentioned in the user's message
    for (const player of playerNames) {
        const regex = new RegExp(`\\b${player}\\b`, 'i');  // Create a regex for exact word match, case-insensitive
        if (regex.test(lowerCaseMessage)) {  // If the regex matches the message...
            console.log(`Matched player: ${player}`);  // Log the matched player for debugging
            return player;  // Return the matched player name
        }
    }
    console.log('No matching player found in message.');  // Log if no player name was found
    return null;  // Return null if no player name was matched
}

// This function handles POST requests from the user (usually when they send a message)
// It's marked `async` because it performs asynchronous operations like database queries and API calls
export async function POST(req: Request, res: Response) {
    // Ensure that player names are preloaded before processing the request
    await ensurePlayersPreloaded();

    // Extract the 'messages' from the request body (POST data)
    const { messages } = await req.json();  // Extract the JSON data from the request
    console.log('messages:', messages);  // Log the messages for debugging

    // Get the most recent user message
    const userMessage = messages.reverse().find((msg: any) => msg.role === 'user')?.content;
    
    console.log('User message in lowercase:', userMessage?.toLowerCase());

    // Extract the player name from the user's message
    const playerName = extractPlayerName(userMessage);
    console.log('Extracted player name:', playerName);

    let playerStats = '';  // Initialize an empty string to hold the player's stats

    if (playerName) {
        // If a player name was found, query the database for that player's stats
        try {
            console.log('Attempting to query database for player:', playerName);

            // SQL query to get the games played and PPR points for the player
            const query = 'SELECT games_played, ppr_total_points FROM football_stats WHERE LOWER(player) = LOWER($1)';
            const values = [playerName];  // Use the extracted player name in the query

            // Execute the query and wait for the result
            const result = await client.query(query, values);
            console.log('Query result:', result.rows);  // Log the result for debugging

            // If a matching player was found, format their stats
            if (result.rows.length > 0) {
                const { games_played, ppr_total_points } = result.rows[0];
                playerStats = `${playerName} played ${games_played} games and scored ${ppr_total_points} points.`;
            } else {
                playerStats = `Sorry, I could not find data for ${playerName}.`;  // Handle case where player data is missing
            }
        } catch (error) {
            console.error('PostgreSQL query error:', error);  // Log any errors that occur during the query
            playerStats = 'There was an error retrieving data from the database.';  // Return an error message
        }
    } else {
        // If no player name was found, return a message indicating this
        playerStats = 'I could not find the player mentioned in your query.';
    }

    // Ask OpenAI for a streaming chat completion with the modified prompt (including the player stats)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Use GPT-3.5-turbo model
        messages: [
            {
                role: "system",
                content: "You are an NFL Fantasy Football Expert. Use the following data from PostgreSQL to respond to user queries: " + playerStats,
            },
            {
                role: "user",
                content: userMessage  // Include the user's message
            }
        ],
        stream: true,  // Enable streaming for real-time responses
        temperature: 1,  // Temperature controls randomness; 1 means responses will be more varied
    });

    // Convert the OpenAI response into a streaming text response
    const stream = OpenAIStream(response);

    // Respond to the client with the streaming response
    return new StreamingTextResponse(stream);
}
