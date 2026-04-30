import { Outlet, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import SearchModal from "../components/modals/SearchModal";
import NotificationsDrawer from "../components/modals/NotificationsDrawer";
import MembersModal from "../components/modals/MembersModal";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notificationApi";

export default function AppLayout() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const { presence, events } = useWorkspaceSocket(workspaceId);

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const section =
    location.pathname.includes("notes") ? "Notes" :
    location.pathname.includes("tasks") ? "Kanban" :
    location.pathname.includes("search") ? "Search" :
    location.pathname.includes("notifications") ? "Notifications" :
    "Home";

  return (
    <div className="flex min-h-screen mesh-bg">
      <Sidebar presence={presence} onMembers={() => setMembersOpen(true)} />

      <main className="flex-1 p-6">
        <TopHeader
          section={section}
          onSearch={() => setSearchOpen(true)}
          onNotifications={() => setNotificationsOpen(true)}
          unreadCount={unreadCount}
        />

        <Outlet context={{ workspaceId, presence, events }} />
      </main>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} workspaceId={workspaceId} />
      <NotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <MembersModal open={membersOpen} onClose={() => setMembersOpen(false)} workspaceId={workspaceId} />
    </div>
  );
}