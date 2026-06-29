import React, { useState } from 'react';
import { Award, Paperclip } from 'lucide-react';
import {
  certificationBadgeImageUrl,
  certificationLogoUrl,
  getCertificationAttachment,
  getCertificationName,
  resolveCertificationVendor,
} from '../../lib/certificationLogos';
import { cn } from '../../lib/utils';

type CertificationInput = string | { name: string; attachmentName?: string };

type ThumbnailSize = 'sm' | 'md' | 'lg';

function thumbnailBoxClass(size: ThumbnailSize, isBadge: boolean) {
  if (isBadge) {
    return size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-12 w-12' : 'h-10 w-10';
  }
  return size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-9 w-9' : 'h-7 w-7';
}

function thumbnailImgClass(size: ThumbnailSize, isBadge: boolean) {
  if (isBadge) return 'h-full w-full object-cover';
  return size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-6 w-6' : 'h-5 w-5';
}

export function CertificationThumbnail({
  name,
  size = 'md',
  className,
  title,
  showFallback = true,
}: {
  name: string;
  size?: ThumbnailSize;
  className?: string;
  title?: string;
  showFallback?: boolean;
  key?: React.Key;
}) {
  const vendor = resolveCertificationVendor(name);
  const badgeUrl = certificationBadgeImageUrl(name);
  const logoUrl = badgeUrl ? null : certificationLogoUrl(vendor, name);
  const imageUrl = badgeUrl ?? logoUrl;
  const isBadge = !!badgeUrl;
  const [failed, setFailed] = useState(false);

  const boxClass = thumbnailBoxClass(size, isBadge);
  const iconClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  if (!imageUrl || failed) {
    if (!showFallback) return null;
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm',
          boxClass,
          className,
        )}
        style={{ backgroundColor: `#${vendor.color}12` }}
        title={title ?? name}
      >
        {vendor.slug === 'generic' ? (
          <Award className={cn(iconClass, 'text-[#0072CE]')} />
        ) : (
          <span
            className="text-[10px] font-black uppercase leading-none"
            style={{ color: `#${vendor.color}` }}
          >
            {vendor.shortLabel.slice(0, 3)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
        isBadge ? '' : 'flex items-center justify-center p-1',
        boxClass,
        className,
      )}
      title={title ?? name}
    >
      <img
        src={imageUrl}
        alt={name}
        className={cn(thumbnailImgClass(size, isBadge), isBadge ? '' : 'object-contain')}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

type CertificationBadgeProps = {
  certification: CertificationInput;
  size?: ThumbnailSize;
  showName?: boolean;
  showAttachment?: boolean;
  onDownloadAttachment?: (certName: string, attachmentName: string) => void;
  className?: string;
  key?: React.Key;
};

export default function CertificationBadge({
  certification,
  size = 'md',
  showName = true,
  showAttachment = true,
  onDownloadAttachment,
  className,
}: CertificationBadgeProps) {
  const certName = getCertificationName(certification);
  const attachmentName = getCertificationAttachment(certification);
  const vendor = resolveCertificationVendor(certName);

  const handleDownload = () => {
    if (!attachmentName) return;
    if (onDownloadAttachment) {
      onDownloadAttachment(certName, attachmentName);
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([`Mock certification document: ${certName}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = attachmentName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-[#0072CE]/20 hover:bg-white',
        size === 'lg' && 'p-4',
        className,
      )}
      title={certName}
    >
      <CertificationThumbnail name={certName} size={size} />
      {showName && (
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-[#0F1B3D]">{certName}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {vendor.vendorName}
          </div>
          {showAttachment && attachmentName && (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#0072CE] hover:underline cursor-pointer"
              title={`Download ${attachmentName}`}
            >
              <Paperclip className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">{attachmentName}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CertificationLogoStrip({
  certifications,
  max = 5,
  size = 'sm',
  className,
}: {
  certifications: CertificationInput[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const items = certifications.slice(0, max);

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {items.map((cert) => {
        const certName = getCertificationName(cert);
        return <CertificationThumbnail key={certName} name={certName} size={size} title={certName} />;
      })}
      {certifications.length > max && (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
          +{certifications.length - max}
        </span>
      )}
    </div>
  );
}

export function CertificationsGrid({
  certifications,
  emptyMessage = 'No certifications listed.',
  size = 'md',
}: {
  certifications: CertificationInput[];
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (certifications.length === 0) {
    return <p className="py-6 text-center text-sm font-semibold text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {certifications.map((cert) => {
        const certName = getCertificationName(cert);
        return <CertificationBadge key={certName} certification={cert} size={size} />;
      })}
    </div>
  );
}
