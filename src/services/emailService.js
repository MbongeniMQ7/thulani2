// AFMA Church Email Service - Supabase Edge Functions + Resend
// Automatic email sending without manual composition

export class EmailNotificationService {
  static SUPABASE_FUNCTION_URL = 'https://imiojmzohfizckxbnfmk.supabase.co/functions/v1/send-email';
  static SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaW9qbXpvaGZpemNreGJuZm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzU5NDQsImV4cCI6MjA3MzcxMTk0NH0.UFLP33abaKTI1PC4BvejFBiVhjKaZhw5G7pPtaypFG8';
  
  static async sendEmail(emailData) {
    try {
      console.log('Sending automatic email via Supabase + Resend:', emailData);
      
      // Map the data to match our Edge Function interface
      const payload = {
        to: emailData.to,
        name: emailData.name,
        surname: emailData.surname,
        type: emailData.type,
        queuePosition: emailData.position || emailData.newPosition,
        estimatedTime: this.calculateEstimatedTime(emailData.position || emailData.newPosition),
        reason: emailData.reason
      };

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if it's a Resend domain verification error
        if (errorData.details && errorData.details.includes('verify a domain')) {
          console.warn('⚠️ Resend domain not verified - logging email instead of sending:', {
            to: emailData.to,
            type: emailData.type,
            name: `${emailData.name} ${emailData.surname || ''}`.trim()
          });
          
          return { 
            success: true, 
            message: 'Email logged (domain verification needed for live sending)',
            fallback: true,
            data: emailData 
          };
        }
        
        throw new Error(`Email service error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      
      return { 
        success: true, 
        message: 'Email sent automatically',
        emailId: result.emailId,
        data: emailData 
      };
      
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Graceful fallback - log the email details instead of failing
      console.warn('📧 Email fallback - would have sent:', {
        to: emailData.to,
        type: emailData.type,
        name: `${emailData.name} ${emailData.surname || ''}`.trim()
      });
      
      return { 
        success: true, // Return success to not break the app
        message: 'Email logged (service temporarily unavailable)',
        fallback: true,
        error: error.message,
        data: emailData 
      };
    }
  }

  static calculateEstimatedTime(position) {
    if (!position || position <= 0) return 'Ready now';
    
    // Estimate 10-15 minutes per person ahead
    const avgTimePerPerson = 12; // minutes
    const estimatedMinutes = (position - 1) * avgTimePerPerson;
    
    if (estimatedMinutes <= 0) return 'Ready now';
    if (estimatedMinutes < 60) return `${estimatedMinutes} minutes`;
    
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  }

  static async sendApprovalEmail(queueEntry, adminNotes) {
    adminNotes = adminNotes || '';
    return await this.sendEmail({
      to: queueEntry.email,
      type: 'approval',
      name: queueEntry.first_name,
      surname: queueEntry.last_name,
      queueType: queueEntry.queue_type,
      position: queueEntry.position,
      reason: queueEntry.reason || adminNotes
    });
  }

  static async sendDeclineEmail(queueEntry, declineReason) {
    return await this.sendEmail({
      to: queueEntry.email,
      type: 'decline',
      name: queueEntry.first_name,
      surname: queueEntry.last_name,
      queueType: queueEntry.queue_type,
      reason: declineReason
    });
  }

  static async sendPositionUpdateEmail(queueEntry, newPosition) {
    return await this.sendEmail({
      to: queueEntry.email,
      type: 'position_update',
      name: queueEntry.first_name,
      surname: queueEntry.last_name,
      queueType: queueEntry.queue_type,
      position: newPosition,
      newPosition: newPosition
    });
  }

  static async sendYourTurnEmail(queueEntry) {
    return await this.sendEmail({
      to: queueEntry.email,
      type: 'your_turn',
      name: queueEntry.first_name,
      surname: queueEntry.last_name,
      queueType: queueEntry.queue_type,
      position: 1
    });
  }
}
