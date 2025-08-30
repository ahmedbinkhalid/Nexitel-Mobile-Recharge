import { MailService } from '@sendgrid/mail';

// VoIP number generation utility
export function generateVoipNumber(): string {
  // Generate a US-based VoIP number (format: +1-XXX-XXX-XXXX)
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const exchange = Math.floor(Math.random() * 900) + 100; // 100-999
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `+1-${areaCode}-${exchange}-${number}`;
}

// Activation code generation
export function generateActivationCode(): string {
  // Generate 8-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Email service for VoIP setup instructions
export class VoipEmailService {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendVoipSetupEmail(activation: {
    customerName: string;
    customerEmail: string;
    voipNumber: string;
    activationCode: string;
    planName: string;
  }): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not configured - skipping email send');
      return false;
    }

    const setupInstructions = this.generateSetupInstructions(activation);
    
    try {
      await this.mailService.send({
        to: activation.customerEmail,
        from: process.env.FROM_EMAIL || 'noreply@nexitel.com',
        subject: `Your VoIP Phone Number is Ready - ${activation.voipNumber}`,
        html: setupInstructions,
        text: this.generatePlainTextInstructions(activation),
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send VoIP setup email:', error);
      return false;
    }
  }

  private generateSetupInstructions(activation: {
    customerName: string;
    customerEmail: string;
    voipNumber: string;
    activationCode: string;
    planName: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>VoIP Setup Instructions</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .voip-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .setup-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { margin: 15px 0; padding: 10px; background: #e9ecef; border-radius: 5px; }
            .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Your VoIP Phone Number is Ready!</h1>
                <p>Welcome to Nexitel VoIP Services</p>
            </div>
            
            <div class="content">
                <h2>Hello ${activation.customerName},</h2>
                <p>Your VoIP phone number has been successfully activated! Here are your details:</p>
                
                <div class="voip-details">
                    <h3>📞 Your VoIP Details</h3>
                    <p><strong>VoIP Phone Number:</strong> ${activation.voipNumber}</p>
                    <p><strong>Activation Code:</strong> ${activation.activationCode}</p>
                    <p><strong>Plan:</strong> ${activation.planName}</p>
                    <p><strong>Email:</strong> ${activation.customerEmail}</p>
                </div>
                
                <div class="setup-steps">
                    <h3>📱 Setup Instructions for Nexiphone App</h3>
                    
                    <div class="step">
                        <h4>Step 1: Download the Nexiphone App</h4>
                        <p>Download the Nexiphone app from:</p>
                        <ul>
                            <li>📱 <strong>iOS:</strong> App Store - Search "Nexiphone"</li>
                            <li>🤖 <strong>Android:</strong> Google Play Store - Search "Nexiphone"</li>
                        </ul>
                    </div>
                    
                    <div class="step">
                        <h4>Step 2: Open the App and Select "Add Account"</h4>
                        <p>Launch the Nexiphone app and tap "Add Account" or "+"</p>
                    </div>
                    
                    <div class="step">
                        <h4>Step 3: Enter Your VoIP Configuration</h4>
                        <p>Enter the following information exactly as shown:</p>
                        <ul>
                            <li><strong>Phone Number:</strong> ${activation.voipNumber}</li>
                            <li><strong>Activation Code:</strong> ${activation.activationCode}</li>
                            <li><strong>Server:</strong> nexitel.voip.com</li>
                            <li><strong>Port:</strong> 5060</li>
                        </ul>
                    </div>
                    
                    <div class="step">
                        <h4>Step 4: Complete Setup</h4>
                        <p>Tap "Register" or "Save" to complete the setup. Your phone will connect to the Nexitel network.</p>
                    </div>
                    
                    <div class="step">
                        <h4>Step 5: Test Your Connection</h4>
                        <p>Make a test call to verify everything is working correctly.</p>
                    </div>
                </div>
                
                <div class="highlight">
                    <h3>📋 Quick Setup Summary</h3>
                    <p><strong>Phone Number:</strong> ${activation.voipNumber}</p>
                    <p><strong>Activation Code:</strong> ${activation.activationCode}</p>
                    <p><strong>Server:</strong> nexitel.voip.com</p>
                    <p><strong>Port:</strong> 5060</p>
                </div>
                
                <div class="setup-steps">
                    <h3>🔧 Alternative Setup (Manual Configuration)</h3>
                    <p>If you prefer to use a different VoIP app, use these SIP settings:</p>
                    <ul>
                        <li><strong>SIP Username:</strong> ${activation.voipNumber.replace(/[^0-9]/g, '')}</li>
                        <li><strong>SIP Password:</strong> ${activation.activationCode}</li>
                        <li><strong>SIP Server:</strong> nexitel.voip.com</li>
                        <li><strong>Port:</strong> 5060</li>
                        <li><strong>Transport:</strong> UDP</li>
                    </ul>
                </div>
                
                <div class="highlight">
                    <h3>📞 Need Help?</h3>
                    <p>If you experience any issues during setup:</p>
                    <ul>
                        <li>📧 Email: support@nexitel.com</li>
                        <li>📞 Phone: 1-800-NEXITEL</li>
                        <li>💬 Live Chat: Available 24/7 on our website</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Thank you for choosing Nexitel VoIP Services!</p>
                    <p>This email was sent to ${activation.customerEmail}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generatePlainTextInstructions(activation: {
    customerName: string;
    customerEmail: string;
    voipNumber: string;
    activationCode: string;
    planName: string;
  }): string {
    return `
Your VoIP Phone Number is Ready!

Hello ${activation.customerName},

Your VoIP phone number has been successfully activated!

YOUR VOIP DETAILS:
- VoIP Phone Number: ${activation.voipNumber}
- Activation Code: ${activation.activationCode}
- Plan: ${activation.planName}
- Email: ${activation.customerEmail}

SETUP INSTRUCTIONS FOR NEXIPHONE APP:

Step 1: Download the Nexiphone App
- iOS: App Store - Search "Nexiphone"
- Android: Google Play Store - Search "Nexiphone"

Step 2: Open the App and Select "Add Account"
Launch the Nexiphone app and tap "Add Account" or "+"

Step 3: Enter Your VoIP Configuration
- Phone Number: ${activation.voipNumber}
- Activation Code: ${activation.activationCode}
- Server: nexitel.voip.com
- Port: 5060

Step 4: Complete Setup
Tap "Register" or "Save" to complete the setup.

Step 5: Test Your Connection
Make a test call to verify everything is working correctly.

ALTERNATIVE SETUP (Manual Configuration):
If you prefer to use a different VoIP app, use these SIP settings:
- SIP Username: ${activation.voipNumber.replace(/[^0-9]/g, '')}
- SIP Password: ${activation.activationCode}
- SIP Server: nexitel.voip.com
- Port: 5060
- Transport: UDP

NEED HELP?
- Email: support@nexitel.com
- Phone: 1-800-NEXITEL
- Live Chat: Available 24/7 on our website

Thank you for choosing Nexitel VoIP Services!
    `;
  }
}