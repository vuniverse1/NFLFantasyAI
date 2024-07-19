'use client'
import '../app/globals.css';
import Chat from './components/Chat';
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-custom-image bg-center bg-contain bg-fixed text-neon-green p-24">
      <section className="py-12 w-full max-w-4xl text-center">
        <div className="container mx-auto p-6 bg-gray-800 bg-opacity-75 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-8 text-neon-green">FANTASY SCAMMING 101</h1>
          <h3 className="text-1xl mb-8 text-red"> Scam your Fantasy Leaguemates! </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
          </div>
          <Chat />
        </div>
      </section>
    </main>
  );
}