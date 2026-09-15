import { requireUser } from "@/lib/auth/dal"
import { getPlatformStats, getAllEventsForAdmin, getAllUsersForAdmin } from "@/lib/queries/admin"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await requireUser()
  const [stats, allEvents, allUsers] = await Promise.all([
    getPlatformStats(),
    getAllEventsForAdmin(),
    getAllUsersForAdmin(),
  ])

  return <AdminDashboard stats={stats} events={allEvents} users={allUsers} currentUserId={user.id} />
}
