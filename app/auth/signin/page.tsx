"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        await authClient.signIn.email({
            email,
            password,
        }, {
            onSuccess: () => {
                toast.success("Signed in successfully");
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setLoading(false);
            }
        });
    };

    const handleSignUp = async () => {
        setLoading(true);
        await authClient.signUp.email({
            email,
            password,
            name: email.split("@")[0],
        }, {
            onSuccess: () => {
                toast.success("Account created successfully");
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setLoading(false);
            }
        });
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                        {loading ? "Loading..." : "Sign in"}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                        {loading ? "Loading..." : "Sign up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
