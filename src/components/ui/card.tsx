// src/components/ui/card.tsx

import { cn } from "@/lib/utils";
import * as React from "react";

// ✅ 카드 전체 박스 컴포넌트 (테두리 + 그림자 + 라운드처리)
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-white text-black shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

// ✅ 카드 내부 컨텐츠 영역 (padding 적용됨)
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent };
