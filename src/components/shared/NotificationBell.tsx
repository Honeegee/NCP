"use client";

import {
  NovuProvider,
  PopoverNotificationCenter,
} from "@novu/notification-center";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

export function NovuNotificationBell() {
  const { data: session } = useSession();
  if (!session?.user?.id) return null;

  return (
    <NovuProvider
      subscriberId={session.user.id}
      applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_IDENTIFIER!}
    >
      <PopoverNotificationCenter colorScheme="light">
        {({ unseenCount }) => (
          <button className="relative text-white hover:bg-white/10 rounded-xl h-10 w-10 flex items-center justify-center transition-all hover:scale-105">
            <Bell className="h-5 w-5" />
            {unseenCount && unseenCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            ) : null}
          </button>
        )}
      </PopoverNotificationCenter>
    </NovuProvider>
  );
}
