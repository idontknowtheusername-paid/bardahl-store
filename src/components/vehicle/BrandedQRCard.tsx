import { useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface BrandedQRCardProps {
  qrToken: string;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  licensePlate: string;
  year?: number | null;
}

export default function BrandedQRCard({ qrToken, vehicleBrand, vehicleModel, licensePlate, year }: BrandedQRCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const qrUrl = `${window.location.origin}/qr/${qrToken}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=1F2937&data=${encodeURIComponent(qrUrl)}`;

  const vehicleName = [vehicleBrand, vehicleModel].filter(Boolean).join(' ') || 'Mon véhicule';

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `autopassion-qr-${licensePlate.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code téléchargé !');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  }, [licensePlate]);

  return (
    <div className="space-y-4">
      {/* The card to capture */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="relative overflow-hidden"
          style={{
            width: 340,
            borderRadius: 20,
            background: 'linear-gradient(145deg, #2F6FB5 0%, #1a4a7a 50%, #1F2937 100%)',
            padding: 3,
          }}
        >
          {/* Inner card */}
          <div
            style={{
              borderRadius: 18,
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              padding: '24px 20px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative top accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: 'linear-gradient(90deg, #2F6FB5 0%, #F59E0B 50%, #2F6FB5 100%)',
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <img
                  src="/logo-autopassion.png"
                  alt="AutoPassion BJ"
                  style={{ height: 60, width: 'auto', objectFit: 'contain' }}
                  crossOrigin="anonymous"
                />
              </div>
              <p style={{ fontSize: 9, color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: 0 }}>
                Carnet d'entretien digital
              </p>
            </div>

            {/* QR Code */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: 14,
                border: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <img
                src={qrImgUrl}
                alt="QR Code"
                crossOrigin="anonymous"
                style={{ width: 180, height: 180 }}
              />
            </div>

            {/* Vehicle info */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2F6FB5 0%, #1a4a7a 100%)',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 12,
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{vehicleName}</p>
                  {year && <p style={{ fontSize: 10, opacity: 0.8, margin: 0 }}>{year}</p>}
                </div>
                <div
                  style={{
                    background: '#F59E0B',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#1F2937',
                    letterSpacing: '1px',
                  }}
                >
                  {licensePlate}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#374151', fontWeight: 600, margin: '0 0 2px' }}>
                📱 Scannez pour l'historique d'entretien
              </p>
              <p style={{ fontSize: 9, color: '#9ca3af', margin: 0 }}>
                autopassionbj.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger le sticker QR
        </Button>
      </div>
    </div>
  );
}
