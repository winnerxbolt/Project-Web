// Profanity Filter for Thai and English
const profanityWords = {
  thai: [
    'ควย', 'หี', 'เหี้ย', 'สัด', 'เย็ด', 'เชี่ย', 'ไอ้เหี้ย', 'ไอ้สัด',
    'มึง', 'กู', 'ระยำ', 'เลว', 'ชาติชั่ว', 'ชั่ว', 'แรด',
    'เวร', 'ดอกทอง', 'ส้นตีน', 'หมา', 'สันดาน', 'ชั่วโคตร',
    'อีดอก', 'อีตัว', 'อีนั่น', 'อีนี่', 'ไอ้', 'โง่', 'ปัญญาอ่อน',
    'ห่า', 'เฮง', 'ซวย', 'ตาย', 'พ่อมึง', 'แม่มึง', 'เจ็บ', 'พิการ',
    'โสโครก', 'เลวทรามาน', 'เลว', 'ชั่ว', 'เดรัจฉาน', 'สัตว์',
    'เวรตระกูล', 'นรก', 'เปรต', 'อสุรา','เส', 'แตก', 'จัญไร', 'ควาย', 
    'หมู', 'กระดูก', 'ตุ๊ด',
    'กะหรี่', 'โสเภณี', 'แก่','ขี้', 'ตูด',
    'นม', 'ฉิ่ง', 'เจ๊ก', 'ขโมย', 'ปล้น', 'ฆ่า'
  ],
  english: [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'hell', 'dick',
    'cock', 'pussy', 'cunt', 'motherfucker', 'fck', 'wtf', 'stfu', 'slut',
    'whore', 'ass', 'piss', 'crap', 'goddamn', 'son of a bitch', 'dumbass',
    'jackass', 'bullshit', 'dipshit', 'douche', 'idiot', 'moron', 'retard',
    'stupid', 'dumb', 'loser', 'jerk', 'prick', 'screw', 'suck', 'sucks',
    'kill', 'die', 'death', 'murder', 'rape', 'sex', 'porn', 'xxx',
    'naked', 'nude', 'drug', 'cocaine', 'weed', 'marijuana', 'heroin'
  ]
}

// Create regex patterns for each language
const createProfanityPattern = (words: string[]): RegExp => {
  const escaped = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
}

const thaiPattern = createProfanityPattern(profanityWords.thai)
const englishPattern = createProfanityPattern(profanityWords.english)

// Also check for variations with spaces, dots, or special characters
const createVariationPattern = (words: string[]): RegExp => {
  const variations = words.flatMap(word => {
    const chars = word.split('')
    const pattern = chars.join('[\\s\\.,_\\-*]*')
    return [word, pattern]
  })
  return new RegExp(`(${variations.join('|')})`, 'gi')
}

const thaiVariationPattern = createVariationPattern(profanityWords.thai)
const englishVariationPattern = createVariationPattern(profanityWords.english)

/**
 * Check if text contains profanity
 * @param text - Text to check
 * @returns true if profanity found, false otherwise
 */
export const containsProfanity = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false
  
  const normalizedText = text.toLowerCase().trim()
  
  // Check for exact matches
  if (thaiPattern.test(normalizedText) || englishPattern.test(normalizedText)) {
    return true
  }
  
  // Check for variations (with spaces, dots, etc.)
  if (thaiVariationPattern.test(normalizedText) || englishVariationPattern.test(normalizedText)) {
    return true
  }
  
  return false
}

/**
 * Filter profanity from text by replacing with asterisks
 * @param text - Text to filter
 * @returns Filtered text with profanity replaced
 */
export const filterProfanity = (text: string): string => {
  if (!text || typeof text !== 'string') return text
  
  let filtered = text
  
  // Replace Thai profanity
  filtered = filtered.replace(thaiPattern, (match) => '*'.repeat(match.length))
  filtered = filtered.replace(thaiVariationPattern, (match) => '*'.repeat(match.length))
  
  // Replace English profanity
  filtered = filtered.replace(englishPattern, (match) => '*'.repeat(match.length))
  filtered = filtered.replace(englishVariationPattern, (match) => '*'.repeat(match.length))
  
  return filtered
}

/**
 * Validate input and return error message if profanity found
 * @param text - Text to validate
 * @param fieldName - Name of the field being validated
 * @returns Error message if profanity found, null otherwise
 */
export const validateProfanity = (text: string, fieldName: string = 'ข้อความ'): string | null => {
  if (containsProfanity(text)) {
    return `${fieldName}มีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม`
  }
  return null
}

/**
 * Sanitize user input by removing profanity
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeInput = (text: string): string => {
  return filterProfanity(text)
}
