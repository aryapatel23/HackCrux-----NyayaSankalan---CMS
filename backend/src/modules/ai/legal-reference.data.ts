export type LegalCodeType = 'ipc' | 'bns'

export interface LegalReference {
  code: LegalCodeType
  number: string
  section: string
  title: string
  description: string
  punishment: string
  bailable?: boolean
  cognizable?: boolean
  category?: string
  relatedSections?: string[]
  ipc_equivalent?: string
  precedents?: Array<{
    title: string
    summary: string
  }>
}

const IPC_REFERENCES: Record<string, LegalReference> = {
  '302': {
    code: 'ipc',
    number: '302',
    section: 'IPC 302',
    title: 'Punishment for murder',
    description:
      'Applies when the act amounts to murder under IPC 300, typically involving intentional killing or an act done with the knowledge that it is so imminently dangerous that death is likely.',
    punishment: 'Death penalty or imprisonment for life, and may also include a fine.',
    bailable: false,
    cognizable: true,
    category: 'Offence against the human body',
    relatedSections: ['IPC 299', 'IPC 300', 'IPC 304', 'IPC 34', 'IPC 120B'],
    precedents: [
      {
        title: 'Bachan Singh v. State of Punjab',
        summary: 'Explained that death penalty should be used only in the rarest of rare cases.',
      },
      {
        title: 'Virsa Singh v. State of Punjab',
        summary: 'Clarified how intention and the nature of injury can establish liability for murder.',
      },
    ],
  },
  '304': {
    code: 'ipc',
    number: '304',
    section: 'IPC 304',
    title: 'Culpable homicide not amounting to murder',
    description:
      'Covers culpable homicide cases that do not reach the legal threshold of murder, often depending on intention, knowledge, provocation, or other exceptions under IPC 300.',
    punishment: 'Part I can extend to imprisonment for life or up to 10 years with fine; Part II can extend to 10 years, or fine, or both.',
    bailable: false,
    cognizable: true,
    category: 'Offence against the human body',
    relatedSections: ['IPC 299', 'IPC 300', 'IPC 302'],
    precedents: [
      {
        title: 'K.M. Nanavati v. State of Maharashtra',
        summary: 'Frequently discussed in the context of grave and sudden provocation and the murder versus culpable homicide distinction.',
      },
    ],
  },
  '307': {
    code: 'ipc',
    number: '307',
    section: 'IPC 307',
    title: 'Attempt to murder',
    description:
      'Applies where a person does an act with such intention or knowledge and under such circumstances that, if death were caused, the act would amount to murder.',
    punishment: 'May extend to 10 years and fine; if hurt is caused, punishment may extend to imprisonment for life.',
    bailable: false,
    cognizable: true,
    category: 'Offence against the human body',
    relatedSections: ['IPC 302', 'IPC 324', 'IPC 326'],
  },
  '379': {
    code: 'ipc',
    number: '379',
    section: 'IPC 379',
    title: 'Punishment for theft',
    description:
      'Covers dishonest moving of movable property out of another person’s possession without consent.',
    punishment: 'Imprisonment up to 3 years, or fine, or both.',
    bailable: true,
    cognizable: true,
    category: 'Offences against property',
    relatedSections: ['IPC 378', 'IPC 380', 'IPC 381'],
  },
  '420': {
    code: 'ipc',
    number: '420',
    section: 'IPC 420',
    title: 'Cheating and dishonestly inducing delivery of property',
    description:
      'Applies when cheating is accompanied by dishonest inducement to deliver property, alter valuable security, or do an act causing wrongful loss.',
    punishment: 'Imprisonment up to 7 years and fine.',
    bailable: false,
    cognizable: true,
    category: 'Offences against property',
    relatedSections: ['IPC 415', 'IPC 417', 'IPC 418', 'IPC 406'],
    precedents: [
      {
        title: 'Hridaya Ranjan Prasad Verma v. State of Bihar',
        summary: 'Explained that dishonest intention should generally exist at the time of the original inducement.',
      },
    ],
  },
  '144': {
    code: 'ipc',
    number: '144',
    section: 'IPC 144',
    title: 'Joining unlawful assembly armed with deadly weapon',
    description:
      'Applies when a person joins or continues in an unlawful assembly while armed with a deadly weapon, or with anything which used as a weapon is likely to cause death. It is treated as an aggravated form of unlawful assembly membership.',
    punishment: 'Imprisonment up to 2 years, or fine, or both.',
    bailable: true,
    cognizable: true,
    category: 'Offences against public tranquility',
    relatedSections: ['IPC 141', 'IPC 142', 'IPC 143', 'IPC 149'],
    precedents: [
      {
        title: 'Moti Das v. State of Bihar',
        summary: 'Stressed that prosecution must prove active membership of unlawful assembly plus being armed with a deadly weapon.',
      },
      {
        title: 'Distinction with CrPC Section 144',
        summary: 'Courts distinguish IPC 144 (substantive offence) from CrPC 144 (preventive order power of Magistrate).',
      },
    ],
  },
  '498A': {
    code: 'ipc',
    number: '498A',
    section: 'IPC 498A',
    title: 'Cruelty by husband or relatives of husband',
    description:
      'Targets cruelty toward a married woman, including conduct likely to drive her to suicide or cause grave injury, and harassment linked to unlawful demands.',
    punishment: 'Imprisonment up to 3 years and fine.',
    bailable: false,
    cognizable: true,
    category: 'Offences relating to marriage',
    relatedSections: ['IPC 304B', 'IPC 306'],
  },
}

const BNS_REFERENCES: Record<string, LegalReference> = {
  '103': {
    code: 'bns',
    number: '103',
    section: 'BNS 103',
    title: 'Punishment for murder',
    description:
      'This is the Bharatiya Nyaya Sanhita provision addressing punishment where the offence amounts to murder under the BNS framework.',
    punishment: 'Death penalty or imprisonment for life, and may also include a fine.',
    bailable: false,
    cognizable: true,
    category: 'Offence against the human body',
    relatedSections: ['BNS 101', 'BNS 102'],
    ipc_equivalent: 'IPC 302',
    precedents: [
      {
        title: 'Use IPC 302 precedent line with caution',
        summary: 'Where the language and ingredients remain materially similar, older murder jurisprudence may still guide interpretation until BNS case law develops.',
      },
    ],
  },
  '84': {
    code: 'bns',
    number: '84',
    section: 'BNS 84',
    title: 'Act of a person of unsound mind (general exception)',
    description:
      'Provides a defence where, at the time of the act, due to unsoundness of mind, the person was incapable of knowing the nature of the act or that it was wrong or contrary to law. This follows the legal-insanity standard and not mere medical diagnosis.',
    punishment: 'No direct punishment under this section because it is a general exception/defence. Outcome depends on whether the defence is accepted in trial.',
    category: 'General exceptions',
    relatedSections: ['IPC 84 (equivalent)', 'BSA Section 105 (burden for exceptions)', 'BNSS procedure on accused of unsound mind'],
    ipc_equivalent: 'IPC 84',
    precedents: [
      {
        title: 'Dahyabhai Chhaganbhai Thakkar v. State of Gujarat',
        summary: 'Accused must establish legal insanity on preponderance of probabilities while prosecution still proves offence ingredients.',
      },
      {
        title: 'Surendra Mishra v. State of Jharkhand',
        summary: 'Clarified the difference between legal insanity and medical insanity.',
      },
      {
        title: 'Shrikant Anandrao Bhosale v. State of Maharashtra',
        summary: 'State of mind at the time of occurrence is central to deciding the exception.',
      },
    ],
  },
}

const REFERENCES: Record<LegalCodeType, Record<string, LegalReference>> = {
  ipc: IPC_REFERENCES,
  bns: BNS_REFERENCES,
}

const normalizeSection = (value: string) => value.trim().toUpperCase().replace(/\s+/g, '')

export const parseSectionQuery = (query: string): { codeType: LegalCodeType; section: string } | null => {
  const normalized = query.trim().toLowerCase()
  const directMatch = normalized.match(/\b(ipc|bns)\s*(?:section\s*)?(\d+[a-z]?)\b/i)

  if (directMatch) {
    return {
      codeType: directMatch[1].toLowerCase() as LegalCodeType,
      section: directMatch[2].toUpperCase(),
    }
  }

  const impliedLegalQuery = /\b(section|act|law|legal|ipc|bns|explain|meaning|punishment|bailable|cognizable|what is|tell me about)\b/i
  const numericMatch = normalized.match(/\b(\d{1,4}[a-z]?)\b/i)

  if (numericMatch && impliedLegalQuery.test(normalized)) {
    return {
      codeType: normalized.includes('bns') ? 'bns' : 'ipc',
      section: numericMatch[1].toUpperCase(),
    }
  }

  return null
}

export const getLegalReference = (section: string, codeType: LegalCodeType): LegalReference | null => {
  const normalized = normalizeSection(section)
  return REFERENCES[codeType][normalized] || null
}

export const getPrecedentsForSection = (section: string, codeType: LegalCodeType) => {
  return getLegalReference(section, codeType)?.precedents || []
}

export const getSectionsList = (codeType: 'ipc' | 'bns' | 'both' = 'both') => {
  const selected = codeType === 'both'
    ? [...Object.values(IPC_REFERENCES), ...Object.values(BNS_REFERENCES)]
    : Object.values(REFERENCES[codeType])

  return selected.map((item) => ({
    code: item.code,
    number: item.number,
    section: item.section,
    title: item.title,
    ipc_equivalent: item.ipc_equivalent,
  }))
}

export const formatLegalReferenceAnswer = (reference: LegalReference) => {
  const lines = [
    reference.title,
    '',
    `Section: ${reference.section}`,
    '',
    `What it covers: ${reference.description}`,
    '',
    `Punishment: ${reference.punishment}`,
    '',
    `Bailable: ${reference.bailable === undefined ? 'Not specified' : reference.bailable ? 'Yes' : 'No'}`,
    `Cognizable: ${reference.cognizable === undefined ? 'Not specified' : reference.cognizable ? 'Yes' : 'No'}`,
  ]

  if (reference.category) {
    lines.push(`Category: ${reference.category}`)
  }

  if (reference.ipc_equivalent) {
    lines.push(`IPC Equivalent: ${reference.ipc_equivalent}`)
  }

  if (reference.relatedSections?.length) {
    lines.push('', `Related sections: ${reference.relatedSections.join(', ')}`)
  }

  if (reference.precedents?.length) {
    lines.push('', 'Relevant precedents:')
    reference.precedents.slice(0, 3).forEach((item) => {
      lines.push(`- ${item.title}`)
      lines.push(`  ${item.summary}`)
    })
  }

  lines.push('', 'This is informational guidance for legal workflow support, not a final legal opinion.')

  return lines.join('\n')
}