export type SkillGroup = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
};

/** Technology and functional skill groups for filtering IT experts. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'servicenow-platform',
    name: 'ServiceNow Platform',
    description: 'ServiceNow architects, developers, and ITSM/ITOM/CSM modules',
    keywords: [
      'servicenow',
      'itsm',
      'itom',
      'csm',
      'hrsd',
      'spm',
      'it service management',
      'integration hub',
    ],
  },
  {
    id: 'cloud-infrastructure',
    name: 'Cloud & Infrastructure',
    description: 'Cloud engineering, DevOps, and infrastructure automation',
    keywords: [
      'azure',
      'aws',
      'google cloud',
      'cloud engineer',
      'cloud infrastructure',
      'devops',
      'kubernetes',
      'terraform',
      'ci/cd',
      'infrastructure',
      'multi-cloud',
      'iac',
    ],
  },
  {
    id: 'erp-enterprise',
    name: 'ERP & Enterprise Apps',
    description: 'SAP, Oracle, and enterprise application implementations',
    keywords: [
      'sap',
      'oracle',
      'erp',
      's/4hana',
      'fiori',
      'enterprise architecture',
      'finance module',
    ],
  },
  {
    id: 'crm-engagement',
    name: 'CRM & Engagement',
    description: 'Salesforce, Dynamics, and donor/constituent engagement',
    keywords: [
      'salesforce',
      'dynamics',
      'crm',
      'mulesoft',
      'nonprofit cloud',
      'tableau crm',
      'donor',
    ],
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    description: 'Cybersecurity, compliance, and security architecture',
    keywords: [
      'cybersecurity',
      'security',
      'cissp',
      'ceh',
      'penetration',
      'siem',
      'compliance',
      'incident response',
      'security audit',
      'security architecture',
    ],
  },
  {
    id: 'ai-data',
    name: 'AI & Data',
    description: 'AI/ML, data engineering, analytics, and data science',
    keywords: [
      'ai/ml',
      'ai specialist',
      'machine learning',
      'data engineering',
      'data science',
      'data analytics',
      'python',
      'databricks',
      'power bi',
      'azure ml',
      'predictive analytics',
      'nlp',
      'data platform',
      'etl',
    ],
  },
  {
    id: 'digital-transformation',
    name: 'Digital Transformation & PM',
    description: 'Digital transformation, programme delivery, and IT service design',
    keywords: [
      'digital transformation',
      'digital infrastructure',
      'platform modernization',
      'change management',
      'process design',
      'global rollout',
    ],
  },
  {
    id: 'unicef-programme-tech',
    name: 'UNICEF Programme Tech',
    description: 'Low-code, Power Platform, and programme-facing technology',
    keywords: [
      'power platform',
      'power apps',
      'power automate',
      'sharepoint',
      'low-code',
      'programme data',
      'workflow automation',
      'programme division',
    ],
  },
];

export const SKILL_GROUP_IDS = SKILL_GROUPS.map((g) => g.id);
