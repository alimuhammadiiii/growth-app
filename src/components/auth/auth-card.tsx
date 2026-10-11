import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold tracking-tight text-muted-foreground">
          Growth
        </p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl leading-tight font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
