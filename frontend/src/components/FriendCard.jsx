import { Link } from "react-router";
import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { getOrCreateStreamClient } from "../lib/streamClient";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  const { authUser } = useAuthUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel;
    let mounted = true;
    const setup = async () => {
      try {
        const client = await getOrCreateStreamClient(authUser, STREAM_API_KEY);
        if (!client) return;
        const channelId = [authUser._id, friend._id].sort().join("-");
        channel = client.channel("messaging", channelId, { members: [authUser._id, friend._id] });
        await channel.watch();
        if (!mounted) return;
        const state = channel.state;
        const myRead = state.read?.[authUser._id];
        const lastRead = myRead?.last_read || new Date(0);
        const unread = state.messages.filter((m) => m.user?.id === friend._id && new Date(m.created_at) > new Date(lastRead)).length;
        setUnreadCount(unread);

        const onNew = (e) => {
          if (e.message?.user?.id === friend._id) {
            setUnreadCount((c) => c + 1);
          }
        };
        channel.on("message.new", onNew);
        channel.on("message.read", () => {
          // if other user marks read this doesn't affect our unread
        });
        return () => channel.off("message.new", onNew);
      } catch {}
    };
    setup();
    return () => {
      mounted = false;
    };
  }, [authUser, friend._id]);
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full justify-between">
          <span>Message</span>
          {unreadCount > 0 && <span className="badge badge-primary">{unreadCount}</span>}
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
