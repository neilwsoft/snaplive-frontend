"use client";

import { useActiveRooms } from "@/lib/hooks/useLivestream";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ExplorePage() {
    const { data: roomsData, isLoading, error } = useActiveRooms();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#1c398e] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Failed to load active rooms
            </div>
        );
    }

    const rooms = roomsData?.rooms || [];

    return (
        <div className="flex flex-col gap-8 h-full px-6 py-8 backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[#27272a]">
                    Explore <span className="text-[#b3bad1] font-normal">探索直播间</span>
                </h1>
                <p className="text-[#64748b] mt-1">Discover what's streaming right now.</p>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
                {rooms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rooms.map((room) => (
                            <Link href={`/live/${room.name}`} key={room.sid}>
                                <div className="border border-gra-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                                    {/* Placeholder Thumbnail as Room object doesn't have thumbnail yet */}
                                    <div className="relative h-48 bg-gray-900">
                                        <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold text-2xl">
                                            LIVE
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{room.num_participants} watching</span>
                                            <span>{new Date(room.creation_time * 1000).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        No live rooms active right now.
                    </div>
                )}
            </div>
        </div>
    );
}
