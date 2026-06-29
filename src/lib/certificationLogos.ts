export type CertificationVendor = {
  slug: string;
  color: string;
  vendorName: string;
  shortLabel: string;
};

export const CERTIFICATION_BADGES = {
  itil: '/certifications/itil-v4-foundation.png',
  azure: '/certifications/azure-solutions-architect-expert.png',
  servicenow: '/certifications/servicenow-csa.png',
} as const;

const GENERIC: CertificationVendor = {
  slug: 'generic',
  color: '0072CE',
  vendorName: 'Certification',
  shortLabel: 'Cert',
};

const VENDOR_RULES: { test: RegExp; vendor: CertificationVendor }[] = [
  {
    test: /azure|microsoft|power bi|power platform|power apps|dynamics|m365|office 365/i,
    vendor: { slug: 'microsoftazure', color: '0078D4', vendorName: 'Microsoft', shortLabel: 'Microsoft' },
  },
  {
    test: /aws|amazon web services/i,
    vendor: { slug: 'amazonaws', color: 'FF9900', vendorName: 'AWS', shortLabel: 'AWS' },
  },
  {
    test: /google|gcp|professional ml|tensorflow/i,
    vendor: { slug: 'googlecloud', color: '4285F4', vendorName: 'Google Cloud', shortLabel: 'Google' },
  },
  {
    test: /servicenow/i,
    vendor: { slug: 'servicenow', color: '81B5A1', vendorName: 'ServiceNow', shortLabel: 'ServiceNow' },
  },
  {
    test: /salesforce/i,
    vendor: { slug: 'salesforce', color: '00A1E0', vendorName: 'Salesforce', shortLabel: 'Salesforce' },
  },
  {
    test: /sap|s\/4hana/i,
    vendor: { slug: 'sap', color: '0FAAFF', vendorName: 'SAP', shortLabel: 'SAP' },
  },
  {
    test: /kubernetes|cka|ckad/i,
    vendor: { slug: 'kubernetes', color: '326CE5', vendorName: 'Kubernetes', shortLabel: 'K8s' },
  },
  {
    test: /terraform|hashicorp/i,
    vendor: { slug: 'hashicorp', color: '000000', vendorName: 'HashiCorp', shortLabel: 'HashiCorp' },
  },
  {
    test: /databricks/i,
    vendor: { slug: 'databricks', color: 'FF3621', vendorName: 'Databricks', shortLabel: 'Databricks' },
  },
  {
    test: /python/i,
    vendor: { slug: 'python', color: '3776AB', vendorName: 'Python', shortLabel: 'Python' },
  },
  {
    test: /cissp|isc2|ceh|cyber|security|siem/i,
    vendor: { slug: 'crowdstrike', color: 'E01E5A', vendorName: 'Security', shortLabel: 'Security' },
  },
  {
    test: /itil/i,
    vendor: { slug: 'axelor', color: '1B3A6B', vendorName: 'ITIL', shortLabel: 'ITIL' },
  },
  {
    test: /oracle/i,
    vendor: { slug: 'oracle', color: 'F80000', vendorName: 'Oracle', shortLabel: 'Oracle' },
  },
  {
    test: /devops/i,
    vendor: { slug: 'azuredevops', color: '0078D7', vendorName: 'DevOps', shortLabel: 'DevOps' },
  },
];

export function certificationBadgeImageUrl(name: string): string | null {
  if (/itil/i.test(name)) return CERTIFICATION_BADGES.itil;
  if (/servicenow/i.test(name)) return CERTIFICATION_BADGES.servicenow;
  if (/azure|microsoft|power bi|power platform|power apps|dynamics|m365|office 365/i.test(name)) {
    return CERTIFICATION_BADGES.azure;
  }
  return null;
}

export function skillBadgeImageUrl(skillName: string): string | null {
  return certificationBadgeImageUrl(skillName);
}

export function resolveCertificationVendor(certName: string): CertificationVendor {
  for (const rule of VENDOR_RULES) {
    if (rule.test.test(certName)) return rule.vendor;
  }
  return GENERIC;
}

export function certificationLogoUrl(vendor: CertificationVendor, certName?: string): string | null {
  if (certName) {
    const badge = certificationBadgeImageUrl(certName);
    if (badge) return badge;
  }
  if (vendor.slug === 'generic') return null;
  return `https://cdn.simpleicons.org/${vendor.slug}/${vendor.color}`;
}

export function getCertificationName(cert: string | { name: string; attachmentName?: string }): string {
  return typeof cert === 'string' ? cert : cert.name;
}

export function getCertificationAttachment(
  cert: string | { name: string; attachmentName?: string },
): string | undefined {
  return typeof cert === 'string' ? undefined : cert.attachmentName;
}
