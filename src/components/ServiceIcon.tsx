import { getBrandIcon } from "@/lib/brand-icons";
import { getServiceIcon } from "@/lib/constants";

type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, { box: string; text: string }> = {
  sm: { box: "h-4 w-4", text: "text-base" },
  md: { box: "h-5 w-5", text: "text-xl" },
  lg: { box: "h-6 w-6", text: "text-2xl" },
};

interface Props {
  serviceName: string;
  size?: Size;
  className?: string;
}

// 서비스 아이콘이 쓰이는 모든 곳(등록 드롭다운/대시보드/Top3/알림/결제 캘린더)에서 공통으로 쓰는
// 아이콘 렌더러. simple-icons에 등록된 브랜드는 공식 브랜드 컬러의 SVG로, 없으면 기존 이모지로 그린다.
export default function ServiceIcon({ serviceName, size = "md", className = "" }: Props) {
  const brand = getBrandIcon(serviceName);
  const sizeClasses = SIZE_CLASSES[size];

  if (brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={brand.title}
        className={`shrink-0 ${sizeClasses.box} ${className}`}
        fill={`#${brand.hex}`}
      >
        <path d={brand.path} />
      </svg>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center leading-none ${sizeClasses.text} ${className}`}
    >
      {getServiceIcon(serviceName)}
    </span>
  );
}
