"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async () => {
		if (!email || !password || !name) {
			toast.error("Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			await authClient.signUp.email(
				{
					email,
					password,
					name,
				},
				{
					onRequest: () => {
						setLoading(true);
					},
					onSuccess: () => {
						toast.success("Account created successfully");
						router.push("/dashboard");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
						setLoading(false);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Create Account"
			subtitle="Start building your product backlog today"
		>
			<div className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							name="name"
							type="text"
							autoComplete="name"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all h-11"
							placeholder="John Doe"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email-address">Email address</Label>
						<Input
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all h-11"
							placeholder="john@example.com"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all h-11"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<Button
					onClick={handleSignUp}
					disabled={loading}
					className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
				>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating account...
						</>
					) : (
						<>
							Sign up
							<ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>

				<div className="text-center text-sm">
					<span className="text-muted-foreground">
						Already have an account?{" "}
					</span>
					<Link
						href="/auth/signin"
						className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
					>
						Sign in instead
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}
