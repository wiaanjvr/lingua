"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl font-bold">
              Authentication Error
            </CardTitle>
          </div>
          <CardDescription>
            There was a problem verifying your authentication code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">This could happen if:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>The link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid</li>
          </ul>
          <div className="pt-4 flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signup">Create New Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
