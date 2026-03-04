"use client";

import { useState, useRef, useEffect } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/lib/locale-context";

export interface InvitedUser {
  id: string;
  username: string;
  platform: string;
  avatarUrl?: string;
}

interface UserInvitePanelProps {
  onInvite?: (username: string) => void;
  onRemoveUser?: (userId: string) => void;
  invitedUsers?: InvitedUser[];
  onSearchChange?: (query: string) => void;
  searchSuggestions?: InvitedUser[];
}

export function UserInvitePanel({
  onInvite,
  onRemoveUser,
  invitedUsers = [],
  onSearchChange,
  searchSuggestions = [],
}: UserInvitePanelProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInvite = () => {
    if (searchQuery.trim()) {
      onInvite?.(searchQuery);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (user: InvitedUser) => {
    onInvite?.(user.username);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Filter out already invited users from suggestions
  const filteredSuggestions = searchSuggestions.filter(
    (suggestion) => !invitedUsers.some((invited) => invited.id === suggestion.id)
  );

  return (
    <div className="hidden lg:flex shrink-0 h-full w-[240px] xl:w-[300px] bg-[#f1f5f9] px-3 xl:px-4 py-4 xl:py-6 flex-col overflow-hidden border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 w-full mb-4">
        <p className="text-sm xl:text-base font-medium leading-6 text-[#27272a]">
          {t("livestream.userInvites.title")}
        </p>
        <div className="border border-[#b3bad1] rounded px-2 py-0.5 flex items-center gap-1">
          <span className="text-xs xl:text-sm font-medium text-[#27272a]">
            {invitedUsers.length}
          </span>
          <UserPlus className="w-3 h-3 text-[#27272a]" />
        </div>
      </div>

      {/* Invite Input */}
      <div className="flex flex-col gap-1.5 w-full mb-4">
        <label className="text-xs xl:text-sm font-medium text-[#27272a]">
          {t("livestream.userInvites.inviteUsers")}
        </label>
        <div className="flex gap-2 items-center w-full">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder={t("livestream.userInvites.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="w-full h-8 pr-8 border-[#cbd5e1] text-xs xl:text-sm"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 xl:w-4 xl:h-4 text-[#90a1b9]" />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded-md shadow-lg z-20 max-h-[200px] overflow-y-auto"
              >
                {filteredSuggestions.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectSuggestion(user)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"
                  >
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback className="bg-[#1c398e] text-white text-[10px]">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#27272a] truncate">
                        {user.username}
                      </p>
                      <p className="text-[10px] text-[#90a1b9]">{user.platform}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleInvite}
            className="bg-[#1c398e] hover:bg-[#1c398e]/90 text-white px-2 xl:px-3 h-8 rounded-md text-xs xl:text-sm font-medium"
          >
            <UserPlus className="w-3 h-3 xl:w-4 xl:h-4 xl:mr-1" />
            <span className="hidden xl:inline">{t("livestream.userInvites.invite")}</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground hidden xl:block">
          {t("livestream.userInvites.searchHelper")}
        </p>
      </div>

      {/* Invited Users List */}
      <div className="border border-[#d1d5db] rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {invitedUsers.length === 0 ? (
            <div className="flex items-center justify-center py-4 w-full">
              <p className="text-xs xl:text-sm text-[#b3bad1] text-center">
                {t("livestream.userInvites.emptyList")}
              </p>
            </div>
          ) : (
            invitedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 py-1.5 px-1 hover:bg-gray-50 rounded group"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="bg-[#1c398e] text-white text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs xl:text-sm font-medium text-[#27272a] truncate">
                    {user.username}
                  </p>
                  <p className="text-[10px] xl:text-xs text-[#90a1b9]">{user.platform}</p>
                </div>
                <button
                  onClick={() => onRemoveUser?.(user.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0"
                >
                  <X className="w-3 h-3 text-[#27272a]" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Helper Message */}
      <p className="text-xs text-muted-foreground mt-3 leading-4 hidden xl:block">
        {t("livestream.userInvites.bulkHelper")}
      </p>
    </div>
  );
}
