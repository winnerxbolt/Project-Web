// Cancellation Policy & Refund System Types

export type RefundStatus = 
  | 'pending'           // รอดำเนินการ
  | 'reviewing'         // กำลังตรวจสอบ
  | 'approved'          // อนุมัติแล้ว
  | 'rejected'          // ปฏิเสธ
  | 'processing'        // กำลังโอนเงิน
  | 'completed'         // เสร็จสิ้น
  | 'cancelled'         // ยกเลิกคำขอ

export type CancellationPolicyType =
  | 'flexible'          // ยืดหยุ่น - คืนเงินเต็มจำนวนก่อน 24 ชม.
  | 'moderate'          // ปานกลาง - คืนเงิน 50% ก่อน 7 วัน
  | 'strict'            // เข้มงวด - คืนเงิน 50% ก่อน 14 วัน
  | 'super_strict'      // เข้มงวดมาก - ไม่คืนเงิน
  | 'custom'            // กำหนดเอง

export type RefundMethod =
  | 'bank_transfer'     // โอนเงินธนาคาร
  | 'credit_card'       // คืนเงินบัตรเครดิต
  | 'promptpay'         // พร้อมเพย์
  | 'voucher'           // คูปองส่วนลด
  | 'credit'            // เครดิตในระบบ

export type RefundReason =
  | 'personal'          // เหตุผลส่วนตัว
  | 'emergency'         // เหตุฉุกเฉิน
  | 'weather'           // สภาพอากาศ
  | 'property_issue'    // ปัญหาที่พัก
  | 'service_issue'     // ปัญหาการบริการ
  | 'duplicate'         // จองซ้ำ
  | 'price_change'      // ราคาเปลี่ยน
  | 'other'             // อื่นๆ

export interface CancellationPolicy {
  id: string
  name: string
  type: CancellationPolicyType
  description: string
  
  // Refund Rules
  rules: {
    daysBeforeCheckIn: number      // จำนวนวันก่อนเช็คอิน
    refundPercentage: number       // เปอร์เซ็นต์เงินคืน (0-100)
    deductionAmount?: number       // หักค่าใช้จ่าย (บาท)
    deductionPercentage?: number   // หักค่าใช้จ่าย (%)
  }[]
  
  // Special Conditions
  conditions: {
    refundDeposit: boolean              // คืนเงินมัดจำ
    refundProcessingFee: boolean        // คืนค่าธรรมเนียม
    allowPartialRefund: boolean         // อนุญาตคืนเงินบางส่วน
    minimumRefundAmount: number         // จำนวนเงินคืนขั้นต่ำ
    maxRefundDays: number               // ระยะเวลาคืนเงินสูงสุด (วัน)
    requireApproval: boolean            // ต้องอนุมัติ
    autoApproveUnder: number            // อนุมัติอัตโนมัติถ้าต่ำกว่า (บาท)
  }
  
  // Additional Info
  terms: string[]                       // เงื่อนไขเพิ่มเติม
  exceptions: string[]                  // ข้อยกเว้น
  
  isActive: boolean
  isDefault: boolean
  applicableRooms: number[]             // ห้องที่ใช้ policy นี้
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface RefundRequest {
  id: string
  bookingId: number
  userId: string
  
  // Booking Info
  guestName: string
  guestEmail: string
  guestPhone: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  originalAmount: number
  paidAmount: number
  
  // Refund Details
  requestedAmount: number
  calculatedAmount: number
  finalAmount: number
  refundPercentage: number
  deductionAmount: number
  
  // Request Info
  reason: RefundReason
  reasonDetail: string
  requestDate: string
  cancellationDate: string
  
  // Policy Applied
  policyId: string
  policyName: string
  policyType: CancellationPolicyType
  
  // Status & Processing
  status: RefundStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Refund Method
  refundMethod: RefundMethod
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  promptPayNumber?: string
  
  // Processing
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  
  approvedBy?: string
  approvedAt?: string
  approvalNotes?: string
  
  processedBy?: string
  processedAt?: string
  processingNotes?: string
  
  completedAt?: string
  
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  
  // Documents
  attachments: {
    id: string
    name: string
    url: string
    type: 'receipt' | 'bank_statement' | 'id_card' | 'other'
    uploadedAt: string
  }[]
  
  // Communication
  messages: {
    id: string
    from: 'user' | 'admin'
    message: string
    timestamp: string
  }[]
  
  // Timeline
  timeline: {
    status: RefundStatus
    timestamp: string
    note: string
    by?: string
  }[]
  
  // Metadata
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  
  createdAt: string
  updatedAt: string
}

export interface RefundAnalytics {
  period: string
  
  overview: {
    totalRequests: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    completedRefunds: number
    totalRefunded: number
    averageRefundAmount: number
    averageProcessingTime: number      // in hours
    approvalRate: number                // percentage
  }
  
  byStatus: {
    status: RefundStatus
    count: number
    amount: number
    percentage: number
  }[]
  
  byReason: {
    reason: RefundReason
    count: number
    amount: number
    averageAmount: number
  }[]
  
  byPolicy: {
    policyId: string
    policyName: string
    requests: number
    refunded: number
    averageRefundPercentage: number
  }[]
  
  byMethod: {
    method: RefundMethod
    count: number
    amount: number
  }[]
  
  timeline: {
    date: string
    requests: number
    approved: number
    rejected: number
    amount: number
  }[]
  
  topReasons: {
    reason: string
    count: number
    trend: 'up' | 'down' | 'stable'
  }[]
}

export interface RefundSettings {
  isEnabled: boolean
  
  // Automation
  autoApproval: {
    enabled: boolean
    maxAmount: number                  // อนุมัติอัตโนมัติถ้าน้อยกว่า
    requireDocuments: boolean
  }
  
  // Processing
  processing: {
    workingDays: number[]             // 1-7 (Mon-Sun)
    workingHours: {
      start: string                    // HH:mm
      end: string
    }
    averageProcessingDays: number
    maxProcessingDays: number
  }
  
  // Notifications
  notifications: {
    notifyUser: {
      onRequest: boolean
      onReview: boolean
      onApproval: boolean
      onRejection: boolean
      onCompletion: boolean
    }
    notifyAdmin: {
      onNewRequest: boolean
      onUrgent: boolean
      onHighAmount: boolean
    }
    emailTemplates: {
      request: string
      approval: string
      rejection: string
      completion: string
    }
  }
  
  // Limits
  limits: {
    maxRequestsPerUser: number        // per month
    maxRefundPercentage: number
    minRefundAmount: number
    requireApprovalAbove: number
  }
  
  // Documents
  documents: {
    required: string[]
    optional: string[]
    maxFileSize: number                // MB
    allowedTypes: string[]
  }
  
  updatedAt: string
  updatedBy: string
}

export interface RefundCalculation {
  bookingAmount: number
  daysUntilCheckIn: number
  policyRules: CancellationPolicy['rules']
  
  calculation: {
    baseAmount: number
    refundPercentage: number
    refundableAmount: number
    deductionAmount: number
    finalRefund: number
    processingFee: number
    netRefund: number
  }
  
  breakdown: {
    description: string
    amount: number
    type: 'addition' | 'deduction'
  }[]
  
  appliedRule: {
    daysBeforeCheckIn: number
    refundPercentage: number
    description: string
  }
}
