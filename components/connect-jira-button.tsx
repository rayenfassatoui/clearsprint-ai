"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ConnectJiraButton() {
    const [loading, setLoading] = useState(false)

    const handleConnect = async () => {
        setLoading(true)
        await authClient.signIn.social({
            provider: "atlassian",
            callbackURL: "/dashboard"
        }, {
            onSuccess: () => {
                toast.success("Connected to Jira successfully")
                setLoading(false)
            },
            onError: (ctx) => {
                toast.error(ctx.error.message)
                setLoading(false)
            }
        })
    }

    return (
        <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect Jira"}
        </Button>
    )
}
