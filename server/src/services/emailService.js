import nodemailer from 'nodemailer';
import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';
import analyticsService from './analyticsService.js';

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = this.loadTemplates();
  }

  /**
   * Create email transporter based on environment
   */
  createTransporter() {
    if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration (Free 100 emails/day)
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else if (process.env.MAILGUN_API_KEY) {
      // Mailgun configuration (Free 5000 emails/month)
      return nodemailer.createTransport({
        service: 'mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_API_KEY
        }
      });
    } else {
      // Gmail configuration (fallback)
      return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  /**
   * Load email templates
   */
  loadTemplates() {
    return {
      welcome: {
        subject: 'Welcome to SecondMarket! 🎉',
        html: this.getWelcomeTemplate()
      },
      password_reset: {
        subject: 'Reset your SecondMarket password 🔐',
        html: this.getPasswordResetTemplate()
      },
      listing_approved: {
        subject: 'Your listing is now live! 🚀',
        html: this.getListingApprovedTemplate()
      },
      promotion_suggestion: {
        subject: 'Boost your listing visibility by 300% 📈',
        html: this.getPromotionSuggestionTemplate()
      },
      low_views_alert: {
        subject: 'Your listing needs attention 👀',
        html: this.getLowViewsTemplate()
      },
      new_message: {
        subject: 'New message from interested buyer 💬',
        html: this.getNewMessageTemplate()
      },
      payment_success: {
        subject: 'Payment successful! Your promotion is active ✅',
        html: this.getPaymentSuccessTemplate()
      },
      weekly_digest: {
        subject: 'Your weekly SecondMarket summary 📊',
        html: this.getWeeklyDigestTemplate()
      },
      re_engagement: {
        subject: 'We miss you! Special offer inside 🎁',
        html: this.getReEngagementTemplate()
      },
      subscription_upsell: {
        subject: 'Upgrade to Pro and save ₹200/month 💰',
        html: this.getSubscriptionUpsellTemplate()
      }
    };
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.welcome,
        html: this.templates.welcome.html
          .replace('{{userName}}', user.name)
          .replace('{{userEmail}}', user.email)
      };

      await this.sendEmail(emailData);
      
      // Track email sent for analytics
      await analyticsService.trackEvent({
        userId: user._id,
        event: 'email_sent',
        properties: {
          type: 'welcome',
          email: user.email
        }
      });

      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      return false;
    }
  }

  /**
   * Send promotion suggestion email
   */
  async sendPromotionSuggestion(user, listing, suggestionData) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.promotion_suggestion,
        html: this.templates.promotion_suggestion.html
          .replace('{{userName}}', user.name)
          .replace('{{listingTitle}}', listing.title)
          .replace('{{listingViews}}', listing.views || 0)
          .replace('{{suggestionPackage}}', suggestionData.suggested)
          .replace('{{suggestionReason}}', suggestionData.reason)
          .replace('{{discountPercent}}', suggestionData.discount || 0)
          .replace('{{listingUrl}}', `${process.env.CLIENT_URL}/listings/${listing._id}`)
      };

      await this.sendEmail(emailData);
      
      await analyticsService.trackEvent({
        userId: user._id,
        event: 'email_sent',
        properties: {
          type: 'promotion_suggestion',
          listingId: listing._id,
          package: suggestionData.suggested
        }
      });

      return true;
    } catch (error) {
      console.error('Promotion suggestion email error:', error);
      return false;
    }
  }

  /**
   * Send low views alert
   */
  async sendLowViewsAlert(user, listing) {
    try {
      const daysSinceCreated = Math.floor((Date.now() - listing.createdAt) / (1000 * 60 * 60 * 24));
      
      const emailData = {
        to: user.email,
        ...this.templates.low_views_alert,
        html: this.templates.low_views_alert.html
          .replace('{{userName}}', user.name)
          .replace('{{listingTitle}}', listing.title)
          .replace('{{daysSince}}', daysSinceCreated)
          .replace('{{currentViews}}', listing.views || 0)
          .replace('{{listingUrl}}', `${process.env.CLIENT_URL}/listings/${listing._id}`)
      };

      await this.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Low views alert email error:', error);
      return false;
    }
  }

  /**
   * Send payment success confirmation
   */
  async sendPaymentSuccess(user, transaction) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.payment_success,
        html: this.templates.payment_success.html
          .replace('{{userName}}', user.name)
          .replace('{{amount}}', transaction.amount)
          .replace('{{packageName}}', transaction.promotionData?.packageName || 'Package')
          .replace('{{duration}}', transaction.promotionData?.duration || 7)
          .replace('{{transactionId}}', transaction._id)
      };

      await this.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Payment success email error:', error);
      return false;
    }
  }

  /**
   * Send weekly digest to active users
   */
  async sendWeeklyDigest(user, digestData) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.weekly_digest,
        html: this.templates.weekly_digest.html
          .replace('{{userName}}', user.name)
          .replace('{{weeklyViews}}', digestData.views || 0)
          .replace('{{weeklyMessages}}', digestData.messages || 0)
          .replace('{{newListings}}', digestData.newListings || 0)
          .replace('{{earnings}}', digestData.earnings || 0)
      };

      await this.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Weekly digest email error:', error);
      return false;
    }
  }

  /**
   * Send re-engagement email to inactive users
   */
  async sendReEngagementEmail(user, offerData = {}) {
    try {
      const daysSinceActive = Math.floor((Date.now() - user.lastActive) / (1000 * 60 * 60 * 24));
      
      const emailData = {
        to: user.email,
        ...this.templates.re_engagement,
        html: this.templates.re_engagement.html
          .replace('{{userName}}', user.name)
          .replace('{{daysSince}}', daysSinceActive)
          .replace('{{offerDiscount}}', offerData.discount || 20)
          .replace('{{offerCode}}', offerData.code || 'COMEBACK20')
      };

      await this.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Re-engagement email error:', error);
      return false;
    }
  }

  /**
   * Send subscription upsell email
   */
  async sendSubscriptionUpsell(user, upsellData) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.subscription_upsell,
        html: this.templates.subscription_upsell.html
          .replace('{{userName}}', user.name)
          .replace('{{currentTier}}', user.subscriptionTier)
          .replace('{{recommendedTier}}', upsellData.recommended)
          .replace('{{savings}}', upsellData.savings)
          .replace('{{features}}', upsellData.features.join(', '))
      };

      await this.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Subscription upsell email error:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetUrl, resetToken) {
    try {
      const emailData = {
        to: user.email,
        ...this.templates.password_reset,
        html: this.templates.password_reset.html
          .replace(/{{userName}}/g, user.name)
          .replace(/{{resetUrl}}/g, resetUrl)
          .replace(/{{resetToken}}/g, resetToken)
          .replace(/{{userEmail}}/g, user.email)
      };

      await this.sendEmail(emailData);
      
      // Track email sent for analytics
      try {
        await analyticsService.trackEvent({
          userId: user._id,
          event: 'email_sent',
          properties: {
            type: 'password_reset',
            email: user.email
          }
        });
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError);
        // Don't fail email sending due to analytics error
      }

      return true;
    } catch (error) {
      console.error('Password reset email error:', error);
      return false;
    }
  }

  /**
   * Core email sending function
   */
  async sendEmail(emailData) {
    const mailOptions = {
      from: `"SecondMarket" <${process.env.SMTP_USER || 'noreply@budmatching.com'}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.htmlToText(emailData.html)
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Automated email campaigns
   */
  async runAutomatedCampaigns() {
    try {
      // Send promotion suggestions for listings with low views
      await this.sendLowViewsAlerts();
      
      // Send re-engagement emails to inactive users
      await this.sendReEngagementCampaign();
      
      // Send subscription upsells to eligible users
      await this.sendSubscriptionUpsells();
      
      console.log('Automated email campaigns completed');
    } catch (error) {
      console.error('Automated campaigns error:', error);
    }
  }

  /**
   * Send low views alerts automatically
   */
  async sendLowViewsAlerts() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const listings = await ProductListing.find({
      createdAt: { $lte: twoDaysAgo },
      views: { $lt: 10 },
      status: 'available',
      lowViewsEmailSent: { $ne: true }
    }).populate('user', 'email name');

    for (const listing of listings) {
      await this.sendLowViewsAlert(listing.user, listing);
      
      // Mark as sent to avoid duplicates
      await ProductListing.findByIdAndUpdate(listing._id, {
        lowViewsEmailSent: true
      });
    }
  }

  /**
   * Send re-engagement campaign
   */
  async sendReEngagementCampaign() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = await User.find({
      lastActive: { $lte: thirtyDaysAgo },
      reEngagementEmailSent: { $ne: true }
    });

    for (const user of inactiveUsers) {
      const offerData = {
        discount: 30,
        code: `COMEBACK${user._id.toString().slice(-4).toUpperCase()}`
      };
      
      await this.sendReEngagementEmail(user, offerData);
      
      // Mark as sent
      await User.findByIdAndUpdate(user._id, {
        reEngagementEmailSent: true
      });
    }
  }

  /**
   * Send subscription upsells
   */
  async sendSubscriptionUpsells() {
    const eligibleUsers = await User.find({
      subscriptionTier: 'basic',
      createdAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7 days old
      subscriptionUpsellSent: { $ne: true }
    });

    for (const user of eligibleUsers) {
      const listingsCount = await ProductListing.countDocuments({ user: user._id });
      
      if (listingsCount >= 3) {
        const upsellData = {
          recommended: 'pro',
          savings: '₹200/month vs individual promotions',
          features: ['Unlimited listings', '2 free promotions', 'Priority support']
        };
        
        await this.sendSubscriptionUpsell(user, upsellData);
        
        // Mark as sent
        await User.findByIdAndUpdate(user._id, {
          subscriptionUpsellSent: true
        });
      }
    }
  }

  /**
   * Convert HTML to plain text
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  /**
   * Email templates
   */
  getWelcomeTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SecondMarket</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to SecondMarket!</h1>
                <p>Your journey to smart buying and selling starts here</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 👋</h2>
                <p>Welcome to India's smartest marketplace platform! We're excited to have you join our growing community of smart buyers and sellers.</p>
                
                <h3>🚀 Get Started in 3 Easy Steps:</h3>
                <ol>
                    <li><strong>Complete your profile</strong> - Add a photo and verify your phone number</li>
                    <li><strong>Create your first listing</strong> - List items you want to sell</li>
                    <li><strong>Start browsing</strong> - Find amazing deals near you</li>
                </ol>
                
                <h3>💰 Pro Tip for Sellers:</h3>
                <p>Listings with photos get <strong>5x more views</strong> and sell <strong>3x faster</strong>. Use our promotion packages to boost visibility even more!</p>
                
                <a href="${process.env.CLIENT_URL}/profile" class="button">Complete Your Profile</a>
                
                <p>If you have any questions, just reply to this email. We're here to help! 💬</p>
                
                <p>Happy buying and selling!<br>
                The SecondMarket Team</p>
            </div>
            <div class="footer">
                <p>SecondMarket - India's Smart Marketplace Platform</p>
                <p>Need help? Contact us at support@budmatching.com</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getPromotionSuggestionTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Boost Your Listing</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .stats-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .discount { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📈 Boost Your Listing Visibility</h1>
                <p>Get 3x more views with our promotion packages</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 👋</h2>
                
                <div class="stats-box">
                    <h3>Your Listing: "{{listingTitle}}"</h3>
                    <p><strong>Current Views:</strong> {{listingViews}}</p>
                    <p style="color: #d97706; font-weight: bold;">{{suggestionReason}}</p>
                </div>
                
                <h3>🎯 Recommended: {{suggestionPackage}} Package</h3>
                <p>Our data shows that similar listings with {{suggestionPackage}} promotions get:</p>
                <ul>
                    <li>✅ <strong>300% more views</strong></li>
                    <li>✅ <strong>5x more inquiries</strong></li>
                    <li>✅ <strong>Sell 3x faster</strong></li>
                </ul>
                
                <div class="discount">🎁 Limited Time: {{discountPercent}}% OFF</div>
                
                <a href="{{listingUrl}}" class="button">Promote My Listing Now</a>
                
                <p><small>💡 Tip: Promoted listings appear at the top of search results and in our spotlight section.</small></p>
                
                <p>Best regards,<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getListingApprovedTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Listing Approved</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Your Listing is Live!</h1>
                <p>Congratulations! Your listing has been approved</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 🎉</h2>
                <p>Great news! Your listing "<strong>{{listingTitle}}</strong>" has been approved and is now live on SecondMarket.</p>
                
                <h3>📊 To maximize your success:</h3>
                <ul>
                    <li>Respond quickly to buyer inquiries (within 2 hours)</li>
                    <li>Keep your listing updated with accurate information</li>
                    <li>Consider promoting your listing for better visibility</li>
                </ul>
                
                <a href="{{listingUrl}}" class="button">View My Listing</a>
                
                <p>We'll notify you immediately when someone shows interest in your listing!</p>
                
                <p>Happy selling!<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getLowViewsTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Boost Your Listing Views</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>👀 Your Listing Needs Attention</h1>
                <p>Let's get more eyes on your listing</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 📊</h2>
                
                <div class="alert-box">
                    <h3>Listing Performance Alert</h3>
                    <p><strong>Listing:</strong> "{{listingTitle}}"</p>
                    <p><strong>Days Active:</strong> {{daysSince}} days</p>
                    <p><strong>Current Views:</strong> {{currentViews}}</p>
                    <p style="color: #dc2626;"><strong>Status:</strong> Below average visibility</p>
                </div>
                
                <h3>🚀 Quick fixes to boost your listing:</h3>
                <ol>
                    <li><strong>Add more photos</strong> - Listings with 5+ photos get 400% more views</li>
                    <li><strong>Update your title</strong> - Include brand, model, and key features</li>
                    <li><strong>Adjust your price</strong> - Check similar listings in your area</li>
                    <li><strong>Promote your listing</strong> - Get instant visibility boost</li>
                </ol>
                
                <a href="{{listingUrl}}" class="button">Improve My Listing</a>
                
                <p><small>💡 Pro tip: Promoted listings get 10x more views and sell 5x faster!</small></p>
                
                <p>Need help? Just reply to this email.</p>
                
                <p>Best regards,<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getNewMessageTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Message</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .message-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💬 New Message!</h1>
                <p>Someone is interested in your listing</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 🎉</h2>
                <p>You have a new message about your listing "<strong>{{listingTitle}}</strong>".</p>
                
                <div class="message-box">
                    <h4>From: {{senderName}}</h4>
                    <p>"{{messageContent}}"</p>
                    <small>Received: {{messageTime}}</small>
                </div>
                
                <p><strong>💡 Quick response tip:</strong> Respond within 2 hours to increase your chances of making a sale by 70%!</p>
                
                <a href="{{messageUrl}}" class="button">Reply Now</a>
                
                <p>Happy selling!<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getPaymentSuccessTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Payment Successful</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success-box { background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Payment Successful!</h1>
                <p>Your promotion is now active</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 🎉</h2>
                
                <div class="success-box">
                    <h3>✅ Promotion Activated</h3>
                    <p><strong>Package:</strong> {{packageName}}</p>
                    <p><strong>Duration:</strong> {{duration}} days</p>
                    <p><strong>Amount Paid:</strong> ₹{{amount}}</p>
                    <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                </div>
                
                <h3>🚀 What happens next:</h3>
                <ul>
                    <li>Your listing will appear in the spotlight section</li>
                    <li>You'll get priority placement in search results</li>
                    <li>Expect 3-5x more views starting immediately</li>
                    <li>We'll send you daily performance updates</li>
                </ul>
                
                <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Dashboard</a>
                
                <p>Thank you for choosing SecondMarket! 🙏</p>
                
                <p>Best regards,<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getWeeklyDigestTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Weekly Summary</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Your Weekly Summary</h1>
                <p>Here's how you performed this week</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 📈</h2>
                
                <div class="stats-grid">
                    <div class="stat-box">
                        <h3>{{weeklyViews}}</h3>
                        <p>Total Views</p>
                    </div>
                    <div class="stat-box">
                        <h3>{{weeklyMessages}}</h3>
                        <p>New Messages</p>
                    </div>
                    <div class="stat-box">
                        <h3>{{newListings}}</h3>
                        <p>New Listings</p>
                    </div>
                    <div class="stat-box">
                        <h3>₹{{earnings}}</h3>
                        <p>Earnings</p>
                    </div>
                </div>
                
                <h3>🎯 This Week's Tips:</h3>
                <ul>
                    <li>Reply to messages within 2 hours for better conversion</li>
                    <li>Add more photos to increase listing views by 400%</li>
                    <li>Consider promoting your best listings</li>
                </ul>
                
                <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Full Dashboard</a>
                
                <p>Keep up the great work!</p>
                
                <p>Best regards,<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getReEngagementTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>We Miss You!</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .offer-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .code { background: #ef4444; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; letter-spacing: 2px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎁 We Miss You!</h1>
                <p>Come back with a special offer</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 👋</h2>
                <p>It's been {{daysSince}} days since we last saw you on SecondMarket. We miss you and want you back! 💔</p>
                
                <div class="offer-box">
                    <h3>🎉 Welcome Back Offer</h3>
                    <h2 style="color: #f59e0b; margin: 15px 0;">{{offerDiscount}}% OFF</h2>
                    <p>All promotion packages</p>
                    <div class="code">{{offerCode}}</div>
                    <p><small>Valid for 7 days only</small></p>
                </div>
                
                <h3>🆕 What's New:</h3>
                <ul>
                    <li>Faster payment processing</li>
                    <li>New promotion packages</li>
                    <li>Better search algorithm</li>
                    <li>Mobile app improvements</li>
                </ul>
                
                <a href="${process.env.CLIENT_URL}?promo={{offerCode}}" class="button">Claim My Offer</a>
                
                <p>Don't miss out - this offer expires soon! ⏰</p>
                
                <p>We can't wait to see you back!<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getPasswordResetTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .security-box { background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .token-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
                <p>Secure password reset for your SecondMarket account</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 👋</h2>
                <p>We received a request to reset your password for your SecondMarket account ({{userEmail}}).</p>
                
                <div class="security-box">
                    <h3>🔒 Security Notice</h3>
                    <p><strong>This link expires in 10 minutes</strong> for your security.</p>
                    <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                
                <h3>🚀 Reset Your Password:</h3>
                <p>Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{{resetUrl}}" class="button">Reset My Password</a>
                </div>
                
                <h3>📱 Alternative Method:</h3>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="token-box">{{resetUrl}}</div>
                
                <p><strong>⏰ Important:</strong> This link will expire in 10 minutes for security reasons. If it expires, you'll need to request a new password reset.</p>
                
                <h3>🛡️ Security Tips:</h3>
                <ul>
                    <li>Use a strong, unique password</li>
                    <li>Include uppercase, lowercase, numbers, and symbols</li>
                    <li>Don't share your password with anyone</li>
                    <li>Consider using a password manager</li>
                </ul>
                
                <p>If you're having trouble, reply to this email and we'll help you out! 💬</p>
                
                <p>Stay secure!<br>
                The SecondMarket Team</p>
            </div>
            <div class="footer">
                <p>SecondMarket - India's Smart Marketplace Platform</p>
                <p>If you didn't request this reset, please contact us immediately at security@budmatching.com</p>
                <p>This email was sent to {{userEmail}}</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  getSubscriptionUpsellTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Upgrade to Pro</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .comparison { background: #f0fdf4; border: 1px solid #10b981; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .savings { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Upgrade to {{recommendedTier}}</h1>
                <p>Save money and get more features</p>
            </div>
            <div class="content">
                <h2>Hi {{userName}}! 📈</h2>
                <p>Based on your activity, upgrading to <strong>{{recommendedTier}}</strong> will save you money and unlock powerful features!</p>
                
                <div class="comparison">
                    <h3>🔥 {{recommendedTier}} Features:</h3>
                    <p>{{features}}</p>
                    
                    <div class="savings">💰 {{savings}}</div>
                </div>
                
                <h3>✅ Why upgrade now?</h3>
                <ul>
                    <li>Save money on promotions</li>
                    <li>Get priority customer support</li>
                    <li>Access advanced analytics</li>
                    <li>Unlimited listing uploads</li>
                </ul>
                
                <a href="${process.env.CLIENT_URL}/subscription" class="button">Upgrade Now</a>
                
                <p><small>💡 You can cancel anytime. No long-term commitment required.</small></p>
                
                <p>Start saving today!</p>
                
                <p>Best regards,<br>
                The SecondMarket Team</p>
            </div>
        </div>
    </body>
    </html>`;
  }
}

export default new EmailService();
