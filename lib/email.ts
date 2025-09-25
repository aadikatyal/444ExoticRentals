import { Resend } from 'resend'

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  carMake: string
  carModel: string
  carYear: number
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  location: string
  totalPrice: number
  depositAmount: number
  bookingType: 'rental' | 'photoshoot'
  hours?: number
  bookingId: string
}

export interface AdminEmailData extends BookingEmailData {
  adminEmail: string
}

// Email templates
export const emailTemplates = {
  depositConfirmation: (data: BookingEmailData) => ({
    subject: `Deposit Confirmation - ${data.carMake} ${data.carModel} ${data.carYear}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">444 Exotic Rentals</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Deposit Payment Confirmed!</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Thank you for your deposit payment. Your booking request has been received and is pending approval.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.carMake} ${data.carModel} ${data.carYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.bookingType === 'rental' ? 'Rental' : 'Photoshoot'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startDate}${data.endDate !== data.startDate ? ` - ${data.endDate}` : ''}</td>
              </tr>
              ${data.startTime ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.location}</td>
              </tr>
              ${data.hours ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.hours} hours</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Price:</td>
                <td style="padding: 8px 0; color: #1f2937;">$${data.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Deposit Paid:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">$${data.depositAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">⏳ Next Steps:</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">
              Your booking is now pending approval. You will receive an email once it's approved, 
              and then you can complete your final payment.
            </p>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            If you have any questions, please contact us at <a href="mailto:admin@444exoticrentals.com" style="color: #dc2626;">admin@444exoticrentals.com</a> or call (470) 880-6265.
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 444 Exotic Rentals. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  adminDepositNotification: (data: AdminEmailData) => ({
    subject: `New Booking Request - ${data.carMake} ${data.carModel} ${data.carYear}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">444 Exotic Rentals - Admin</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Booking Request Received</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            A new booking request has been submitted and deposit payment has been received.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.customerEmail}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.carMake} ${data.carModel} ${data.carYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.bookingType === 'rental' ? 'Rental' : 'Photoshoot'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startDate}${data.endDate !== data.startDate ? ` - ${data.endDate}` : ''}</td>
              </tr>
              ${data.startTime ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.location}</td>
              </tr>
              ${data.hours ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.hours} hours</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Price:</td>
                <td style="padding: 8px 0; color: #1f2937;">$${data.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Deposit Received:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">$${data.depositAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${data.bookingId}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">🔔 Action Required:</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">
              Please review and approve this booking in the admin panel. The customer is waiting for approval to proceed with final payment.
            </p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Booking
            </a>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 444 Exotic Rentals. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bookingApproved: (data: BookingEmailData) => ({
    subject: `Booking Approved - ${data.carMake} ${data.carModel} ${data.carYear}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">444 Exotic Rentals</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Your Booking Has Been Approved!</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Great news! Your booking request has been approved. You can now complete your final payment to confirm your reservation.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.carMake} ${data.carModel} ${data.carYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.bookingType === 'rental' ? 'Rental' : 'Photoshoot'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startDate}${data.endDate !== data.startDate ? ` - ${data.endDate}` : ''}</td>
              </tr>
              ${data.startTime ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.location}</td>
              </tr>
              ${data.hours ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.hours} hours</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Price:</td>
                <td style="padding: 8px 0; color: #1f2937;">$${data.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Deposit Paid:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">$${data.depositAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Remaining Balance:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">$${(data.totalPrice - data.depositAmount).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">💳 Complete Your Payment:</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">
              Click the button below to complete your final payment and secure your booking.
            </p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account?tab=approved" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Complete Payment
            </a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            If you have any questions, please contact us at <a href="mailto:admin@444exoticrentals.com" style="color: #dc2626;">admin@444exoticrentals.com</a> or call (470) 880-6265.
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 444 Exotic Rentals. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  finalConfirmation: (data: BookingEmailData) => ({
    subject: `Booking Confirmed - ${data.carMake} ${data.carModel} ${data.carYear}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">444 Exotic Rentals</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Booking Confirmed!</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Congratulations! Your booking has been confirmed and payment has been received. 
            We're excited to provide you with an unforgettable experience.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Booking Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.carMake} ${data.carModel} ${data.carYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.bookingType === 'rental' ? 'Rental' : 'Photoshoot'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startDate}${data.endDate !== data.startDate ? ` - ${data.endDate}` : ''}</td>
              </tr>
              ${data.startTime ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.location}</td>
              </tr>
              ${data.hours ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.hours} hours</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Paid:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">$${data.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${data.bookingId}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #0c4a6e; font-weight: bold;">📋 What's Next:</p>
            <ul style="margin: 5px 0 0 0; color: #0c4a6e; padding-left: 20px;">
              <li>You will receive a confirmation call 24 hours before your booking</li>
              <li>Please arrive 15 minutes early for vehicle inspection</li>
              <li>Bring a valid driver's license and credit card</li>
              <li>Contact us immediately if you need to make any changes</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            If you have any questions or need to make changes to your booking, please contact us at 
            <a href="mailto:admin@444exoticrentals.com" style="color: #dc2626;">admin@444exoticrentals.com</a> or call (470) 880-6265.
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 444 Exotic Rentals. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  adminFinalConfirmation: (data: AdminEmailData) => ({
    subject: `Booking Completed - ${data.carMake} ${data.carModel} ${data.carYear}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">444 Exotic Rentals - Admin</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">✅ Booking Completed</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            A booking has been fully confirmed with final payment received.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.customerEmail}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.carMake} ${data.carModel} ${data.carYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.bookingType === 'rental' ? 'Rental' : 'Photoshoot'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startDate}${data.endDate !== data.startDate ? ` - ${data.endDate}` : ''}</td>
              </tr>
              ${data.startTime ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.location}</td>
              </tr>
              ${data.hours ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.hours} hours</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Revenue:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">$${data.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${data.bookingId}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #0c4a6e; font-weight: bold;">📋 Next Steps:</p>
            <ul style="margin: 5px 0 0 0; color: #0c4a6e; padding-left: 20px;">
              <li>Prepare vehicle for pickup/delivery</li>
              <li>Contact customer 24 hours before booking</li>
              <li>Ensure all documentation is ready</li>
              <li>Update vehicle availability if needed</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 444 Exotic Rentals. All rights reserved.</p>
        </div>
      </div>
    `
  })
}

// Email sending functions
export async function sendDepositConfirmation(data: BookingEmailData) {
  if (!resend) {
    console.warn('⚠️ Resend not configured - skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const template = emailTemplates.depositConfirmation(data)
    
    const result = await resend.emails.send({
      from: 'noreply@notifications.444exoticrentals.com',
      to: [data.customerEmail],
      subject: template.subject,
      html: template.html,
    })

    console.log('📧 Resend response:', result)
    console.log('✅ Deposit confirmation email sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send deposit confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendAdminDepositNotification(data: AdminEmailData) {
  if (!resend) {
    console.warn('⚠️ Resend not configured - skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const template = emailTemplates.adminDepositNotification(data)
    
    const result = await resend.emails.send({
      from: 'noreply@notifications.444exoticrentals.com',
      to: [data.adminEmail],
      subject: template.subject,
      html: template.html,
    })

    console.log('✅ Admin deposit notification email sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send admin deposit notification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendBookingApproved(data: BookingEmailData) {
  if (!resend) {
    console.warn('⚠️ Resend not configured - skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const template = emailTemplates.bookingApproved(data)
    
    const result = await resend.emails.send({
      from: 'noreply@notifications.444exoticrentals.com',
      to: [data.customerEmail],
      subject: template.subject,
      html: template.html,
    })

    console.log('✅ Booking approved email sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send booking approved email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendFinalConfirmation(data: BookingEmailData) {
  try {
    const template = emailTemplates.finalConfirmation(data)
    
    const result = await resend.emails.send({
      from: 'noreply@notifications.444exoticrentals.com',
      to: [data.customerEmail],
      subject: template.subject,
      html: template.html,
    })

    console.log('✅ Final confirmation email sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send final confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendAdminFinalConfirmation(data: AdminEmailData) {
  try {
    const template = emailTemplates.adminFinalConfirmation(data)
    
    const result = await resend.emails.send({
      from: 'noreply@notifications.444exoticrentals.com',
      to: [data.adminEmail],
      subject: template.subject,
      html: template.html,
    })

    console.log('✅ Admin final confirmation email sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send admin final confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
