import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

export function QRCode({
  value,
  size = 128,
  level = "M",
  bgColor = "#ffffff",
  fgColor = "#000000",
  includeMargin = true,
  className,
}: QRCodeProps) {
  return (
    <div className={cn("inline-flex p-3 bg-white rounded-lg", className)}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        bgColor={bgColor}
        fgColor={fgColor}
        includeMargin={includeMargin}
      />
    </div>
  );
}

// PIX QR Code specific component
interface PIXQRCodeProps {
  pixCode: string;
  size?: number;
  className?: string;
}

export function PIXQRCode({ pixCode, size = 150, className }: PIXQRCodeProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <QRCode value={pixCode} size={size} level="H" />
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Escaneie o QR Code com o app do seu banco
      </p>
    </div>
  );
}

// Generic payment QR Code
interface PaymentQRCodeProps {
  paymentUrl: string;
  amount?: number;
  description?: string;
  size?: number;
  className?: string;
}

export function PaymentQRCode({ 
  paymentUrl, 
  amount, 
  description,
  size = 150, 
  className 
}: PaymentQRCodeProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30", className)}>
      <QRCode value={paymentUrl} size={size} level="H" />
      {amount && (
        <p className="text-lg font-bold text-foreground">
          R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      )}
      {description && (
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      )}
    </div>
  );
}
