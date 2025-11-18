import { ConnectJiraButton } from "@/components/connect-jira-button"

export default function DashboardPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to ClearSprint AI.</p>
                </div>
                <ConnectJiraButton />
            </div>
        </div>
    )
}
