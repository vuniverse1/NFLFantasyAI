'use client'
import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

const Chat = () => {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api' // Ensure this matches your API route
    });
    const chatContainer = useRef<HTMLDivElement>(null);

    const scroll = () => {
        const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current as HTMLDivElement;
        if (scrollHeight >= scrollTop + offsetHeight) {
            chatContainer.current?.scrollTo(0, scrollHeight + 200);
        }
    }

    useEffect(() => {
        scroll();
    }, [messages]);

    const renderResponse = () => {
        return (
            <div className="response">
                {messages.map((m, index) => (
                    <div
                        key={m.id}
                        className={`chat-line ${m.role === 'user' ? 'user-chat' : 'ai-chat'} text-neon-green`}
                    >
                        <div className="w-full ml-4">
                            <p className="message">{m.content}</p>
                            {index < messages.length - 1 && <div className="horizontal-line" />}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('/path/to/your/background-image.jpeg')" }}>
            <div ref={chatContainer} className="w-full max-w-3xl h-1/2 p-4 bg-gray-800 bg-opacity-90 rounded-lg overflow-y-auto">
                {renderResponse()}
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-3xl p-4 mt-4 bg-gray-700 bg-opacity-90 rounded-lg">
                <input
                    name="input-field"
                    type="text"
                    placeholder="Ask Vu"
                    onChange={handleInputChange}
                    value={input}
                    className="w-full p-3 mb-2 border border-gray-500 rounded-md bg-gray-900 text-white"
                />
                <button type="submit" className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-700">
                    Send message
                </button>
            </form>
            <h2 className='text-neon-green'>Built by OpenAI and Fantasy Football Expert: VU</h2>
        </div>
    );
}

export default Chat;
