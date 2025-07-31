export interface VipContact {
  email: string
  name: string
  relationshipType: 'Board Member' | 'Investor' | 'Executive' | 'Client' | 'Partner' | 'VIP' | 'Other'
  source: 'suggested' | 'manual' | 'imported'
  priority?: number
  lastContact?: string
  company?: string
}

export const mockVipContacts: VipContact[] = [
  // Board Members
  {
    email: 'sarah.johnson@boardmember.com',
    name: 'Sarah Johnson',
    relationshipType: 'Board Member',
    source: 'suggested',
    priority: 1,
    company: 'Johnson Capital Partners',
    lastContact: '2024-01-15'
  },
  {
    email: 'robert.taylor@governance.co',
    name: 'Robert Taylor',
    relationshipType: 'Board Member', 
    source: 'suggested',
    priority: 1,
    company: 'Governance Solutions',
    lastContact: '2024-01-12'
  },
  
  // Investors
  {
    email: 'michael.chen@vcfund.com',
    name: 'Michael Chen',
    relationshipType: 'Investor',
    source: 'suggested',
    priority: 1,
    company: 'Sequoia Capital',
    lastContact: '2024-01-18'
  },
  {
    email: 'lisa.rodriguez@growth.capital',
    name: 'Lisa Rodriguez',
    relationshipType: 'Investor',
    source: 'suggested',
    priority: 1,
    company: 'Growth Capital Partners',
    lastContact: '2024-01-10'
  },
  {
    email: 'james.wilson@andreessen.com',
    name: 'James Wilson',
    relationshipType: 'Investor',
    source: 'suggested',
    priority: 2,
    company: 'Andreessen Horowitz',
    lastContact: '2024-01-08'
  },
  
  // Executive Team
  {
    email: 'david.kim@company.com',
    name: 'David Kim',
    relationshipType: 'Executive',
    source: 'suggested',
    priority: 2,
    company: 'Internal - CTO',
    lastContact: '2024-01-20'
  },
  {
    email: 'jennifer.brown@company.com',
    name: 'Jennifer Brown',
    relationshipType: 'Executive',
    source: 'suggested',
    priority: 2,
    company: 'Internal - COO',
    lastContact: '2024-01-19'
  },
  {
    email: 'alex.martinez@company.com',
    name: 'Alex Martinez',
    relationshipType: 'Executive',
    source: 'suggested',
    priority: 2,
    company: 'Internal - CFO',
    lastContact: '2024-01-17'
  },
  
  // Key Clients
  {
    email: 'thomas.anderson@fortune500.com',
    name: 'Thomas Anderson',
    relationshipType: 'Client',
    source: 'suggested',
    priority: 2,
    company: 'Fortune 500 Corp',
    lastContact: '2024-01-16'
  },
  {
    email: 'maria.garcia@enterprise.co',
    name: 'Maria Garcia',
    relationshipType: 'Client',
    source: 'suggested',
    priority: 3,
    company: 'Enterprise Solutions',
    lastContact: '2024-01-14'
  },
  {
    email: 'john.smith@bigclient.com',
    name: 'John Smith',
    relationshipType: 'Client',
    source: 'suggested',
    priority: 3,
    company: 'Big Client Corp',
    lastContact: '2024-01-13'
  },
  
  // Strategic Partners
  {
    email: 'rachel.green@strategic.partners',
    name: 'Rachel Green',
    relationshipType: 'Partner',
    source: 'suggested',
    priority: 3,
    company: 'Strategic Partners LLC',
    lastContact: '2024-01-11'
  },
  {
    email: 'kevin.lee@alliance.co',
    name: 'Kevin Lee',
    relationshipType: 'Partner',
    source: 'suggested',
    priority: 3,
    company: 'Alliance Corp',
    lastContact: '2024-01-09'
  }
]

// Utility functions
export const getVipContactsByType = (type: VipContact['relationshipType']) => {
  return mockVipContacts.filter(contact => contact.relationshipType === type)
}

export const getVipContactsByPriority = (priority: number) => {
  return mockVipContacts.filter(contact => contact.priority === priority)
}

export const searchVipContacts = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return mockVipContacts.filter(contact => 
    contact.name.toLowerCase().includes(lowercaseQuery) ||
    contact.email.toLowerCase().includes(lowercaseQuery) ||
    contact.company?.toLowerCase().includes(lowercaseQuery) ||
    contact.relationshipType.toLowerCase().includes(lowercaseQuery)
  )
}

export const getSuggestedVipContacts = (role: string, limit: number = 8) => {
  // Suggest different contacts based on executive role
  let priorityOrder: VipContact['relationshipType'][] = []
  
  switch (role) {
    case 'ceo':
    case 'founder':
      priorityOrder = ['Board Member', 'Investor', 'Executive', 'Client', 'Partner']
      break
    case 'coo':
      priorityOrder = ['Executive', 'Client', 'Partner', 'Board Member', 'Investor']
      break
    case 'cfo':
      priorityOrder = ['Investor', 'Board Member', 'Executive', 'Client', 'Partner']
      break
    case 'cto':
      priorityOrder = ['Executive', 'Partner', 'Client', 'Board Member', 'Investor']
      break
    default:
      priorityOrder = ['Executive', 'Client', 'Partner', 'Board Member', 'Investor']
  }
  
  const suggested: VipContact[] = []
  
  for (const type of priorityOrder) {
    const contacts = getVipContactsByType(type)
    suggested.push(...contacts)
    if (suggested.length >= limit) break
  }
  
  return suggested.slice(0, limit)
}